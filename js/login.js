// login.js - Обработка входа с реальной проверкой

function handleLogin(event) {
    event.preventDefault();
    
    const loginData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    // Отправка данных на сервер
    loginUser(loginData);
}

async function loginUser(loginData) {
    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Сохранение данных пользователя
            localStorage.setItem('userId', data.user.user_id);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.full_name);
            localStorage.setItem('userPhone', data.user.phone);
            localStorage.setItem('isLoggedIn', 'true');

            if (data.is_admin) {
                // Это администратор — отдельно отмечаем это в localStorage,
                // потому что admin-panel.html проверяет именно ключи isAdmin/adminName
                // (так же, как при входе через admin-login.html).
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminEmail', data.user.email);
                localStorage.setItem('adminName', data.user.full_name);

                alert('Добро пожаловать в панель администратора, ' + data.user.full_name + '!');
                window.location.href = 'admin-panel.html';
                return;
            }

            alert('Вы успешно вошли в систему!\n\nДобро пожаловать, ' + data.user.full_name + '!');

            // Перенаправление на главную страницу
            window.location.href = 'index.html';
        } else {
            alert('Ошибка входа: ' + (data.error || 'Неверный email или пароль'));
        }
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе. Проверьте подключение к серверу.');
    }
}
