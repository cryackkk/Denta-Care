// booking-page.js - Страница записи на приём

// Данные услуг по докторам
const doctorServices = {
    1: [
        { id: 1, name: 'Консультация', price: 10000, duration: 30 },
        { id: 2, name: 'Виниры E-max (1 зуб)', price: 120000, duration: 120 },
        { id: 3, name: 'Люминиры (1 зуб)', price: 150000, duration: 120 },
        { id: 4, name: 'Художественная реставрация зуба', price: 35000, duration: 90 },
        { id: 5, name: 'Hollywood Smile (полная реставрация)', price: 2200000, duration: 600 },
        { id: 6, name: 'Имплантация премиум (Nobel Biocare)', price: 400000, duration: 180 },
        { id: 7, name: 'Эстетическая коррекция десны', price: 80000, duration: 60 }
    ],
    2: [
        { id: 8, name: 'Лечение кариеса (простой)', price: 15000, duration: 45 },
        { id: 9, name: 'Лечение кариеса (средний)', price: 22000, duration: 60 },
        { id: 10, name: 'Лечение каналов (1 канал)', price: 25000, duration: 90 },
        { id: 11, name: 'Профессиональная чистка зубов', price: 12000, duration: 60 },
        { id: 12, name: 'Отбеливание зубов (система ZOOM)', price: 80000, duration: 90 },
        { id: 13, name: 'Консультация', price: 5000, duration: 20 }
    ],
    3: [
        { id: 14, name: 'Консультация ортодонта', price: 8000, duration: 30 },
        { id: 15, name: 'Металлические брекеты (1 челюсть)', price: 180000, duration: 120 },
        { id: 16, name: 'Керамические брекеты (1 челюсть)', price: 250000, duration: 120 },
        { id: 17, name: 'Элайнеры (полный курс)', price: 450000, duration: 90 },
        { id: 18, name: 'Коррекция брекет-системы', price: 15000, duration: 30 },
        { id: 19, name: 'Ретейнеры (после снятия брекетов)', price: 45000, duration: 60 }
    ],
    4: [
        { id: 20, name: 'Консультация хирурга', price: 10000, duration: 40 },
        { id: 21, name: 'Удаление зуба (простое)', price: 8000, duration: 30 },
        { id: 22, name: 'Удаление зуба мудрости', price: 35000, duration: 60 },
        { id: 23, name: 'Имплант Premium (Straumann, Nobel)', price: 350000, duration: 180 },
        { id: 24, name: 'Синус-лифтинг (открытый)', price: 180000, duration: 120 },
        { id: 25, name: 'Костная пластика (НКР)', price: 120000, duration: 90 },
        { id: 26, name: 'Резекция верхушки корня', price: 65000, duration: 90 }
    ]
};

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    // Загрузка данных пациента
    loadPatientData();
    
    // Получаем ID доктора из URL
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctor');
    
    if (doctorId) {
        document.getElementById('doctorSelect').value = doctorId;
        loadDoctorServices();
    }
    
    // Устанавливаем минимальную дату (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('appointmentDate').min = tomorrow.toISOString().split('T')[0];
});

function loadPatientData() {
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');
    const userEmail = localStorage.getItem('userEmail');
    
    document.getElementById('patientName').textContent = userName || 'Не указано';
    document.getElementById('patientPhone').textContent = userPhone || 'Не указано';
    document.getElementById('patientEmail').textContent = userEmail || 'Не указано';
}

function loadDoctorServices() {
    const doctorId = document.getElementById('doctorSelect').value;
    const serviceSelect = document.getElementById('serviceSelect');
    
    if (!doctorId) {
        serviceSelect.innerHTML = '<option value="">-- Сначала выберите доктора --</option>';
        document.getElementById('servicePrice').textContent = '0 ₸';
        return;
    }
    
    const services = doctorServices[doctorId];
    serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - ${service.price.toLocaleString()} ₸`;
        option.dataset.price = service.price;
        option.dataset.duration = service.duration;
        option.dataset.serviceName = service.name;
        serviceSelect.appendChild(option);
    });
}

function updateServicePrice() {
    const serviceSelect = document.getElementById('serviceSelect');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    
    if (selectedOption.value) {
        const price = parseInt(selectedOption.dataset.price);
        document.getElementById('servicePrice').textContent = price.toLocaleString() + ' ₸';
    } else {
        document.getElementById('servicePrice').textContent = '0 ₸';
    }
}

async function loadAvailableSlots() {
    const doctorId = document.getElementById('doctorSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const timeSelect = document.getElementById('timeSelect');
    
    if (!doctorId || !date) {
        timeSelect.innerHTML = '<option value="">-- Выберите доктора и дату --</option>';
        return;
    }
    
    try {
        // Получаем занятые слоты
        const response = await fetch(`backend/get_available_slots.php?doctor_id=${doctorId}&date=${date}`);
        const data = await response.json();
        
        const bookedSlots = data.booked_slots || [];
        
        // Генерируем временные слоты (8:00 - 20:00)
        timeSelect.innerHTML = '<option value="">-- Выберите время --</option>';
        
        for (let hour = 8; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                const option = document.createElement('option');
                option.value = timeStr;
                
                // Проверяем, занято ли это время
                if (bookedSlots.includes(timeStr)) {
                    option.textContent = `${timeStr} - ЗАНЯТО`;
                    option.disabled = true;
                    option.style.color = '#999';
                } else {
                    option.textContent = timeStr;
                }
                
                timeSelect.appendChild(option);
            }
        }
        
    } catch (error) {
        console.error('Ошибка загрузки слотов:', error);
        alert('Не удалось загрузить доступное время');
    }
}

async function submitBooking(event) {
    event.preventDefault();
    
    const doctorId = document.getElementById('doctorSelect').value;
    const serviceSelect = document.getElementById('serviceSelect');
    const serviceId = serviceSelect.value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('timeSelect').value;
    const notes = document.getElementById('notes').value;
    const userId = localStorage.getItem('userId');
    
    if (!time) {
        alert('Пожалуйста, выберите время приёма');
        return;
    }
    
    const selectedService = serviceSelect.options[serviceSelect.selectedIndex];
    const bookingData = {
        user_id: userId,
        doctor_id: doctorId,
        service_id: serviceId,
        appointment_date: date,
        appointment_time: time,
        notes: notes,
        service_name: selectedService.dataset.serviceName,
        service_price: selectedService.dataset.price
    };
    
    try {
        const response = await fetch('backend/create_appointment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`✅ Запись успешно создана!

Детали записи:
Дата: ${date}
Время: ${time}
Услуга: ${selectedService.dataset.serviceName}
Стоимость: ${parseInt(selectedService.dataset.price).toLocaleString()} ₸

Ожидайте звонка для подтверждения.`);
            
            window.location.href = 'index.html';
        } else {
            alert('Ошибка записи: ' + (data.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка записи:', error);
        alert('Произошла ошибка при записи. Проверьте подключение к серверу.');
    }
}
