<?php
/**
 * API для входа пользователей
 * User Login API
 *
 * Принимает email (у администратора вместо email стоит логин "admin") и пароль.
 * Пароль проверяется через password_verify против bcrypt-хеша в таблице users.
 * После успешного входа сервер создаёт сессию и запоминает, админ ли это
 * (колонка users.is_admin). Админские эндпоинты проверяют именно сессию.
 */

header('Content-Type: application/json');

require_once 'db_connect.php';
require_once 'auth.php';

// Обработка только POST запросов
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получение данных
$input = json_decode(file_get_contents('php://input'), true);

// Валидация
if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email и пароль обязательны']);
    exit;
}

try {
    $db = getDB();
    
    // Поиск пользователя
    $stmt = $db->prepare("
        SELECT user_id, full_name, email, phone, password_hash, is_active, is_admin 
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный email или пароль']);
        exit;
    }
    
    // Проверка активности аккаунта
    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Аккаунт заблокирован']);
        exit;
    }
    
    // Проверка пароля
    if (!password_verify($input['password'], $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный email или пароль']);
        exit;
    }
    
    // Обновление времени последнего входа
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    
    // Создание сессии (новый id сессии защищает от session fixation)
    start_app_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['user_id'];
    $_SESSION['is_admin'] = (bool) $user['is_admin'];

    $isAdmin = (bool) $user['is_admin'];

    // Успешный вход
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Вход выполнен успешно',
        'is_admin' => $isAdmin,
        'user' => [
            'user_id' => $user['user_id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'phone' => $user['phone']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
