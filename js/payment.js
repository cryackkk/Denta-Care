// payment.js - Обработка оплаты с правильной загрузкой услуг доктора

// Данные услуг по докторам
const doctorServices = {
    1: { // Доктор Ли
        name: 'Доктор Ли (SSS-ранг)',
        services: [
            { name: 'Консультация', price: 10000, id: 1 },
            { name: 'Виниры E-max (1 зуб)', price: 120000, id: 2 },
            { name: 'Люминиры (1 зуб)', price: 150000, id: 3 },
            { name: 'Художественная реставрация зуба', price: 35000, id: 4 },
            { name: 'Hollywood Smile (полная реставрация)', price: 2200000, id: 5 },
            { name: 'Имплантация премиум (Nobel Biocare)', price: 400000, id: 6 },
            { name: 'Эстетическая коррекция десны', price: 80000, id: 7 }
        ]
    },
    2: { // Ли Младший
        name: 'Ли Младший',
        services: [
            { name: 'Лечение кариеса (простой)', price: 15000, id: 8 },
            { name: 'Лечение кариеса (средний)', price: 22000, id: 9 },
            { name: 'Лечение каналов (1 канал)', price: 25000, id: 10 },
            { name: 'Профессиональная чистка зубов', price: 12000, id: 11 },
            { name: 'Отбеливание зубов (система ZOOM)', price: 80000, id: 12 },
            { name: 'Консультация', price: 5000, id: 13 }
        ]
    },
    3: { // Джессика
        name: 'Джессика',
        services: [
            { name: 'Консультация ортодонта', price: 8000, id: 14 },
            { name: 'Металлические брекеты (1 челюсть)', price: 180000, id: 15 },
            { name: 'Керамические брекеты (1 челюсть)', price: 250000, id: 16 },
            { name: 'Элайнеры (полный курс)', price: 450000, id: 17 },
            { name: 'Коррекция брекет-системы', price: 15000, id: 18 },
            { name: 'Ретейнеры (после снятия брекетов)', price: 45000, id: 19 }
        ]
    },
    4: { // Доктор Ванс
        name: 'Доктор Ванс',
        services: [
            { name: 'Консультация хирурга', price: 10000, id: 20 },
            { name: 'Удаление зуба (простое)', price: 8000, id: 21 },
            { name: 'Удаление зуба мудрости', price: 35000, id: 22 },
            { name: 'Имплант Premium (Straumann, Nobel)', price: 350000, id: 23 },
            { name: 'Синус-лифтинг (открытый)', price: 180000, id: 24 },
            { name: 'Костная пластика (НКР)', price: 120000, id: 25 },
            { name: 'Резекция верхушки корня', price: 65000, id: 26 }
        ]
    }
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
    
    // Получаем ID доктора из URL или localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let doctorId = urlParams.get('doctor') || localStorage.getItem('paymentDoctorId');
    
    if (!doctorId) {
        doctorId = '1'; // По умолчанию доктор Ли
    }
    
    loadDoctorData(doctorId);
});

function loadDoctorData(doctorId) {
    const doctor = doctorServices[doctorId];
    
    if (!doctor) {
        console.error('Доктор не найден');
        return;
    }
    
    // Устанавливаем имя доктора
    document.getElementById('doctorName').textContent = doctor.name;
    
    // Заполняем список услуг
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
    
    doctor.services.forEach((service) => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - ${service.price.toLocaleString()} ₸`;
        option.dataset.price = service.price;
        option.dataset.serviceName = service.name;
        serviceSelect.appendChild(option);
    });
}

function updatePrice() {
    const serviceSelect = document.getElementById('service');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    
    if (selectedOption.value !== '') {
        const price = parseInt(selectedOption.dataset.price);
        const serviceName = selectedOption.dataset.serviceName;
        
        document.getElementById('priceDisplay').textContent = price.toLocaleString() + ' ₸';
        document.getElementById('summaryService').textContent = serviceName;
        document.getElementById('summaryPrice').textContent = price.toLocaleString() + ' ₸';
    } else {
        document.getElementById('priceDisplay').textContent = '0 ₸';
        document.getElementById('summaryService').textContent = 'Не выбрана';
        document.getElementById('summaryPrice').textContent = '0 ₸';
    }
}

function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
}

async function handlePayment(event) {
    event.preventDefault();
    
    const serviceSelect = document.getElementById('service');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    
    if (selectedOption.value === '') {
        alert('Выберите услугу для оплаты');
        return;
    }
    
    const userId = localStorage.getItem('userId');
    const paymentData = {
        user_id: userId,
        service_id: selectedOption.value,
        amount: selectedOption.dataset.price,
        card_number: document.getElementById('cardNumber').value,
        patient_name: document.getElementById('patientName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    processPayment(paymentData, selectedOption.dataset.serviceName, document.getElementById('doctorName').textContent);
}

async function processPayment(paymentData, serviceName, doctorName) {
    try {
        const button = document.querySelector('.payment-submit');
        button.disabled = true;
        button.textContent = 'Обработка...';
        
        const response = await fetch('backend/payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`Оплата прошла успешно! ✅

Услуга: ${serviceName}
Доктор: ${doctorName}
Сумма: ${parseInt(paymentData.amount).toLocaleString()} ₸

Чек отправлен на email: ${paymentData.email}

Спасибо за использование наших услуг!`);
            
            window.location.href = 'index.html';
        } else {
            alert('Ошибка оплаты: ' + (data.error || 'Неизвестная ошибка'));
            button.disabled = false;
            button.textContent = '💳 Оплатить';
        }
        
    } catch (error) {
        console.error('Ошибка оплаты:', error);
        alert('Произошла ошибка при обработке платежа. Проверьте подключение к серверу.');
        document.querySelector('.payment-submit').disabled = false;
        document.querySelector('.payment-submit').textContent = '💳 Оплатить';
    }
}
