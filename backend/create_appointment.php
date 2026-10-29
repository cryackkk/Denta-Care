<?php
/**
 * API для создания записи на приём
 * Create Appointment API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

$user_id = require_login(); // кто записывается, определяет сервер (сессия), а не браузер

$input = json_decode(file_get_contents('php://input'), true);

// Валидация данных
$required = ['doctor_id', 'service_id', 'appointment_date', 'appointment_time'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Поле $field обязательно"]);
        exit;
    }
}

try {
    $db = getDB();
    
    // Услуга должна принадлежать выбранному врачу
    $stmt = $db->prepare("SELECT 1 FROM services WHERE service_id = ? AND doctor_id = ? AND is_active = TRUE");
    $stmt->execute([$input['service_id'], $input['doctor_id']]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Выбранная услуга не относится к этому врачу']);
        exit;
    }

    // Проверка, что время не занято
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM appointments
        WHERE doctor_id = ?
            AND appointment_date = ?
            AND appointment_time = ?
            AND status IN ('pending', 'confirmed')
    ");
    
    $stmt->execute([
        $input['doctor_id'],
        $input['appointment_date'],
        $input['appointment_time']
    ]);
    
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Это время уже занято. Пожалуйста, выберите другое время.',
            'time_slot_taken' => true
        ]);
        exit;
    }
    
    // Создание записи
    $stmt = $db->prepare("
        INSERT INTO appointments (
            user_id,
            doctor_id,
            service_id,
            appointment_date,
            appointment_time,
            notes,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $user_id,
        $input['doctor_id'],
        $input['service_id'],
        $input['appointment_date'],
        $input['appointment_time'],
        $input['notes'] ?? ''
    ]);
    
    $appointment_id = $db->lastInsertId();
    
    // Успешное создание
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Запись успешно создана',
        'appointment_id' => $appointment_id,
        'appointment_date' => $input['appointment_date'],
        'appointment_time' => $input['appointment_time']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
