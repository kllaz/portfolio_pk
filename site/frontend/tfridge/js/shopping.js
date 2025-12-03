// js/shopping.js — демо-версия без бэкенда

const BACKEND_ERROR =
  'На данной версии бэкенд не подключён. Выполнение функции невозможно.';

// Стартовый список продуктов (демо)
let shoppingItems = [
  { id: '1', name: 'Сахар',    quantity: 100, unit: 'г',  completed: false },
  { id: '2', name: 'Помидоры', quantity: 3,   unit: 'шт', completed: false },
  { id: '3', name: 'Молоко',   quantity: 1,   unit: 'л',  completed: false },
];

// ==== Уведомления ====

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className =
    'fixed top-20 right-4 bg-[#f6f7f8] text-[#292929] px-6 py-3 rounded-lg ' +
    'shadow-lg z-50 transform translate-x-full transition-transform duration-300';
  notification.textContent = message;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2500);
}

// ==== Рендер списка ====

function createItemHTML(item) {
  const quantityText = item.quantity != null ? String(item.quantity) : '';
  const unitText = item.unit ? ` ${item.unit}` : '';

  return `
    <div class="shopping-item flex items-center space-x-3 p-2 rounded-lg ${
      item.completed ? 'completed' : ''
    }" data-item-id="${item.id}">
      <div class="flex-1">
        <div class="font-medium text-gray-800">${item.name}</div>
        <div class="text-sm text-gray-600">
          ${quantityText ? `${quantityText}${unitText}` : ''}
        </div>
      </div>
      <button class="text-red-400 hover:text-red-600 transition-colors duration-200"
              onclick="removeItem('${item.id}')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  `;
}

function renderShoppingList() {
  const container = document.getElementById('shopping-list-container');
  if (!container) return;

  if (!shoppingItems.length) {
    container.innerHTML = `
      <p class="text-gray-500 text-sm">
        Список пока пуст. Добавьте продукт вручную или выберите рецепты в разделе «Меню».
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <div class="space-y-3">
      ${shoppingItems.map(createItemHTML).join('')}
    </div>
  `;
}

// ==== Статистика ====

function updateStats() {
  const totalItems     = shoppingItems.length;
  const completedItems = shoppingItems.filter((i) => i.completed).length;
  const remainingItems = totalItems - completedItems;
  const progress       = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

  const totalEl     = document.getElementById('total-items');
  const completedEl = document.getElementById('completed-items');
  const remainingEl = document.getElementById('remaining-items');

  if (totalEl)     totalEl.textContent = String(totalItems);
  if (completedEl) completedEl.textContent = String(completedItems);
  if (remainingEl) remainingEl.textContent = String(remainingItems);

  const progressText = document.getElementById('progress-text');
  if (progressText) progressText.textContent = `${progress}% выполнено`;

  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

// ==== Тоггл чекбокса (локально, без бэка) ====

function toggleItem(itemId) {
  const item = shoppingItems.find((i) => String(i.id) === String(itemId));
  if (!item) return;

  item.completed = !item.completed;
  renderShoppingList();
  updateStats();
}

// ==== Удаление / генерация / очистка — только сообщение об ошибке ====

function removeItem(itemId) {
  // В боевой версии тут запрос к бэку → сейчас просто сообщение об ошибке
  showNotification(BACKEND_ERROR);
}

function generateFromMenu() {
  // В боевой версии генерировалось из weekly menu → сейчас ошибка
  showNotification(BACKEND_ERROR);
}

function clearAllPurchased() {
  // В боевой версии отправлялись delete-запросы → сейчас ошибка
  showNotification(BACKEND_ERROR);
}

// ==== Модалка добавления ====

function showAddItemModal() {
  const modal   = document.getElementById('add-item-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  modal.classList.remove('hidden');
  content.style.transform = 'scale(0.95)';
  content.style.opacity   = '0';

  requestAnimationFrame(() => {
    content.style.transform = 'scale(1)';
    content.style.opacity   = '1';
  });

  setTimeout(() => {
    const input = document.getElementById('item-name');
    if (input) input.focus();
  }, 200);
}

function hideAddItemModal() {
  const modal   = document.getElementById('add-item-modal');
  const content = document.getElementById('modal-content');
  const form    = document.getElementById('add-item-form');
  if (!modal || !content) return;

  content.style.transform = 'scale(0.95)';
  content.style.opacity   = '0';

  setTimeout(() => {
    modal.classList.add('hidden');
    if (form) form.reset();
  }, 200);
}

function initializeAddItemForm() {
  const form = document.getElementById('add-item-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // В боевой версии тут создавался продукт в /inventory → сейчас просто ошибка
    showNotification(BACKEND_ERROR);
    hideAddItemModal();
  });
}

// ==== Общие обработчики ====

document.addEventListener('DOMContentLoaded', () => {
  initializeAddItemForm();
  renderShoppingList();
  updateStats();
});

// Закрытие модалки по клику по фону
document.addEventListener('click', (e) => {
  const modal = document.getElementById('add-item-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  if (e.target === modal) hideAddItemModal();
});

// Хоткеи: Ctrl/Cmd+N — открыть модалку, Esc — закрыть
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    showAddItemModal();
  }
  if (e.key === 'Escape') hideAddItemModal();
});

// ==== Экспорт в window для inline-обработчиков ====

window.showAddItemModal   = showAddItemModal;
window.hideAddItemModal   = hideAddItemModal;
window.toggleItem         = toggleItem;
window.removeItem         = removeItem;
window.generateFromMenu   = generateFromMenu;
window.clearAllPurchased  = clearAllPurchased;
