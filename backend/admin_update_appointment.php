<?php
/**
 * API для обновления статуса записи (только для админа)
 * Admin Update Appointment API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';
require_admin(); // 403, если запрос не от администратора

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['appointment_id']) || empty($input['status'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Необходимо указать appointment_id и status']);
    exit;
}

// Проверка допустимого статуса
$allowed_statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!in_array($input['status'], $allowed_statuses)) {
    http_response_code(400);
    echo json_encode(['error' => 'Недопустимый статус']);
    exit;
}

try {
    $db = getDB();
    
    $stmt = $db->prepare("
        UPDATE appointments 
        SET status = ?, updated_at = NOW()
        WHERE appointment_id = ?
    ");
    
    $stmt->execute([
        $input['status'],
        $input['appointment_id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Статус успешно обновлён',
        'appointment_id' => $input['appointment_id'],
        'new_status' => $input['status']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
