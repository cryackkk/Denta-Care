<?php
/**
 * API для получения списка платежей (только для админа)
 * Admin Get Payments API
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
    
    // Получение всех платежей с полной информацией
    $stmt = $db->query("
        SELECT 
            p.payment_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.card_last4,
            p.payment_date,
            u.full_name as patient_name,
            u.email as patient_email,
            s.service_name
        FROM payments p
        JOIN users u ON p.user_id = u.user_id
        JOIN services s ON p.service_id = s.service_id
        ORDER BY p.payment_date DESC
    ");
    
    $payments = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'payments' => $payments,
        'total' => count($payments)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
