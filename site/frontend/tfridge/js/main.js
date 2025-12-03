// ДЕМО-ВЕРСИЯ ГЛАВНОЙ СТРАНИЦЫ БЕЗ БЭКЕНДА

// Ключ, по которому auth.js хранит пользователя в localStorage
function getUserStorageKey() {
  return 'mealplannerUser';
}

// Префикс для хранения недельного меню в localStorage (как в menu.js)
const MENU_STORAGE_PREFIX = 'mealplannerWeeklyMenu';

// === Безопасная работа с "пользователем" (чисто локально) ===
function getCurrentUserSafe() {
  try {
    if (typeof window !== 'undefined' && typeof window.getCurrentUser === 'function') {
      const fromAuth = window.getCurrentUser();
      if (fromAuth) return fromAuth;
    }
  } catch (e) {
    console.warn('Ошибка при вызове window.getCurrentUser()', e);
  }

  try {
    const raw = localStorage.getItem(getUserStorageKey());
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Не удалось распарсить пользователя из localStorage', e);
    return null;
  }
}

// === Утилиты по неделям ===

// неделя начинается с понедельника, как в menu.js
function getWeekStartDate(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);

  // JS: 0 = воскресенье → считаем как 7-й день недели
  let day = today.getDay();
  if (day === 0) day = 7;

  // понедельник + offset недель
  startOfWeek.setDate(today.getDate() - day + 1 + offset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

// Собрать индекс вида { [dayNumber]: count } для конкретного месяца
function collectMonthlyMenu(year, month) {
  const user = getCurrentUserSafe();
  if (!user) return {};

  const userKey = user.id || user.nickname;
  if (!userKey) return {};

  const prefix = `${MENU_STORAGE_PREFIX}:${userKey}:week:`;
  const result = {};
  const dayKeys = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  // Проходим по всем ключам меню этого пользователя
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn('Не удалось распарсить weeklyMenu из localStorage:', key, e);
      continue;
    }

    const weekly = {
      monday: Array.isArray(parsed.monday) ? parsed.monday : [],
      tuesday: Array.isArray(parsed.tuesday) ? parsed.tuesday : [],
      wednesday: Array.isArray(parsed.wednesday) ? parsed.wednesday : [],
      thursday: Array.isArray(parsed.thursday) ? parsed.thursday : [],
      friday: Array.isArray(parsed.friday) ? parsed.friday : [],
      saturday: Array.isArray(parsed.saturday) ? parsed.saturday : [],
      sunday: Array.isArray(parsed.sunday) ? parsed.sunday : [],
    };

    // offset недели берём из ключа
    const offsetStr = key.substring(prefix.length);
    const offset = parseInt(offsetStr, 10) || 0;

    const weekStart = getWeekStartDate(offset); // понедельник этой недели

    dayKeys.forEach((dayName, idx) => {
      const dayMenu = weekly[dayName];
      if (!Array.isArray(dayMenu) || !dayMenu.length) return;

      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);

      if (d.getFullYear() !== year || d.getMonth() !== month) return;

      const dayNum = d.getDate();
      result[dayNum] = (result[dayNum] || 0) + dayMenu.length;
    });
  }

  return result;
}

// Получить массив записей из weeklyMenu на конкретную дату
function collectRecipesForDate(targetDate) {
  const user = getCurrentUserSafe();
  if (!user) return [];

  const userKey = user.id || user.nickname;
  if (!userKey) return [];

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const dateNum = targetDate.getDate();

  const prefix = `${MENU_STORAGE_PREFIX}:${userKey}:week:`;
  const collected = [];
  const dayKeys = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn(
        'Не удалось распарсить weeklyMenu для collectRecipesForDate:',
        key,
        e
      );
      continue;
    }

    const weekly = {
      monday: Array.isArray(parsed.monday) ? parsed.monday : [],
      tuesday: Array.isArray(parsed.tuesday) ? parsed.tuesday : [],
      wednesday: Array.isArray(parsed.wednesday) ? parsed.wednesday : [],
      thursday: Array.isArray(parsed.thursday) ? parsed.thursday : [],
      friday: Array.isArray(parsed.friday) ? parsed.friday : [],
      saturday: Array.isArray(parsed.saturday) ? parsed.saturday : [],
      sunday: Array.isArray(parsed.sunday) ? parsed.sunday : [],
    };

    const offsetStr = key.substring(prefix.length);
    const offset = parseInt(offsetStr, 10) || 0;
    const weekStart = getWeekStartDate(offset);

    dayKeys.forEach((dayName, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);

      if (
        d.getFullYear() !== year ||
        d.getMonth() !== month ||
        d.getDate() !== dateNum
      ) {
        return;
      }

      const dayMenu = weekly[dayName];
      if (Array.isArray(dayMenu) && dayMenu.length) {
        collected.push(...dayMenu);
      }
    });
  }

  return collected;
}

