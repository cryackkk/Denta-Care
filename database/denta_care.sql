-- ======================================
-- БАЗА ДАННЫХ DENTA CARE
-- Стоматологическая клиника
-- ======================================

-- Создание базы данных (utf8mb4: кириллица и эмодзи без проблем)
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS denta_care CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE denta_care;

-- ======================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ======================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- ======================================
-- ТАБЛИЦА ДОКТОРОВ
-- ======================================
CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    `rank` VARCHAR(50),
    experience_years INT NOT NULL,
    education TEXT,
    achievements TEXT,
    photo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление докторов
INSERT INTO doctors (full_name, specialization, `rank`, experience_years, education, achievements, photo_url) VALUES
('Доктор Ли', 'Эстетическая стоматология', 'SSS-ранг', 15, 'Trinity College Dublin, Стоматологический факультет. Сертификат специалиста Американской Академии Косметической Стоматологии', 'Победитель конкурса "Лучший стоматолог года" 2024. Автор 12 научных публикаций. Более 2000 успешных имплантаций', 'img/dr-lee.png'),
('Ли Младший', 'Терапевт', 'Стоматолог-терапевт', 5, 'Казахский Национальный Медицинский Университет. Сертификация по эндодонтии', NULL, 'img/lee-jr.png'),
('Джессика', 'Ортодонт', 'Стоматолог-ортодонт', 2, 'Казахский Национальный Медицинский Университет. Специализация по ортодонтии, Dublin Dental School', NULL, 'img/jessica.png'),
('Доктор Ванс', 'Хирург-имплантолог', 'Хирург-стоматолог', 23, 'Trinity College Dublin, специализация челюстно-лицевая хирургия. Сертификат Европейской Ассоциации Имплантологов', 'Более 5000 успешных операций. Эксперт в сложных клинических случаях. Автор 25 научных публикаций', 'img/vance.png');

-- ======================================
-- ТАБЛИЦА УСЛУГ
-- ======================================
CREATE TABLE services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    INDEX idx_doctor (doctor_id)
);

-- Добавление услуг для Доктора Ли (doctor_id = 1)
INSERT INTO services (doctor_id, service_name, description, price, duration_minutes) VALUES
(1, 'Консультация', 'Первичный осмотр, диагностика, составление плана лечения', 10000.00, 30),
(1, 'Виниры E-max (1 зуб)', 'Керамические виниры премиум-класса, изготовление и установка', 120000.00, 120),
(1, 'Люминиры (1 зуб)', 'Ультратонкие керамические накладки без обточки', 150000.00, 120),
(1, 'Художественная реставрация зуба', 'Восстановление формы и цвета композитными материалами', 35000.00, 90),
(1, 'Hollywood Smile (полная реставрация)', 'Комплексная реставрация улыбки с винирами на 20 зубов', 2200000.00, 600),
(1, 'Имплантация премиум (Nobel Biocare)', 'Шведский имплант с коронкой из диоксида циркония', 400000.00, 180),
(1, 'Эстетическая коррекция десны', 'Контурирование десны лазером для идеальной улыбки', 80000.00, 60);

-- Добавление услуг для Ли Младший (doctor_id = 2)
INSERT INTO services (doctor_id, service_name, description, price, duration_minutes) VALUES
(2, 'Лечение кариеса (простой)', 'Препарирование, пломбирование композитным материалом', 15000.00, 45),
(2, 'Лечение кариеса (средний)', 'Более глубокое поражение, требует дополнительной обработки', 22000.00, 60),
(2, 'Лечение каналов (1 канал)', 'Эндодонтическое лечение, механическая и медикаментозная обработка', 25000.00, 90),
(2, 'Профессиональная чистка зубов', 'Удаление зубного камня, полировка, фторирование', 12000.00, 60),
(2, 'Отбеливание зубов (система ZOOM)', 'Клиническое отбеливание последнего поколения', 80000.00, 90),
(2, 'Консультация', 'Первичный осмотр и диагностика', 5000.00, 20);

