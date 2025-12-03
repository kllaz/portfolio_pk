// Простой фронтовый календарь без бэка / без реальных рецептов
// Теперь:
// - отображение недели
// - перелистывание недель
// - модалка "Выберите рецепт" с заглушкой
// - уведомление, что бэкенд не подключён

// сдвиг по неделям относительно текущей (0 — эта неделя)
let currentWeekOffset = 0;
let selectedSlot = null; // { day }

const DAYS_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAYS_LABELS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

// Понедельник нужной недели
function getWeekStartDate(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);

  // JS: 0 = воскресенье → считаем его 7-м днём
  let day = today.getDay();
  if (day === 0) day = 7;

  // смещаемся к понедельнику + offset недель
  start.setDate(today.getDate() - day + 1 + offset * 7);
  start.setHours(0, 0, 0, 0);

  return start;
}

// Отрисовать календарь
function initializeCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const startOfWeek = getWeekStartDate(currentWeekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  DAYS_KEYS.forEach((dayKey, index) => {
    const dayCell = document.createElement("div");
    dayCell.className =
      "calendar-day border border-gray-200 h-fit rounded-lg p-3 flex flex-col";

    // Заголовок дня
    const header = document.createElement("div");
    header.className = "font-semibold text-gray-800 mb-2 text-sm";
    header.textContent = DAYS_LABELS[index];
    dayCell.appendChild(header);

    // Контейнер под рецепты (пока только заглушка)
    const recipesContainer = document.createElement("div");
    recipesContainer.className = "space-y-2 mb-2";
    recipesContainer.dataset.day = dayKey;

    const emptyText = document.createElement("div");
    emptyText.className = "text-xs text-gray-400";
    emptyText.textContent = 'Нет рецептов. Нажмите "Добавить".';
    recipesContainer.appendChild(emptyText);

    dayCell.appendChild(recipesContainer);

    // Кнопка "Добавить рецепт" — открывает модалку
    const addButton = document.createElement("button");
    addButton.className =
      "mt-auto w-full border-2 border-dashed border-gray-300 text-[#292929] opacity-70 text-xs py-1.5 rounded-lg transition-all duration-200 hover:opacity-100 hover:border-[#126df7] hover:text-[#126df7]";
    addButton.textContent = "+ Добавить рецепт";
    addButton.addEventListener("click", () => openRecipeSelection(dayKey));

    dayCell.appendChild(addButton);

    // Подсветка сегодняшнего дня (как на скрине)
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);

    const isToday =
      dayDate.getFullYear() === today.getFullYear() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getDate() === today.getDate();

    if (isToday) {
      dayCell.classList.add(
        "bg-white",
        "ring-2",
        "ring-[#126df7]",
        "ring-offset-2",
        "ring-offset-white"
      );
    }

    grid.appendChild(dayCell);
  });
}

// Навигация по неделям
function initializeNavigation() {
  const prevBtn = document.getElementById("prev-week");
  const nextBtn = document.getElementById("next-week");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentWeekOffset--;
      updateWeekDisplay();
      initializeCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentWeekOffset++;
      updateWeekDisplay();
      initializeCalendar();
    });
  }
}

// Обновляем текст "декабрь 2025 г." и диапазон дат
function updateWeekDisplay() {
  const startOfWeek = getWeekStartDate(currentWeekOffset);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options = { month: "long", year: "numeric" };
  const weekMonthYear = startOfWeek.toLocaleDateString("ru-RU", options);

  const startDay = startOfWeek.getDate();
  const endDay = endOfWeek.getDate();
  const weekRangeText = `${startDay} - ${endDay} ${weekMonthYear}`;

  const currentWeekEl = document.getElementById("current-week");
  const weekRangeEl = document.getElementById("week-range");

  if (currentWeekEl) currentWeekEl.textContent = weekMonthYear;
  if (weekRangeEl) weekRangeEl.textContent = weekRangeText;
}

// Статистика — просто нули (меню не сохраняем)
function updateStats() {
  const plannedMealsEl = document.getElementById("planned-meals");
  const uniqueRecipesEl = document.getElementById("unique-recipes");

  if (plannedMealsEl) plannedMealsEl.textContent = "0";
  if (uniqueRecipesEl) uniqueRecipesEl.textContent = "0";
}

// Лёгкие нотификации
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-20 right-4 bg-[#f6f7f8] text-[#292929] px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.textContent = message;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 2500);
}

// Заглушки под быстрые действия
function generateWeeklyMenu() {
  showNotification("Генерация меню станет доступна после подключения рецептов.");
}

function clearWeekMenu() {
  showNotification("Очистка меню станет доступна после подключения рецептов.");
}

function exportMenu() {
  showNotification("Экспорт меню станет доступен после подключения рецептов.");
}

// ======= МОДАЛКА ВЫБОРА РЕЦЕПТА (заглушка) =======

// открыть модалку
function openRecipeSelection(dayKey) {
  selectedSlot = { day: dayKey };

  const modal = document.getElementById("recipe-modal");
  const content = document.getElementById("modal-content");
  if (!modal || !content) return;

  modal.classList.remove("hidden");

  // маленькая анимация появления
  content.style.transform = "scale(0.95)";
  content.style.opacity = "0";

  requestAnimationFrame(() => {
    content.style.transform = "scale(1)";
    content.style.opacity = "1";
  });
}

// закрыть модалку
function hideRecipeModal() {
  const modal = document.getElementById("recipe-modal");
  const content = document.getElementById("modal-content");
  if (!modal || !content) return;

  content.style.transform = "scale(0.95)";
  content.style.opacity = "0";

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

// заполняем модалку заглушкой
function renderRecipeSelection() {
  const grid = document.getElementById("recipe-selection-grid");
  const searchInput = document.getElementById("recipe-search");
  if (!grid) return;

  grid.innerHTML = "";

  const card = document.createElement("div");
  card.className =
    "recipe-card rounded-xl p-4 border border-gray-100 bg-[#f6f7f8] cursor-not-allowed col-span-full";

  card.innerHTML = `
    <h4 class="font-semibold text-gray-800 mb-1 text-sm">Рецепты недоступны</h4>
    <p class="text-xs text-gray-500">
      На данной версии бэкенд не подключён. Выполнение функции невозможно.
    </p>
  `;

  card.addEventListener("click", () => {
    showNotification("На данной версии бэкенд не подключён. Выполнение функции невозможно.");
  });

  grid.appendChild(card);

  if (searchInput) {
    searchInput.disabled = true;
    searchInput.placeholder = "Рецепты недоступны";
  }

  // закрытие модалки по клику по фону
  const modal = document.getElementById("recipe-modal");
  if (modal && !modal.dataset._clickBound) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideRecipeModal();
      }
    });
    modal.dataset._clickBound = "1";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  updateWeekDisplay();
  initializeCalendar();
  initializeNavigation();
  updateStats();
  renderRecipeSelection();
});