// === Календарь на главной (только текущий месяц) ===
function generateCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  if (!calendarGrid) return;

  calendarGrid.innerHTML = '';

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // JS: 0 = воскресенье, 1 = понедельник, ... 6 = суббота
  // Нам нужно: 0 = понедельник, ... 6 = воскресенье
  const rawFirstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDay = (rawFirstDay + 6) % 7;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const menuByDay = collectMonthlyMenu(currentYear, currentMonth);

  // Пустые клетки перед первым числом
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    calendarGrid.appendChild(emptyCell);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className =
      'aspect-square p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200';

    const dayNumber = document.createElement('div');
    dayNumber.className = 'text-sm font-medium text-gray-700 mb-1';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    const plannedCount = menuByDay[day] || 0;
    if (plannedCount > 0) {
      const badge = document.createElement('div');
      badge.className =
        'mt-1 inline-flex items-center justify-center rounded-full bg-[#ffdd2d] text-[10px] px-2 py-0.5 text-gray-800';
      badge.textContent = plannedCount === 1 ? '1 блюдо' : `${plannedCount} блюд`;
      dayCell.appendChild(badge);
    }

    // подсветка сегодняшнего дня
    if (day === today.getDate()) {
      dayCell.classList.add('bg-green-100', 'border-green-300');
    }

    dayCell.addEventListener('click', () => {
      openMenuPlanner();
    });

    calendarGrid.appendChild(dayCell);
  }
}

// === Блок "Сегодня" справа от календаря (чисто по данным из localStorage) ===
async function renderTodayMeals() {
  const container = document.getElementById('today-meals-list');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawItems = collectRecipesForDate(today);

  if (!rawItems.length) {
    container.innerHTML =
      '<div class="text-sm text-gray-400">На сегодня ещё ничего не запланировано.</div>';
    return;
  }

  const uniqueTitles = [];
  const seen = new Set();

  rawItems.forEach((entry, idx) => {
    let id = null;
    let titleFromMenu = null;

    if (typeof entry === 'number' || typeof entry === 'string') {
      // просто id
      id = entry;
    } else if (entry && typeof entry === 'object') {
      // объект из weeklyMenu
      id =
        entry.id ??
        entry.ID ??
        entry.recipe_id ??
        entry.RecipeID ??
        null;

      titleFromMenu =
        entry.title ??
        entry.Title ??
        entry.name ??
        entry.Name ??
        null;
    }

    // ключ для дедупликации
    let key;
    if (id != null) {
      key = `id:${String(id)}`;
    } else if (titleFromMenu) {
      key = `title:${titleFromMenu}`;
    } else {
      key = `idx:${idx}`;
    }

    if (seen.has(key)) return;
    seen.add(key);

    let finalTitle = null;

    // 1) если есть название в weeklyMenu — берём его
    if (titleFromMenu) {
      finalTitle = titleFromMenu;
    }

    // 2) если названия нет, но есть id — делаем "Блюдо #id"
    if (!finalTitle && id != null) {
      finalTitle = `Блюдо #${id}`;
    }

    // 3) совсем уж запасной вариант
    if (!finalTitle) {
      finalTitle = 'Блюдо';
    }

    uniqueTitles.push(finalTitle);
  });

  const titlesToShow = uniqueTitles.slice(0, 5);

  const list = document.createElement('ul');
  list.className = 'space-y-1 text-sm text-gray-700';

  titlesToShow.forEach((title) => {
    const li = document.createElement('li');
    li.textContent = `• ${title}`;
    list.appendChild(li);
  });

  container.innerHTML = '';
  container.appendChild(list);
}