-- Добавление услуг для Джессики (doctor_id = 3)
INSERT INTO services (doctor_id, service_name, description, price, duration_minutes) VALUES
(3, 'Консультация ортодонта', 'Первичный осмотр, составление плана лечения', 8000.00, 30),
(3, 'Металлические брекеты (1 челюсть)', 'Установка классической брекет-системы', 180000.00, 120),
(3, 'Керамические брекеты (1 челюсть)', 'Эстетичная брекет-система под цвет зубов', 250000.00, 120),
(3, 'Элайнеры (полный курс)', 'Невидимые капы для исправления прикуса, комплект на весь период лечения', 450000.00, 90),
(3, 'Коррекция брекет-системы', 'Ежемесячное посещение, замена дуг и лигатур', 15000.00, 30),
(3, 'Ретейнеры (после снятия брекетов)', 'Фиксация результата лечения', 45000.00, 60);

-- Добавление услуг для Доктора Ванса (doctor_id = 4)
INSERT INTO services (doctor_id, service_name, description, price, duration_minutes) VALUES
(4, 'Консультация хирурга', 'Осмотр, КТ-диагностика, составление плана лечения', 10000.00, 40),
(4, 'Удаление зуба (простое)', 'Экстракция подвижного зуба', 8000.00, 30),
(4, 'Удаление зуба мудрости', 'Сложное удаление ретинированного зуба', 35000.00, 60),
(4, 'Имплант Premium (Straumann, Nobel)', 'Швейцарский/шведский имплант под ключ с коронкой', 350000.00, 180),
(4, 'Синус-лифтинг (открытый)', 'Костная пластика верхней челюсти', 180000.00, 120),
(4, 'Костная пластика (НКР)', 'Направленная костная регенерация', 120000.00, 90),
(4, 'Резекция верхушки корня', 'Микрохирургическая операция для сохранения зуба', 65000.00, 90);

-- ======================================
-- ТАБЛИЦА ЗАПИСЕЙ НА ПРИЁМ
-- ======================================
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);

-- ======================================
-- ТАБЛИЦА ПЛАТЕЖЕЙ
-- ======================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    appointment_id INT,
    service_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('card', 'cash', 'transfer') DEFAULT 'card',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    card_last4 VARCHAR(4),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status),
    INDEX idx_date (payment_date)
);

-- ======================================
-- ТАБЛИЦА ОТЗЫВОВ
-- ======================================
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    INDEX idx_doctor (doctor_id),
    INDEX idx_rating (rating)
);

-- ======================================
-- ТАБЛИЦА РАСПИСАНИЯ ДОКТОРОВ
-- ======================================
CREATE TABLE doctor_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    INDEX idx_doctor (doctor_id),
    INDEX idx_day (day_of_week)
);

-- Добавление расписания для докторов (пример)
INSERT INTO doctor_schedule (doctor_id, day_of_week, start_time, end_time) VALUES
-- Доктор Ли
(1, 'Monday', '09:00:00', '18:00:00'),
(1, 'Tuesday', '09:00:00', '18:00:00'),
(1, 'Wednesday', '09:00:00', '18:00:00'),
(1, 'Thursday', '09:00:00', '18:00:00'),
(1, 'Friday', '09:00:00', '17:00:00'),
-- Ли Младший
(2, 'Monday', '10:00:00', '19:00:00'),
(2, 'Tuesday', '10:00:00', '19:00:00'),
(2, 'Wednesday', '10:00:00', '19:00:00'),
(2, 'Thursday', '10:00:00', '19:00:00'),
(2, 'Friday', '10:00:00', '18:00:00'),
(2, 'Saturday', '10:00:00', '15:00:00'),
-- Джессика
(3, 'Tuesday', '11:00:00', '19:00:00'),
(3, 'Wednesday', '11:00:00', '19:00:00'),
(3, 'Thursday', '11:00:00', '19:00:00'),
(3, 'Friday', '11:00:00', '18:00:00'),
(3, 'Saturday', '10:00:00', '14:00:00'),
-- Доктор Ванс
(4, 'Monday', '08:00:00', '17:00:00'),
(4, 'Tuesday', '08:00:00', '17:00:00'),
(4, 'Wednesday', '08:00:00', '17:00:00'),
(4, 'Thursday', '08:00:00', '17:00:00'),
(4, 'Friday', '08:00:00', '16:00:00');

