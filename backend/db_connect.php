<?php
/**
 * Файл подключения к базе данных
 * Database Connection for Denta Care
 */

// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'denta_care');
define('DB_USER', 'root');          // XAMPP: root без пароля. На реальном сервере создайте отдельного пользователя
define('DB_PASS', '');              // На реальном сервере обязательно задайте пароль
define('DB_CHARSET', 'utf8mb4');

// Класс для работы с базой данных
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            error_log($e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            die(json_encode(['error' => 'Не удалось подключиться к базе данных']));
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Предотвращение клонирования
    private function __clone() {}
    
    // Предотвращение десериализации
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Функция для получения соединения
function getDB() {
    return Database::getInstance()->getConnection();
}
?>