// === Анимации и скролл ===
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('section');
  sections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// Modal functions
function showModal() {
  const modal = document.getElementById('start-modal');
  const content = document.getElementById('modal-content');

  if (!modal || !content) return;

  modal.classList.remove('hidden');

  setTimeout(() => {
    content.style.transform = 'scale(1)';
    content.style.opacity = '1';
  }, 10);
}

function hideModal() {
  const modal = document.getElementById('start-modal');
  const content = document.getElementById('modal-content');

  if (!modal || !content) return;

  content.style.transform = 'scale(0.95)';
  content.style.opacity = '0';

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// Навигация к планировщику меню
function openMenuPlanner() {
  window.location.href = 'menu.html';
}

// Плавный скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Hover-эффекты для карточек (anime.js, если подключен)
if (typeof anime !== 'undefined') {
  document.querySelectorAll('.card-hover').forEach((card) => {
    card.addEventListener('mouseenter', function () {
      anime({
        targets: this,
        scale: 1.02,
        duration: 300,
        easing: 'easeOutCubic',
      });
    });

    card.addEventListener('mouseleave', function () {
      anime({
        targets: this,
        scale: 1,
        duration: 300,
        easing: 'easeOutCubic',
      });
    });
  });
}

// Плавное появление картинок
if (typeof anime !== 'undefined') {
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    img.addEventListener('load', function () {
      anime({
        targets: this,
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutCubic',
      });
    });

    img.style.opacity = '0';
  });
}

// Debounce и параллакс-эффект для героя
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const parallaxHero = debounce(() => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero-gradient');
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
}, 10);

window.addEventListener('scroll', parallaxHero);

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const overlay = document.getElementById('mobile-menu-overlay');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!toggleBtn || !overlay) return;

  const open = () => {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');

    // прячем бургер, чтобы остался только крестик
    toggleBtn.classList.add('opacity-0', 'pointer-events-none');
  };

  const close = () => {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');

    // возвращаем бургер
    toggleBtn.classList.remove('opacity-0', 'pointer-events-none');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    open();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
  }

  // клик по пустому фону — закрыть
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // клик по любой ссылке / кнопке внутри — тоже закрыть
  overlay.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      close();
    });
  });
}

/**
 * Показать "Начать" или локальные ссылки в мобильном меню
 * в зависимости от наличия юзера в localStorage
 */
function initAuthMobileMenuState() {
  const user = getCurrentUserSafe();
  const startLink = document.querySelector('[data-mobile-auth="start"]');
  const authLinksBlock = document.getElementById('mobile-auth-links');

  if (!startLink || !authLinksBlock) return;

  if (user && (user.id || user.nickname)) {
    // "залогинен" → прячем "Начать", показываем список
    startLink.classList.add('hidden');
    authLinksBlock.classList.remove('hidden');
  } else {
    // гость → только "Начать"
    startLink.classList.remove('hidden');
    authLinksBlock.classList.add('hidden');
  }

  // "Выйти" в мобильном меню
  const mobileLogout = document.getElementById('mobile-logout');
  if (mobileLogout) {
    mobileLogout.addEventListener('click', (e) => {
      e.preventDefault();

      const desktopLogout = document.getElementById('logout-link');
      if (desktopLogout) {
        desktopLogout.click();
      } else {
        localStorage.removeItem(getUserStorageKey());
        window.location.href = 'index.html';
      }
    });
  }
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', function () {
  generateCalendar();
  renderTodayMeals();
  initializeScrollAnimations();
  initMobileMenu();
  initAuthMobileMenuState();

  const startBtn = document.getElementById('start-planning-btn');
  if (startBtn) {
    // В демо-версии всегда просто идём в меню без логина/регистрации
    startBtn.addEventListener('click', () => {
      openMenuPlanner(); // menu.html
    });
  }
});
