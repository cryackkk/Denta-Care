<?php
/**
 * API для получения списка докторов и услуг
 * Doctors and Services API
 */

header('Content-Type: application/json');

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

try {
    $db = getDB();
    
    // Получение ID доктора из параметров
    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : null;
    
    if ($doctor_id) {
        // Получение конкретного доктора с услугами
        $stmt = $db->prepare("
            SELECT 
                d.doctor_id,
                d.full_name,
                d.specialization,
                d.rank,
                d.experience_years,
                d.education,
                d.achievements,
                d.photo_url
            FROM doctors d
            WHERE d.doctor_id = ? AND d.is_active = TRUE
        ");
        $stmt->execute([$doctor_id]);
        $doctor = $stmt->fetch();
        
        if (!$doctor) {
            http_response_code(404);
            echo json_encode(['error' => 'Доктор не найден']);
            exit;
        }
        
        // Получение услуг доктора
        $stmt = $db->prepare("
            SELECT 
                service_id,
                service_name,
                description,
                price,
                duration_minutes
            FROM services
            WHERE doctor_id = ? AND is_active = TRUE
            ORDER BY price ASC
        ");
        $stmt->execute([$doctor_id]);
        $services = $stmt->fetchAll();
        
        $doctor['services'] = $services;
        
        echo json_encode([
            'success' => true,
            'doctor' => $doctor
        ]);
        
    } else {
        // Получение всех докторов
        $stmt = $db->query("
            SELECT 
                d.doctor_id,
                d.full_name,
                d.specialization,
                d.rank,
                d.experience_years,
                d.photo_url,
                COUNT(s.service_id) as service_count,
                MIN(s.price) as min_price,
                MAX(s.price) as max_price
            FROM doctors d
            LEFT JOIN services s ON d.doctor_id = s.doctor_id AND s.is_active = TRUE
            WHERE d.is_active = TRUE
            GROUP BY d.doctor_id
            ORDER BY d.experience_years DESC
        ");
        
        $doctors = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'doctors' => $doctors
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера. Попробуйте позже.']);
}
?>
