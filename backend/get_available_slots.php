<?php
/**
 * API для получения доступных временных слотов
 * Get Available Time Slots API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

$doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : 0;
$date = isset($_GET['date']) ? $_GET['date'] : '';

if (!$doctor_id || !$date) {
    http_response_code(400);
    echo json_encode(['error' => 'Необходимо указать doctor_id и date']);
    exit;
}

try {
    $db = getDB();
    
    // Получение занятых слотов
    $stmt = $db->prepare("
        SELECT appointment_time 
        FROM appointments 
        WHERE doctor_id = ? 
            AND appointment_date = ? 
            AND status IN ('pending', 'confirmed')
    ");
    
    $stmt->execute([$doctor_id, $date]);
    $bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'date' => $date,
        'doctor_id' => $doctor_id,
        'booked_slots' => $bookedSlots
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
