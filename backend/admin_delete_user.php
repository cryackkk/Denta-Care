<?php
/**
 * API для удаления пользователя (только для админа)
 * Admin Delete User API
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

if (empty($input['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Необходимо указать user_id']);
    exit;
}

try {
    $db = getDB();
    
    // Удаление пользователя (каскадное удаление связанных записей)
    $stmt = $db->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$input['user_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Пользователь успешно удалён',
        'user_id' => $input['user_id']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
