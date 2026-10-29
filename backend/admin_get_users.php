<?php
/**
 * API для получения списка пользователей (только для админа)
 * Admin Get Users API
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
    
    // Получение всех пользователей
    $stmt = $db->query("
        SELECT 
            user_id,
            full_name,
            email,
            phone,
            birth_date,
            created_at,
            last_login,
            is_active
        FROM users
        ORDER BY created_at DESC
    ");
    
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'total' => count($users)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
