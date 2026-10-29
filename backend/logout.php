<?php
/**
 * Выход из аккаунта: уничтожает сессию на сервере.
 */
header('Content-Type: application/json');
require_once 'auth.php';

start_app_session();
$_SESSION = [];
session_destroy();

echo json_encode(['success' => true]);
?>
