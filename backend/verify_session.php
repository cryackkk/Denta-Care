<?php
/**
 * API для проверки актуальности сессии пользователя
 * Verify Session API
 *
 * Вызывается на страницах сайта (js/auth.js), чтобы убедиться, что пользователь
 * из localStorage всё ещё вошёл на сервере, не удалён и не заблокирован.
 * Пользователь определяется по серверной сессии, а не по параметру из адреса:
 * иначе любой мог бы перебирать user_id и читать чужие имя, email и телефон.
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

start_app_session();

if (empty($_SESSION['user_id'])) {
    echo json_encode(['valid' => false, 'reason' => 'expired']);
    exit;
}

try {
    $db = getDB();

    $stmt = $db->prepare("
        SELECT user_id, full_name, email, phone, is_active
        FROM users
        WHERE user_id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        // Пользователь удалён из базы (например, администратором)
        $_SESSION = [];
        session_destroy();
        echo json_encode(['valid' => false, 'reason' => 'deleted']);
        exit;
    }

    if (!$user['is_active']) {
        // Аккаунт существует, но заблокирован
        $_SESSION = [];
        session_destroy();
        echo json_encode(['valid' => false, 'reason' => 'blocked']);
        exit;
    }

    // Сессия актуальна — возвращаем свежие данные пользователя
    echo json_encode([
        'valid' => true,
        'user' => [
            'user_id' => $user['user_id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'phone' => $user['phone']
        ]
    ]);

} catch (PDOException $e) {
    // При сбое базы не разлогиниваем пользователя принудительно
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['valid' => true, 'error' => 'db_unreachable']);
}
?>
