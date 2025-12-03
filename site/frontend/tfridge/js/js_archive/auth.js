// js/auth.js

// Базовый URL бэкенда (Go-сервер из ../untitled5-solution на :8080)
const API_BASE_URL = 'http://localhost:8080';

// Ключ для локального хранилища
const USER_STORAGE_KEY = 'mealplannerUser';

// ===================== Работа с сессией =====================

function getCurrentUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Сохраняем юзера и токены в localStorage.
 * Поддерживает разные форматы:
 * - { id, nickname, token }
 * - { user: { id, nickname }, token }
 * - { nickname, access_token, refresh_token }
 */
function saveUserSession(payload) {
  if (!payload) return;

  let stored = null;

  // Формат: { user: {...}, token / access_token / jwt / refresh_token }
  if (payload.user || payload.token || payload.access_token || payload.jwt) {
    stored = {
      id: payload.user?.id ?? payload.id ?? null,
      nickname: payload.user?.nickname ?? payload.nickname ?? null,
      token: payload.token ?? payload.access_token ?? payload.jwt ?? null,
      refreshToken: payload.refreshToken ?? payload.refresh_token ?? null,
    };
  } else {
    // На всякий случай — сохраняем как есть
    stored = payload;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(stored));
}

function clearUserSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

function handleUnauthorized() {
  // Чистим локальное хранилище
  clearUserSession();

  // Если уже и так на логине — ничего не делаем
  const path = window.location.pathname || '';
  if (path.endsWith('login.html')) {
    return;
  }

  // Перекидываем на логин
  window.location.href = 'login.html';
}


/**
 * Хедеры авторизации для запросов к защищённым эндпоинтам
 * пример: fetch('/api/v1/recipes', { headers: { ...getAuthHeaders() } })
 */
function getAuthHeaders() {
  const user = getCurrentUser();
  if (!user || !user.token) return {};
  return {
    Authorization: `Bearer ${user.token}`,
  };
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

  if (user && user.token) {
    // Есть юзер: показываем ЛК, скрываем "Начать"
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

    // Реальный logout
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

// ===================== Регистрация =====================

async function handleRegisterSubmit(e) {
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

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (messageEl) {
        messageEl.textContent = data.error || 'Ошибка регистрации';
        messageEl.classList.remove('text-emerald-600');
        messageEl.classList.add('text-red-500');
      }
      return;
    }

    // Пользователь создан — просим зайти
    if (messageEl) {
      messageEl.textContent =
        'Аккаунт создан. Теперь войдите под своим никнеймом и паролем.';
      messageEl.classList.remove('text-red-500');
      messageEl.classList.add('text-emerald-600');
    }

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  } catch (err) {
    console.error(err);
    if (messageEl) {
      messageEl.textContent = 'Сервер недоступен.';
      messageEl.classList.remove('text-emerald-600');
      messageEl.classList.add('text-red-500');
    }
  }
}

// ===================== Логин =====================

async function handleLoginSubmit(e) {
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

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (messageEl) {
        messageEl.textContent = data.error || 'Неверный логин или пароль.';
        messageEl.classList.remove('text-emerald-600');
        messageEl.classList.add('text-red-500');
      }
      return;
    }

    // Бэкенд возвращает { message, access_token, refresh_token }
    // Сохраняем никнейм + access_token (+ refresh_token на будущее)
    saveUserSession({
      nickname,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (messageEl) {
      messageEl.textContent = 'Вы вошли в аккаунт. Перенаправляем...';
      messageEl.classList.remove('text-red-500');
      messageEl.classList.add('text-emerald-600');
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  } catch (err) {
    console.error(err);
    if (messageEl) {
      messageEl.textContent = 'Сервер недоступен.';
      messageEl.classList.remove('text-emerald-600');
      messageEl.classList.add('text-red-500');
    }
  }
}

// ===================== Инициализация =====================

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const path = window.location.pathname;

  // Если уже залогинен и мы на login.html или register.html — сразу на главную
  if (
    user &&
    user.token &&
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

// Экспортим функции в window, чтобы использовать на других страницах
window.getCurrentUser   = getCurrentUser;
window.getAuthHeaders   = getAuthHeaders;
window.clearUserSession = clearUserSession;
window.handleUnauthorized = handleUnauthorized;
