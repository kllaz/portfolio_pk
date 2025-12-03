// ВЕРСИЯ ДЛЯ ДЕМО/ПОРТФОЛИО
// Без запросов к бэку, всё хранится локально в браузере

const USER_STORAGE_KEY = 'mealplannerUser';

// ===================== Работа с "сессией" (локально) =====================

function getCurrentUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUserSession(payload) {
  if (!payload) return;

  // Для демо нам достаточно id + nickname
  const stored = {
    id: payload.id ?? Date.now(),
    nickname: payload.nickname ?? null,
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(stored));
}

function clearUserSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * В демо-версии авторизационных заголовков нет.
 * Оставляем функцию для совместимости с остальным кодом.
 */
function getAuthHeaders() {
  return {};
}

/**
 * В демо-версии истечение сессии просто очищает локальные данные,
 * но НЕ редиректит на страницу логина.
 */
function handleSessionExpired() {
  clearUserSession();
  showSessionExpiredNotification();
}

function showSessionExpiredNotification() {
  const old = document.getElementById('session-expired-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'session-expired-toast';
  toast.className =
    'fixed top-4 right-4 z-50 max-w-xs px-4 py-3 rounded-lg shadow-lg ' +
    'bg-slate-900/90 text-white text-sm leading-snug';

  toast.textContent = 'Сессия сброшена (демо-режим, сервер не подключён).';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ===================== UI: Личный кабинет / "Начать" =====================

function initAccountUI() {
  const user = getCurrentUser();

  const accountWrapper = document.getElementById('account-wrapper');
  const accountButton = document.getElementById('account-button');
  const accountDropdown = document.getElementById('account-dropdown');

  // Линки выхода: и по data-role, и по id
  const logoutLinks = [
    ...document.querySelectorAll('[data-role="logout-link"]'),
    ...document.querySelectorAll('#logout-link'),
  ];

  const nicknameEl = document.getElementById('account-nickname');
  const startButtons = document.querySelectorAll('[data-role="start-button"]');

  if (user) {
    // Есть "юзер": показываем ЛК, скрываем "Начать"
    if (accountWrapper) accountWrapper.classList.remove('hidden');
    startButtons.forEach((btn) => btn.classList.add('hidden'));

    if (nicknameEl && user.nickname) {
      nicknameEl.textContent = user.nickname;
    }

    if (accountButton && accountDropdown && accountWrapper) {
      accountButton.addEventListener('click', () => {
        accountDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!accountWrapper.contains(e.target)) {
          accountDropdown.classList.add('hidden');
        }
      });
    }

    // Logout
    logoutLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        clearUserSession();
        window.location.href = 'index.html';
      });
    });
  } else {
    // Нет юзера: скрываем ЛК, показываем "Начать"
    if (accountWrapper) accountWrapper.classList.add('hidden');
    startButtons.forEach((btn) => btn.classList.remove('hidden'));
  }
}

// ===================== "Регистрация" (только локально) =====================

function handleRegisterSubmit(e) {
  e.preventDefault();

  const nickname = document.getElementById('nickname')?.value.trim();
  const password = document.getElementById('password')?.value;
  const messageEl = document.getElementById('register-message');

  if (!nickname || !password) {
    if (messageEl) {
      messageEl.textContent = 'Заполните никнейм и пароль.';
      messageEl.classList.remove('text-emerald-600');
      messageEl.classList.add('text-red-500');
    }
    return;
  }

  // В демо-версии просто сохраняем "юзера" локально и считаем, что всё ок
  saveUserSession({
    nickname,
  });

  if (messageEl) {
    messageEl.textContent =
      'Аккаунт создан (демо-режим, без сервера). Перенаправляем...';
    messageEl.classList.remove('text-red-500');
    messageEl.classList.add('text-emerald-600');
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// ===================== "Логин" (только локально) =====================

function handleLoginSubmit(e) {
  e.preventDefault();

  const nickname = document.getElementById('login-nickname')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const messageEl = document.getElementById('login-message');

  if (!nickname || !password) {
    if (messageEl) {
      messageEl.textContent = 'Введите никнейм и пароль.';
      messageEl.classList.remove('text-emerald-600');
      messageEl.classList.add('text-red-500');
    }
    return;
  }

  // В демо-режиме не проверяем пароль, просто "логиним" по нику
  saveUserSession({
    nickname,
  });

  if (messageEl) {
    messageEl.textContent =
      'Вы вошли в аккаунт (демо-режим, без сервера). Перенаправляем...';
    messageEl.classList.remove('text-red-500');
    messageEl.classList.add('text-emerald-600');
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// ===================== Инициализация =====================

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const path = window.location.pathname;

  const expiredFlag = localStorage.getItem('sessionExpired');
  if (expiredFlag === '1') {
    localStorage.removeItem('sessionExpired');
    showSessionExpiredNotification();
  }

  // Если пользователь уже "авторизован" и попадает на login/register —
  // отправляем его на главную (это можно убрать, если хочешь видеть формы всегда)
  if (
    user &&
    (path.endsWith('login.html') || path.endsWith('register.html'))
  ) {
    window.location.href = 'index.html';
    return;
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  initAccountUI();
});

// Экспортируем в window, чтобы использовать на других страницах
window.getCurrentUser = getCurrentUser;
window.getAuthHeaders = getAuthHeaders;
window.clearUserSession = clearUserSession;
window.handleSessionExpired = handleSessionExpired;
