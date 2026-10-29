// admin-panel.js - Панель администратора

document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
        alert('Доступ запрещён. Только для администраторов.');
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Отображение имени администратора
    const adminName = localStorage.getItem('adminName');
    document.getElementById('adminName').textContent = '👤 ' + adminName;
    
    // Загрузка данных (если у сервера нет сессии админа, он ответит 403)
    fetch('backend/admin_get_users.php').then(function (r) {
        if (r.status === 403 || r.status === 401) {
            logout();
            alert('Сессия администратора истекла. Войдите снова.');
            window.location.href = 'admin-login.html';
        }
    });
    loadUsers();
    loadAppointments();
    loadPayments();
});

function logout() {
    fetch('backend/logout.php', { keepalive: true });
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
}

// === ПЕРЕКЛЮЧЕНИЕ ТАБОВ ===
function showTab(tabName) {
    // Скрыть все вкладки
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Убрать активность со всех кнопок
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Показать выбранную вкладку
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// === ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ ===
async function loadUsers() {
    try {
        const response = await fetch('backend/admin_get_users.php');
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.users);
        } else {
            console.error('Ошибка загрузки пользователей:', data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: #f44336;">Ошибка загрузки данных</td></tr>';
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Пользователей пока нет</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.user_id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.birth_date}</td>
            <td>${new Date(user.created_at).toLocaleString('ru-RU')}</td>
            <td>
                <button onclick="deleteUser(${user.user_id})" class="delete-btn">Удалить</button>
            </td>
        </tr>
    `).join('');
}

// === ЗАГРУЗКА ЗАПИСЕЙ ===
async function loadAppointments() {
    try {
        const response = await fetch('backend/admin_get_appointments.php');
        const data = await response.json();
        
        if (data.success) {
            displayAppointments(data.appointments);
        } else {
            console.error('Ошибка загрузки записей:', data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('appointmentsTableBody').innerHTML = 
            '<tr><td colspan="11" style="text-align: center; color: #f44336;">Ошибка загрузки данных</td></tr>';
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Записей пока нет</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>${apt.appointment_id}</td>
            <td>${apt.patient_name}</td>
            <td>${apt.patient_phone}</td>
            <td>${apt.patient_email}</td>
            <td>${apt.doctor_name}</td>
            <td>${apt.service_name}</td>
            <td>${apt.appointment_date}</td>
            <td>${apt.appointment_time}</td>
            <td>${parseInt(apt.price).toLocaleString()} ₸</td>
            <td><span class="status-badge status-${apt.status}">${getStatusText(apt.status)}</span></td>
            <td>
                <button onclick="updateStatus(${apt.appointment_id}, 'confirmed')" class="confirm-btn" ${apt.status === 'confirmed' ? 'disabled' : ''}>Подтвердить</button>
                <button onclick="updateStatus(${apt.appointment_id}, 'cancelled')" class="cancel-btn" ${apt.status === 'cancelled' ? 'disabled' : ''}>Отменить</button>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'В ожидании',
        'confirmed': 'Подтверждено',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
    };
    return statusMap[status] || status;
}

// === ЗАГРУЗКА ПЛАТЕЖЕЙ ===
async function loadPayments() {
    try {
        const response = await fetch('backend/admin_get_payments.php');
        const data = await response.json();
        
        if (data.success) {
            displayPayments(data.payments);
            updatePaymentStats(data.payments);
        } else {
            console.error('Ошибка загрузки платежей:', data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('paymentsTableBody').innerHTML = 
            '<tr><td colspan="8" style="text-align: center; color: #f44336;">Ошибка загрузки данных</td></tr>';
    }
}

function displayPayments(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    
    if (!payments || payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Платежей пока нет</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.payment_id}</td>
            <td>${payment.patient_name}</td>
            <td>${payment.patient_email}</td>
            <td>${payment.service_name}</td>
            <td>${parseInt(payment.amount).toLocaleString()} ₸</td>
            <td>**** ${payment.card_last4}</td>
            <td>${new Date(payment.payment_date).toLocaleString('ru-RU')}</td>
            <td><span class="status-badge status-${payment.payment_status}">${payment.payment_status}</span></td>
        </tr>
    `).join('');
}

function updatePaymentStats(payments) {
    const total = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    document.getElementById('totalPayments').textContent = total;
    document.getElementById('totalAmount').textContent = totalAmount.toLocaleString() + ' ₸';
    document.getElementById('avgAmount').textContent = Math.round(avgAmount).toLocaleString() + ' ₸';
}

// === ФИЛЬТРАЦИЯ ЗАПИСЕЙ ===
function filterAppointments() {
    // Здесь можно реализовать фильтрацию на стороне клиента
    // или отправить запрос на сервер с параметрами фильтрации
    loadAppointments();
}

// === ОБНОВЛЕНИЕ СТАТУСА ЗАПИСИ ===
async function updateStatus(appointmentId, newStatus) {
    try {
        const response = await fetch('backend/admin_update_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointment_id: appointmentId,
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Статус успешно обновлён');
            loadAppointments();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка обновления статуса');
    }
}

// === УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ===
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }
    
    try {
        const response = await fetch('backend/admin_delete_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Пользователь удалён');
            loadUsers();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка удаления пользователя');
    }
}

// === ДОБАВЛЕНИЕ НОВОГО КЛИЕНТА ===
async function addNewUser(event) {
    event.preventDefault();
    
    const userData = {
        fullname: document.getElementById('newFullname').value,
        email: document.getElementById('newEmail').value,
        phone: document.getElementById('newPhone').value,
        birthdate: document.getElementById('newBirthdate').value,
        password: document.getElementById('newPassword').value
    };
    
    try {
        const response = await fetch('backend/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Клиент успешно добавлен!\n\nEmail: ' + userData.email);
            document.getElementById('addUserForm').reset();
            loadUsers();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка добавления клиента');
    }
}
