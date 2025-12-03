// burger.js

// ===================== Вспомогательные функции =====================

// Проверяем, залогинен ли пользователь
function isUserLoggedIn() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return false;
    const user = JSON.parse(raw);
    return !!user && !!user.token;
  } catch (e) {
    console.warn('Ошибка чтения currentUser из localStorage', e);
    return false;
  }
}

// Показываем / скрываем кнопки "Начать" и "Выйти"
// Работает и для десктопного дропа, и для мобильного меню
function syncAuthStateForHeader() {
  const loggedIn = isUserLoggedIn();

  const startButtons = document.querySelectorAll('[data-role="start-button"]');
  const logoutButtons = document.querySelectorAll('[data-role="logout-button"]');

  startButtons.forEach((btn) => {
    if (!btn) return;
    if (loggedIn) {
      btn.classList.add('hidden');
    } else {
      btn.classList.remove('hidden');
    }
  });

  logoutButtons.forEach((btn) => {
    if (!btn) return;

    if (loggedIn) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }

    // Вешаем обработчик выхода (идемпотентно)
    if (!btn.dataset.logoutBound) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        // Если есть глобальная функция logout() из auth.js — используем её
        if (typeof window.logout === 'function') {
          window.logout();
        } else {
          // Фолбэк: чистим localStorage и уводим на главную
          localStorage.removeItem('currentUser');
          window.location.href = 'index.html';
        }
      });

      btn.dataset.logoutBound = 'true';
    }
  });
}

// ===================== Мобильное меню =====================

function initBurgerMenu() {
  const openBtn = document.getElementById('mobile-menu-open');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!openBtn || !mobileMenu || !closeBtn) {
    // На странице может не быть бургер-меню — просто выходим
    return;
  }

  const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-link');

  function openMenu() {
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'pointer-events-auto');

    openBtn.classList.add('invisible'); // прячем "три полоски"
    document.body.classList.add('overflow-hidden'); // блокируем скролл под меню
  }

  function closeMenu() {
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');

    openBtn.classList.remove('invisible');
    document.body.classList.remove('overflow-hidden');
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Клик по фону закрывает меню
  mobileMenu.addEventListener('click', function (e) {
    if (e.target === mobileMenu) {
      closeMenu();
    }
  });

  // Клик по любой ссылке в меню — закрываем
  menuLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Закрытие по ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}

// ===================== Инициализация =====================

document.addEventListener('DOMContentLoaded', function () {
  initBurgerMenu();
  syncAuthStateForHeader();
});
