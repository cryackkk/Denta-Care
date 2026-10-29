<?php
/**
 * API для получения списка записей (только для админа)
 * Admin Get Appointments API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';
require_admin(); // 403, если запрос не от администратора

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

try {
    $db = getDB();
    
    // Получение всех записей с полной информацией
    $stmt = $db->query("
        SELECT 
            a.appointment_id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.notes,
            a.created_at,
            u.full_name as patient_name,
            u.email as patient_email,
            u.phone as patient_phone,
            d.full_name as doctor_name,
            s.service_name,
            s.price
        FROM appointments a
        JOIN users u ON a.user_id = u.user_id
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN services s ON a.service_id = s.service_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ");
    
    $appointments = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments,
        'total' => count($appointments)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