-- ======================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ======================================

-- Представление для активных докторов с услугами
CREATE VIEW active_doctors_with_services AS
SELECT 
    d.doctor_id,
    d.full_name,
    d.specialization,
    d.rank,
    d.experience_years,
    COUNT(s.service_id) as service_count,
    MIN(s.price) as min_price,
    MAX(s.price) as max_price
FROM doctors d
LEFT JOIN services s ON d.doctor_id = s.doctor_id AND s.is_active = TRUE
WHERE d.is_active = TRUE
GROUP BY d.doctor_id;

-- Представление для предстоящих записей
CREATE VIEW upcoming_appointments AS
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    u.full_name as patient_name,
    u.phone as patient_phone,
    d.full_name as doctor_name,
    s.service_name,
    s.price,
    s.duration_minutes
FROM appointments a
JOIN users u ON a.user_id = u.user_id
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN services s ON a.service_id = s.service_id
WHERE a.appointment_date >= CURDATE()
    AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_date, a.appointment_time;

-- Представление для статистики платежей
CREATE VIEW payment_statistics AS
SELECT 
    DATE(payment_date) as payment_day,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    payment_status
FROM payments
GROUP BY DATE(payment_date), payment_status;

-- ======================================
-- ХРАНИМЫЕ ПРОЦЕДУРЫ
-- ======================================

-- Процедура для создания записи на приём
DELIMITER //
CREATE PROCEDURE create_appointment(
    IN p_user_id INT,
    IN p_doctor_id INT,
    IN p_service_id INT,
    IN p_date DATE,
    IN p_time TIME,
    OUT p_appointment_id INT
)
BEGIN
    -- Проверка доступности времени
    DECLARE slot_taken INT;
    
    SELECT COUNT(*) INTO slot_taken
    FROM appointments
    WHERE doctor_id = p_doctor_id
        AND appointment_date = p_date
        AND appointment_time = p_time
        AND status IN ('pending', 'confirmed');
    
    IF slot_taken > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Это время уже занято';
    ELSE
        INSERT INTO appointments (user_id, doctor_id, service_id, appointment_date, appointment_time)
        VALUES (p_user_id, p_doctor_id, p_service_id, p_date, p_time);
        
        SET p_appointment_id = LAST_INSERT_ID();
    END IF;
END //
DELIMITER ;

-- Процедура для обработки платежа
DELIMITER //
CREATE PROCEDURE process_payment(
    IN p_user_id INT,
    IN p_service_id INT,
    IN p_appointment_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_card_last4 VARCHAR(4),
    OUT p_payment_id INT
)
BEGIN
    INSERT INTO payments (user_id, appointment_id, service_id, amount, card_last4, payment_status, transaction_id)
    VALUES (p_user_id, p_appointment_id, p_service_id, p_amount, p_card_last4, 'completed', UUID());
    
    SET p_payment_id = LAST_INSERT_ID();
    
    -- Обновление статуса записи
    IF p_appointment_id IS NOT NULL THEN
        UPDATE appointments SET status = 'confirmed' WHERE appointment_id = p_appointment_id;
    END IF;
END //
DELIMITER ;

-- ======================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ======================================

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_appointment_datetime ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_payment_user_date ON payments(user_id, payment_date);
CREATE INDEX idx_service_doctor_active ON services(doctor_id, is_active);

-- ======================================
-- ТЕСТОВЫЕ ДАННЫЕ (ОПЦИОНАЛЬНО)
-- ======================================

-- Хеш bcrypt для пароля "password" (создан через password_hash('password', PASSWORD_BCRYPT))
SET @pwd = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Тестовый пользователь:  test@example.com / password
INSERT INTO users (full_name, email, phone, birth_date, password_hash) VALUES
('Тестовый Пользователь', 'test@example.com', '+7 (700) 000-00-01', '1990-01-01', @pwd);

-- Администратор:  логин admin / пароль password  (вход: admin-login.html)
INSERT INTO users (full_name, email, phone, birth_date, password_hash, is_admin) VALUES
('Администратор', 'admin', '+7 (700) 000-00-02', '1990-01-01', @pwd, TRUE);

-- База данных готова к использованию!
