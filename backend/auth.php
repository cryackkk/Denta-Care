<?php
/**
 * Сессии и проверка прав доступа.
 *
 * Идея: браузеру нельзя доверять. Раньше «я админ» хранилось только в
 * localStorage, а это можно подделать в консоли за секунду. Теперь после
 * входа сервер запоминает пользователя в PHP-сессии (cookie PHPSESSID),
 * и каждый защищённый эндпоинт проверяет права сам.
 */

function start_app_session() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'httponly' => true,    // JS не может прочитать cookie сессии
            'samesite' => 'Lax',   // базовая защита от CSRF
        ]);
        session_start();
    }
}

function json_error($code, $message) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

/** Требует вход в аккаунт. Возвращает user_id из сессии. */
function require_login() {
    start_app_session();
    if (empty($_SESSION['user_id'])) {
        json_error(401, 'Необходимо войти в аккаунт');
    }
    return (int) $_SESSION['user_id'];
}

/** Требует права администратора. */
function require_admin() {
    start_app_session();
    if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
        json_error(403, 'Доступ запрещён. Только для администратора.');
    }
}
