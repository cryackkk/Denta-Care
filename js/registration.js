// registration.js - Обработка регистрации с реальными API вызовами

function handleRegistration(event) {
    event.preventDefault();
    
    const formData = {
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthdate: document.getElementById('birthdate').value,
        password: document.getElementById('password').value,
        confirm_password: document.getElementById('confirm_password').value
    };
    
    // Проверка совпадения паролей
    if (formData.password !== formData.confirm_password) {
        alert('Пароли не совпадают!');
        return;
    }
    
    // Отправка данных на сервер
    registerUser(formData);
}

async function registerUser(userData) {
    try {
        const response = await fetch('backend/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Регистрация прошла успешно!\n\nВаши данные:\nEmail: ' + userData.email + '\nТелефон: ' + userData.phone);
            
            // Перенаправление на страницу входа
            window.location.href = 'login.html';
        } else {
            alert('Ошибка регистрации: ' + (data.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации. Проверьте подключение к серверу.');
    }
}

// Автозаполнение телефона
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('focus', function() {
            if (this.value === '') {
                this.value = '+7 ';
            }
        });
        
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            if (value.startsWith('7')) {
                value = value.substring(1);
            }
            
            let formatted = '+7 ';
            
            if (value.length > 0) {
                formatted += '(' + value.substring(0, 3);
            }
            if (value.length >= 3) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length >= 6) {
                formatted += '-' + value.substring(6, 8);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(8, 10);
            }
            
            this.value = formatted;
        });
    }
});
