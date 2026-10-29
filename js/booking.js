// booking.js - Обработка записи на приём с проверкой авторизации
//
// Разделение ответственности:
// - booking.js проверяет только сам факт входа (флаг isLoggedIn в localStorage) —
//   это быстрая проверка без обращения к серверу, для случая "пользователь вообще
//   не залогинен".
// - js/auth.js (подключается на этих же страницах) отдельно сверяет localStorage
//   с реальной базой данных через backend/verify_session.php — это покрывает случай
//   "пользователь был залогинен, но администратор удалил его аккаунт через
//   админ-панель". Без этой второй проверки удалённый пользователь мог бы
//   продолжать пользоваться сайтом, пока вручную не очистит localStorage.

function openBookingForm(doctorId) {
    // Проверка авторизации
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Для записи на приём необходимо войти в систему или зарегистрироваться');
        window.location.href = 'login.html';
        return;
    }
    
    // Сохранение выбранного доктора
    localStorage.setItem('selectedDoctorId', doctorId);
    
    // Переход на страницу записи
    window.location.href = 'booking.html?doctor=' + doctorId;
}

function goToPayment(doctorId) {
    // Проверка авторизации
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Для оплаты услуг необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    // Сохранение ID доктора для страницы оплаты
    localStorage.setItem('paymentDoctorId', doctorId);
    
    // Переход на страницу оплаты
    window.location.href = 'payment.html?doctor=' + doctorId;
}

// Проверка доступа к страницам докторов
function checkAccessToDoctorPage() {
    // Получаем текущую страницу
    const currentPage = window.location.pathname.split('/').pop();
    
    // Список страниц докторов, требующих авторизации
    const doctorPages = [
        'doctor.html',
        'doctor-lee-jr.html', 
        'doctor-jessica.html',
        'doctor-vance.html'
    ];
    
    // Проверяем, находимся ли мы на странице доктора
    if (doctorPages.includes(currentPage)) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn || isLoggedIn !== 'true') {
            alert('Для просмотра информации о докторах необходимо зарегистрироваться и войти в систему');
            window.location.href = 'registration.html';
            return false;
        }
    }
    
    return true;
}

// Проверяем доступ при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAccessToDoctorPage);
