<?php
/**
 * API для регистрации пользователей
 * User Registration API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';

// Обработка только POST запросов
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получение данных из запроса
$input = json_decode(file_get_contents('php://input'), true);

// Валидация данных
$required_fields = ['fullname', 'email', 'phone', 'birthdate', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Поле $field обязательно для заполнения"]);
        exit;
    }
}

// Валидация email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный формат email']);
    exit;
}

// Валидация телефона (простая проверка)
if (!preg_match('/^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/', $input['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный формат телефона']);
    exit;
}

try {
    $db = getDB();
    
    // Проверка существования пользователя
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$input['email'], $input['phone']]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Пользователь с таким email или телефоном уже существует']);
        exit;
    }
    
    // Хеширование пароля
    $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
    
    // Добавление пользователя
    $stmt = $db->prepare("
        INSERT INTO users (full_name, email, phone, birth_date, password_hash) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['fullname'],
        $input['email'],
        $input['phone'],
        $input['birthdate'],
        $password_hash
    ]);
    
    $user_id = $db->lastInsertId();
    
    // Успешный ответ
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Регистрация прошла успешно',
        'user_id' => $user_id,
        'email' => $input['email']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
