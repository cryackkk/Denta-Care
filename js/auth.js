// auth.js — Проверка сессии пользователя и отображение статуса входа в header
//
// Решает две задачи:
// 1. На каждой странице сверяет localStorage с реальной базой данных через
//    backend/verify_session.php — если пользователя удалили (например, через
//    админ-панель) или заблокировали, сессия немедленно аннулируется,
//    а не продолжает "жить" в браузере бесконечно.
// 2. Добавляет в header кнопку "Выйти" (и имя пользователя), когда пользователь
//    залогинен, либо ссылки "Войти" / "Регистрация", когда не залогинен.

(function () {
    "use strict";

    // ---------- Выход из системы ----------
    function logout(opts) {
        var silent = opts && opts.silent;
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('selectedDoctorId');
        localStorage.removeItem('paymentDoctorId');

        // Завершаем сессию и на сервере
        fetch('backend/logout.php', { keepalive: true }).finally(function () {
            if (!silent) {
                window.location.href = 'index.html';
            }
        });
    }
    // Делаем доступной глобально, чтобы можно было вызвать onclick="logout()" из HTML
    window.logout = logout;

    // ---------- Отрисовка блока авторизации в header ----------
    function renderAuthBlock() {
        var container = document.getElementById('header-buttons');
        if (!container) return; // на странице нет стандартного header — ничего не делаем

        var existingAuthBlock = document.getElementById('auth-status-block');
        if (existingAuthBlock) existingAuthBlock.remove();

        var isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        var authBlock = document.createElement('div');
        authBlock.id = 'auth-status-block';
        authBlock.className = 'auth-status-block';

        if (isLoggedIn) {
            var userName = localStorage.getItem('userName') || 'Личный кабинет';
            authBlock.innerHTML =
                '<span class="user-name-display" title="' + escapeHtml(userName) + '"><span class="user-icon">👤</span>' + escapeHtml(userName) + '</span>' +
                '<button type="button" class="logout-button" id="logout-trigger-btn">Выйти</button>';
        } else {
            authBlock.innerHTML =
                '<a href="login.html" class="login-link-button">Войти</a>' +
                '<a href="registration.html" class="register-link-button">Регистрация</a>';
        }

        container.appendChild(authBlock);

        var logoutBtn = document.getElementById('logout-trigger-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                logout();
            });
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Проверка актуальности сессии относительно базы данных ----------
    function verifySessionAgainstServer() {
        var isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        var userId = localStorage.getItem('userId');

        if (!isLoggedIn || !userId) {
            return; // никто не залогинен — нечего проверять
        }

        fetch('backend/verify_session.php')
            .then(function (response) { return response.json(); })
            .then(function (data) {
                if (!data.valid) {
                    // Пользователь был удалён администратором или заблокирован —
                    // немедленно завершаем "висящую" сессию в браузере.
                    var message = data.reason === 'blocked'
                        ? 'Ваш аккаунт был заблокирован администратором. Вы вышли из системы.'
                        : data.reason === 'expired'
                            ? 'Сессия истекла. Пожалуйста, войдите снова.'
                            : 'Ваш аккаунт был удалён администратором. Вы вышли из системы.';

                    logout({ silent: true });
                    renderAuthBlock();
                    alert(message);

                    // Если мы сейчас на странице, требующей авторизации (профиль доктора,
                    // запись на приём, оплата) — отправляем на главную, а не оставляем
                    // человека на странице, к которой у него больше нет доступа.
                    var restrictedPages = [
                        'doctor.html', 'doctor-lee-jr.html', 'doctor-jessica.html', 'doctor-vance.html',
                        'booking.html', 'payment.html'
                    ];
                    var currentPage = window.location.pathname.split('/').pop();
                    if (restrictedPages.indexOf(currentPage) !== -1) {
                        window.location.href = 'index.html';
                    }
                } else if (data.user) {
                    // Сессия валидна — обновляем локальные данные на случай,
                    // если администратор поменял ФИО/телефон через панель управления.
                    localStorage.setItem('userName', data.user.full_name);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userPhone', data.user.phone);
                    renderAuthBlock();
                }
            })
            .catch(function () {
                // Сервер недоступен (например, страница открыта без запущенного backend) —
                // не разлогиниваем человека принудительно из-за сетевой ошибки.
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderAuthBlock();
        verifySessionAgainstServer();
    });
})();
