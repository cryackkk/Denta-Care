<?php
/**
 * API для обработки платежей
 * Payment Processing API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

$user_id = require_login(); // платит тот, кто вошёл (сессия), а не user_id из браузера

$input = json_decode(file_get_contents('php://input'), true);

// Валидация данных
$required = ['service_id', 'amount', 'card_number'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Поле $field обязательно"]);
        exit;
    }
}

try {
    $db = getDB();
    
    // Если оплачивается запись на приём, она должна принадлежать этому пользователю
    if (!empty($input['appointment_id'])) {
        $stmt = $db->prepare("SELECT 1 FROM appointments WHERE appointment_id = ? AND user_id = ?");
        $stmt->execute([$input['appointment_id'], $user_id]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Эта запись вам не принадлежит']);
            exit;
        }
    }

    // Получение информации об услуге
    $stmt = $db->prepare("
        SELECT s.service_id, s.service_name, s.price, d.full_name as doctor_name
        FROM services s
        JOIN doctors d ON s.doctor_id = d.doctor_id
        WHERE s.service_id = ? AND s.is_active = TRUE
    ");
    $stmt->execute([$input['service_id']]);
    $service = $stmt->fetch();
    
    if (!$service) {
        http_response_code(404);
        echo json_encode(['error' => 'Услуга не найдена']);
        exit;
    }
    
    // Проверка суммы
    if (abs($input['amount'] - $service['price']) > 0.01) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверная сумма платежа']);
        exit;
    }
    
    // Получение последних 4 цифр карты
    $card_last4 = substr(preg_replace('/\s+/', '', $input['card_number']), -4);
    
    // Генерация ID транзакции
    $transaction_id = 'TXN' . time() . rand(1000, 9999);
    
    // Начало транзакции
    $db->beginTransaction();
    
    try {
        // Добавление платежа
        $stmt = $db->prepare("
            INSERT INTO payments (
                user_id, 
                service_id, 
                appointment_id,
                amount, 
                payment_method,
                payment_status,
                transaction_id,
                card_last4
            ) VALUES (?, ?, ?, ?, 'card', 'completed', ?, ?)
        ");
        
        $stmt->execute([
            $user_id,
            $input['service_id'],
            $input['appointment_id'] ?? null,
            $input['amount'],
            $transaction_id,
            $card_last4
        ]);
        
        $payment_id = $db->lastInsertId();
        
        // Если есть запись на приём, обновляем её статус
        if (!empty($input['appointment_id'])) {
            $stmt = $db->prepare("
                UPDATE appointments 
                SET status = 'confirmed' 
                WHERE appointment_id = ?
            ");
            $stmt->execute([$input['appointment_id']]);
        }
        
        $db->commit();
        
        // Успешный платеж
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Платеж успешно обработан',
            'payment_id' => $payment_id,
            'transaction_id' => $transaction_id,
            'amount' => $input['amount'],
            'service' => $service['service_name'],
            'doctor' => $service['doctor_name'],
            'card_last4' => $card_last4
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка обработки платежа. Попробуйте позже.']);
}
?>
