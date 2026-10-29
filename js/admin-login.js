// admin-login.js - Вход для администратора
// Пароль проверяет сервер (backend/login.php), а не браузер.

async function handleAdminLogin(event) {
    event.preventDefault();

    const loginData = {
        email: document.getElementById('login').value.trim(), // у администратора вместо email логин
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const data = await response.json();

        if (response.ok && data.success && data.is_admin) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminEmail', data.user.email);
            localStorage.setItem('adminName', data.user.full_name);
            window.location.href = 'admin-panel.html';
        } else if (response.ok && data.success) {
            // Пароль верный, но это обычный пользователь, а не админ
            await fetch('backend/logout.php');
            alert('У этого аккаунта нет прав администратора');
        } else {
            alert('Неверный логин или пароль администратора');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе. Проверьте подключение к серверу.');
    }
}
