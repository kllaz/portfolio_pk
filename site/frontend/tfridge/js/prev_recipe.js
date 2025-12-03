// Базовый URL берём из auth.js (API_BASE_URL) и добавляем /api/v1

const API_V1_BASE = `${API_BASE_URL}/api/v1`;

const RECIPES_BASE = `${API_V1_BASE}/recipes`;
const USER_RECIPES_ENDPOINT = RECIPES_BASE;
const PRODUCTS_BASE = `${API_V1_BASE}/products`;


let recipes = [];
let currentFilter = 'all';
let displayedRecipes = 8;
let allProducts = []; // 👈 сюда сложим продукты
// автокомплит ингредиентов в модалке
let ingredientSuggestionsContainer = null;
let ingredientSuggestions = [];
let ingredientSearchDebounceId = null;
let ingredientActiveLineIndex = 0;



// JWT, который кладём в localStorage при логине
function getAuthToken() {
  // сначала пытаемся вытащить токен из того же объекта, что и для ЛК
  try {
    const rawUser = localStorage.getItem('mealplannerUser');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user && user.token) return user.token;
    }
  } catch (e) {
    console.warn('Не удалось распарсить mealplannerUser', e);
  }

  // затем — из отдельных ключей
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwtToken')
  );
}

function findProductIdByName(name) {
  if (!name) return null;
  const lower = name.trim().toLowerCase();
  const found = allProducts.find(
    (p) => (p.name || '').trim().toLowerCase() === lower,
  );
  return found ? found.id : null;
}

async function loadAllProducts() {
  const token = getAuthToken();
  if (!token) {
    console.warn('Нет токена — продукты не загружаем');
    return;
  }

  try {
    const res = await fetch(PRODUCTS_BASE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn('Не удалось загрузить список продуктов:', res.status);
      return;
    }

    allProducts = await res.json();
    console.log('Загружены продукты для рецептов:', allProducts.length);

    // после загрузки продуктов перерисовываем рецепты,
    // чтобы появились названия и единицы
    renderRecipes();
  } catch (e) {
    console.error('Ошибка сети при загрузке продуктов:', e);
  }
}


document.addEventListener('DOMContentLoaded', function () {
  initializeFilters();
  initializeSearch();
  initializeLoadMore();
  initializeAddRecipeModal();

  loadAllProducts();      // 👈 новое
  fetchRecipesFromServer();
});

// ===== Загрузка рецептов пользователя с бэка =====
async function fetchRecipesFromServer() {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(USER_RECIPES_ENDPOINT, {
      method: 'GET',
      headers,
    });

if (res.status === 401) {
  if (window.handleUnauthorized) {
    window.handleUnauthorized();
  } else if (window.clearUserSession) {
    window.clearUserSession();
    window.location.href = 'login.html';
  } else {
    window.location.href = 'login.html';
  }
  return;
}

    if (!res.ok) {
      console.error('Ошибка загрузки рецептов:', res.status);
      recipes = [];
      renderRecipes();
      return;
    }

    const data = await res.json().catch(() => null);

    let list = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.recipes)) {
      list = data.recipes;
    }

recipes = list.map((r) => {
  let instructions = [];

  if (Array.isArray(r.steps)) {
    instructions = r.steps;
  } else if (typeof r.steps === 'string' && r.steps.length > 0) {
    // режем сначала по |STEP|, потом внутри по \n
    const chunks = r.steps
      .split('|STEP|')
      .map((s) => s.trim())
      .filter(Boolean);

    instructions = chunks.flatMap((chunk) =>
      chunk
        .replace(/\r\n/g, '\n')
        .replace(/\\n/g, '\n')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } else if (Array.isArray(r.instructions)) {
    instructions = r.instructions;
  }

  // 👇 вот тут уже используем универсальный парсер
  const ingredients = extractIngredientsFromRecipe(r);

  return {
    ...r,
    ingredients,
    instructions,
  };
});


    displayedRecipes = 8;
    renderRecipes();
  } catch (e) {
    console.error('Ошибка сети при загрузке рецептов:', e);
    recipes = [];
    renderRecipes();
  }
}



// ===== Рендер карточек =====
function renderRecipes() {
  const grid = document.getElementById('recipes-grid');
  if (!grid) return;

  const filteredRecipes =
    currentFilter === 'all'
      ? recipes
      : recipes.filter((recipe) => recipe.category === currentFilter);

  const recipesToShow = filteredRecipes.slice(0, displayedRecipes);

  grid.innerHTML = '';

  if (recipesToShow.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center text-gray-500">
        Пока здесь пусто. Добавьте свой первый рецепт кнопкой «Добавить рецепт» выше.
      </div>
    `;

    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  recipesToShow.forEach((recipe, index) => {
    const card = createRecipeCard(recipe);
    grid.appendChild(card);

    // Анимация появления
    setTimeout(() => {
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 600,
        easing: 'easeOutCubic',
      });
    }, index * 100);
  });

  // Кнопка "Загрузить ещё"
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    if (displayedRecipes >= filteredRecipes.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-flex';
    }
  }
}

// ===== Карточка рецепта =====
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card rounded-2xl overflow-hidden shadow-lg cursor-pointer';
  card.style.opacity = '0';

  const imgSrc =
    recipe.image ||
    'https://picsum.photos/200/300';

  const timeLabel = recipe.time ? `${recipe.time} мин` : '—';
  const ratingLabel = typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : '—';
  const servingsLabel = recipe.servings || '—';

  card.innerHTML = `
    <div class="relative">
        <img src="${imgSrc}" alt="${escapeHtml(recipe.title || '')}" class="w-full h-48 object-cover">
    </div>
    <div class="p-6">
        <h3 class="font-display text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          ${escapeHtml(recipe.title || '')}
        </h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
          ${escapeHtml(recipe.description || '')}
        </p>
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
            </div>
            <button class="text-[#126df7] hover:text-[#1257bd] font-medium text-sm">Подробнее →</button>
        </div>
    </div>
  `;

  card.addEventListener('click', () => showRecipeModal(recipe));
  return card;
}

function formatIngredientForDisplay(ingredient) {
  // если вдруг пришла просто строка
  if (typeof ingredient === 'string') return ingredient;
  if (!ingredient || typeof ingredient !== 'object') return '';

  // 1) пробуем достать вложенный продукт (если бэк когда-нибудь начнёт его присылать)
  let product = ingredient.product || ingredient.Product || null;

  // 2) пробуем вытащить id продукта из всех разумных вариантов ключей
  const productID =
    ingredient.product_id ??        // snake_case
    ingredient.productId ??         // camelCase
    ingredient.ProductID ??         // PascalCase
    ingredient.prioductId ??        // на всякий случай с опечаткой
    null;

  // 3) имя продукта, которое мог прислать бэк прямо в ингредиенте
  const productNameField =
    ingredient.product_name ||
    ingredient.ProductName ||
    ingredient.productName ||
    ingredient.Product_Name ||
    ingredient.name ||
    ingredient.Name ||
    null;

  // 4) если есть productID — ищем продукт в allProducts по id
  if (!product && productID != null && Array.isArray(allProducts) && allProducts.length) {
    const idNum = Number(productID);
    if (!Number.isNaN(idNum)) {
      const foundById = allProducts.find(
        (p) => Number(p.id ?? p.ID) === idNum,
      );
      if (foundById) {
        product = foundById;
      }
    }
  }

  // 5) если product нет, но есть имя — пробуем найти по имени
  if (!product && productNameField && Array.isArray(allProducts) && allProducts.length) {
    const lower = String(productNameField).trim().toLowerCase();
    const found = allProducts.find((p) =>
      String(p.name || p.Name || '').trim().toLowerCase() === lower,
    );
    if (found) {
      product = found;
    }
  }

  // 6) итоговое имя для отображения
  const name =
    (product && (product.name || product.Name)) ||
    productNameField ||
    'Ингредиент';

  // 7) количество
  const rawQty =
    ingredient.quantity ??
    ingredient.Quantity ??
    ingredient.amount ??
    ingredient.Amount ??
    '';

  const qty = String(rawQty || '').trim();

  // 8) единица измерения — сначала из самого ингредиента, потом из продукта
  const measurement =
    ingredient.measurement ||
    ingredient.Measurement ||
    ingredient.unit ||
    ingredient.Unit ||
    (product && (product.measurement || product.Measurement || product.unit || product.Unit)) ||
    '';

  // 9) собираем финальный текст
  let text = String(name || '').trim() || 'Ингредиент';
  const parts = [];
  if (qty) parts.push(qty);
  if (measurement) parts.push(measurement);

  if (parts.length) {
    text += ' — ' + parts.join(' ');
  }

  return text;
}


function extractIngredientsFromRecipe(obj) {
  if (!obj || typeof obj !== 'object') return [];

  if (Array.isArray(obj.ingredients) && obj.ingredients.length) return obj.ingredients;
  if (Array.isArray(obj.Ingredients) && obj.Ingredients.length) return obj.Ingredients;
  if (Array.isArray(obj.recipeIngredients) && obj.recipeIngredients.length) return obj.recipeIngredients;
  if (Array.isArray(obj.RecipeIngredients) && obj.RecipeIngredients.length) return obj.RecipeIngredients;

  return [];
}

async function loadRecipeIngredientsIfNeeded(recipe) {
  if (!recipe || !recipe.id) return recipe;

  // если уже есть ингредиенты — ничего не делаем
  const existing = extractIngredientsFromRecipe(recipe);
  if (existing.length) {
    recipe.ingredients = existing;
    return recipe;
  }

  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${RECIPES_BASE}/${recipe.id}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      console.warn('Не удалось догрузить ингредиенты для рецепта', recipe.id, res.status);
      return recipe;
    }

    const full = await res.json();

    const ing = extractIngredientsFromRecipe(full);
    if (ing.length) {
      recipe.ingredients = ing;
    }

    // заодно можем обновить инструкции, если в детальном ответе они есть
    if (!recipe.instructions || !recipe.instructions.length) {
      let instructions = [];

      if (Array.isArray(full.steps)) {
        instructions = full.steps;
      } else if (typeof full.steps === 'string' && full.steps.length > 0) {
        const normalized = full.steps
          .replace(/\r\n/g, '\n')
          .replace(/\\n/g, '\n');
        instructions = normalized
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (instructions.length) {
        recipe.instructions = instructions;
      }
    }

    return recipe;
  } catch (e) {
    console.error('Ошибка при подгрузке ингредиентов', e);
    return recipe;
  }
}


function extractIngredientsFromRecipe(obj) {
  if (!obj || typeof obj !== 'object') return [];

  if (Array.isArray(obj.ingredients) && obj.ingredients.length) return obj.ingredients;
  if (Array.isArray(obj.Ingredients) && obj.Ingredients.length) return obj.Ingredients;
  if (Array.isArray(obj.recipeIngredients) && obj.recipeIngredients.length) return obj.recipeIngredients;
  if (Array.isArray(obj.RecipeIngredients) && obj.RecipeIngredients.length) return obj.RecipeIngredients;

  return [];
}

async function loadRecipeIngredientsIfNeeded(recipe) {
  if (!recipe || !recipe.id) return recipe;

  // если уже есть ингредиенты — ничего не делаем
  const existing = extractIngredientsFromRecipe(recipe);
  if (existing.length) {
    recipe.ingredients = existing;
    return recipe;
  }

  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${RECIPES_BASE}/${recipe.id}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      console.warn('Не удалось догрузить ингредиенты для рецепта', recipe.id, res.status);
      return recipe;
    }

    const full = await res.json();

    const ing = extractIngredientsFromRecipe(full);
    if (ing.length) {
      recipe.ingredients = ing;
    }

    // заодно можем обновить инструкции, если в детальном ответе они есть
    if (!recipe.instructions || !recipe.instructions.length) {
      let instructions = [];

      if (Array.isArray(full.steps)) {
        instructions = full.steps;
      } else if (typeof full.steps === 'string' && full.steps.length > 0) {
        const normalized = full.steps
          .replace(/\r\n/g, '\n')
          .replace(/\\n/g, '\n');
        instructions = normalized
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (instructions.length) {
        recipe.instructions = instructions;
      }
    }

    return recipe;
  } catch (e) {
    console.error('Ошибка при подгрузке ингредиентов', e);
    return recipe;
  }
}


// простая экранизация, чтобы не словить XSS от пользовательского ввода
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== Фильтры =====
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');

      currentFilter = this.dataset.filter;
      displayedRecipes = 8;

      renderRecipes();
    });
  });
}

// ===== Поиск =====
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const cards = document.querySelectorAll('.recipe-card');

    cards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const description = card.querySelector('p')?.textContent.toLowerCase() || '';

      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
        anime({
          targets: card,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 300,
          easing: 'easeOutCubic',
        });
      } else {
        anime({
          targets: card,
          opacity: [1, 0],
          scale: [1, 0.9],
          duration: 300,
          easing: 'easeOutCubic',
          complete: () => {
            card.style.display = 'none';
          },
        });
      }
    });
  });
}

async function deleteRecipeById(recipeId) {
  const token = getAuthToken();
  if (!token) {
    alert('Чтобы удалить рецепт, войдите в аккаунт.');
    return;
  }

  try {
    const res = await fetch(`${RECIPES_BASE}/${recipeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

if (res.status === 401) {
  handleSessionExpired();
  return;
}


    // рецепт уже не существует в новой базе:
    // считаем, что он и так удалён, просто чистим фронт
    if (res.status === 404) {
      console.warn('Рецепт не найден на сервере, удаляем локально');
      recipes = recipes.filter((r) => r.id !== recipeId);
      renderRecipes();
      hideRecipeModal();
      return;
    }

    // любая другая ошибка — показываем alert и не трогаем список
    if (!res.ok) {
      console.error('Не удалось удалить рецепт. Код:', res.status);
      alert('Не удалось удалить рецепт. Попробуйте ещё раз.');
      return;
    }

    // обычный успешный кейс
    recipes = recipes.filter((r) => r.id !== recipeId);
    renderRecipes();
    hideRecipeModal();
  } catch (e) {
    console.error('Ошибка при удалении рецепта:', e);
    alert('Ошибка сети. Проверьте подключение.');
  }
}

// ===== Кнопка "Загрузить ещё" =====
function initializeLoadMore() {
  const loadMoreBtn = document.getElementById('load-more');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', function () {
    displayedRecipes += 4;
    renderRecipes();

    anime({
      targets: this,
      scale: [1, 0.95, 1],
      duration: 200,
      easing: 'easeOutCubic',
    });
  });
}

// ===== Модалка с подробным рецептом (осталась почти без изменений) =====
async function showRecipeModal(recipe) {
  const modal = document.getElementById('recipe-modal');
  const content = document.getElementById('modal-content');
  const recipeContent = document.getElementById('modal-recipe-content');

  if (!modal || !content || !recipeContent) return;

  // безопасно дотягиваем полные данные
  let fullRecipe = await loadRecipeIngredientsIfNeeded(recipe);
  if (!fullRecipe) {
    fullRecipe = recipe;
  }

  const imgSrc =
    fullRecipe.image ||
    'https://picsum.photos/200/300';

  const ingredients = Array.isArray(fullRecipe.ingredients)
    ? fullRecipe.ingredients
    : [];

  // Берём массив инструкций и режем по переносам
  const rawInstructions = Array.isArray(fullRecipe.instructions)
    ? fullRecipe.instructions
    : typeof fullRecipe.instructions === 'string'
      ? [fullRecipe.instructions]
      : [];

  const instructions = rawInstructions
    .flatMap((instruction) => {
      if (typeof instruction !== 'string') return [];

      const normalized = instruction
        .replace(/\r\n/g, '\n')
        .replace(/\\n/g, '\n');

      return normalized
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    });

    recipeContent.innerHTML = `
    <div class="relative">
        <img src="${imgSrc}" alt="${escapeHtml(recipe.title || '')}" class="w-full h-64 object-cover rounded-t-3xl">
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-3xl"></div>
        <div class="absolute bottom-6 left-6 text-white">
            <h2 class="font-display text-3xl font-bold mb-2">${escapeHtml(fullRecipe.title || '')}</h2>
            <p class="text-lg opacity-90">${escapeHtml(fullRecipe.description || '')}</p>
        </div>
    </div>
    
    <div class="p-8">
        
        <div class="grid md:grid-cols-2 gap-8">
            <div>
                <h3 class="font-display text-xl font-semibold text-gray-800 mb-4">Ингредиенты</h3>
                <ul class="space-y-2">
${ingredients
  .map((ingredient) => formatIngredientForDisplay(ingredient))
  .filter(Boolean)
  .map(
    (text) => `
      <li class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-[#ffdd2d] rounded-full"></div>
          <span class="text-[#292929]">${escapeHtml(text)}</span>
      </li>
  `,
  )
  .join('')}


                </ul>
            </div>
            
            <div>
                <h3 class="font-display text-xl font-semibold text-gray-800 mb-4">Инструкции</h3>
                <ol class="space-y-3">
                    ${instructions
                      .map(
                        (instruction, index) => `
                        <li class="flex space-x-3">
                            <div class="flex-shrink-0 w-6 h-6 bg-[#ffdd2d] text-[#292929] rounded-full flex items-center justify-center text-sm font-medium">
                                ${index + 1}
                            </div>
                            <span class="text-[#292929]">${escapeHtml(instruction)}</span>
                        </li>
                    `,
                      )
                      .join('')}
                </ol>
            </div>
        </div>
        
        <div class="flex gap-4 mt-8">
            <button class="flex-1 bg-[#f6f7f8] text-[#292929] py-3 rounded-xl hover:bg-[#e9e9e9] font-semibold transition-all duration-300">
                Добавить в меню
            </button>

            <button
              id="delete-recipe-btn"
              class="flex-1 border border-red-200 text-red-600 py-3 rounded-xl hover:bg-red-50 font-semibold transition-all duration-300"
            >
              Удалить рецепт
            </button>
        </div>

        <!-- Уже существующее окно, но теперь как центрированный оверлей -->
        <div
          id="delete-confirm"
          class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div class="w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl p-6 text-sm text-[#292929]">
            <p class="mb-4 text-base">
              Данное действие безвозвратно удалит рецепт. Продолжить?
            </p>
            <div class="flex justify-end gap-3">
              <button
                id="confirm-delete-no"
                class="px-4 py-2 rounded-xl border border-gray-300 text-[#292929] hover:bg-gray-50"
              >
                Нет
              </button>
              <button
                id="confirm-delete-yes"
                class="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Да
              </button>
            </div>
          </div>
        </div>
        </div>
    </div>
  `;

    // После recipeContent.innerHTML = `...`;

  const deleteBtn = document.getElementById('delete-recipe-btn');
  const confirmBox = document.getElementById('delete-confirm');
  const confirmYes = document.getElementById('confirm-delete-yes');
  const confirmNo = document.getElementById('confirm-delete-no');

  if (deleteBtn && confirmBox && confirmYes && confirmNo) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmBox.classList.remove('hidden');
    });

    confirmNo.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmBox.classList.add('hidden');
    });

    confirmYes.addEventListener('click', async (e) => {
      e.stopPropagation();
      confirmBox.classList.add('hidden');

      if (!recipe.id) {
        console.warn('Невозможно удалить рецепт: нет recipe.id');
        alert('Что-то пошло не так, id рецепта не найден.');
        return;
      }

      await deleteRecipeById(recipe.id);
    });

        // клик по фону закрывает окно
    confirmBox.addEventListener('click', (e) => {
      if (e.target === confirmBox) {
        confirmBox.classList.add('hidden');
      }
    });

  }


  modal.classList.remove('hidden');

  setTimeout(() => {
    content.style.transform = 'scale(1)';
    content.style.opacity = '1';
  }, 10);
}

function hideRecipeModal() {
  const modal = document.getElementById('recipe-modal');
  const content = document.getElementById('modal-content');

  if (!modal || !content) return;

  content.style.transform = 'scale(0.95)';
  content.style.opacity = '0';

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

document.getElementById('recipe-modal')?.addEventListener('click', function (e) {
  if (e.target === this) {
    hideRecipeModal();
  }
});
// Ховер-эффекты на карточки =====
document.addEventListener(
  'mouseenter',
  function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const card = target.closest('.recipe-card');
    if (card) {
      anime({
        targets: card,
        scale: 1.02,
        duration: 200,
        easing: 'easeOutCubic',
      });
    }
  },
  true,
);

document.addEventListener(
  'mouseleave',
  function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const card = target.closest('.recipe-card');
    if (card) {
      anime({
        targets: card,
        scale: 1,
        duration: 200,
        easing: 'easeOutCubic',
      });
    }
  },
  true,
);


// ===== Модалка добавления рецепта =====
function initializeAddRecipeModal() {
  const openBtn = document.getElementById('open-add-recipe');
  const modal = document.getElementById('add-recipe-modal');
  const closeBtn = document.getElementById('close-add-recipe');
  const cancelBtn = document.getElementById('cancel-add-recipe');
  const form = document.getElementById('add-recipe-form');
  const errorEl = document.getElementById('add-recipe-error');

  if (!openBtn || !modal || !form) return;

  function openModal() {
    modal.classList.remove('hidden');
    errorEl && (errorEl.classList.add('hidden'), (errorEl.textContent = ''));
  }

  function closeModal() {
    modal.classList.add('hidden');
    form.reset();
    if (errorEl) {
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (errorEl) {
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
  }

  const title = document.getElementById('new-title').value.trim();
  const description = document.getElementById('new-description').value.trim();
  const ingredientsRaw = document.getElementById('new-ingredients').value;
  const instructionsRaw = document.getElementById('new-instructions').value;

  const ingredients = ingredientsRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const steps = instructionsRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  // проверки title / ingredients / steps — оставь как я писал:
  // (можешь просто заменить свой блок проверок этим)

  if (!title) {
    if (errorEl) {
      errorEl.textContent = 'Название рецепта обязательно';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (!ingredients.length) {
    if (errorEl) {
      errorEl.textContent = 'Добавьте хотя бы один ингредиент.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (!steps.length) {
    if (errorEl) {
      errorEl.textContent = 'Добавьте хотя бы один шаг приготовления.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  const token = getAuthToken();
  if (!token) {
    if (errorEl) {
      errorEl.textContent = 'Нужно войти, чтобы сохранять рецепты.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (!allProducts.length) {
    if (errorEl) {
      errorEl.textContent =
        'Не удалось загрузить список продуктов. Обновите страницу и попробуйте ещё раз.';
      errorEl.classList.remove('hidden');
    }
    return;
  }
  const ingredientsForApi = [];

  for (const line of ingredients) {
    const [namePart, qtyPartRaw] = line.split(/[-—]/, 2);
    const name = (namePart || '').trim();
    const qtyText = (qtyPartRaw || '').trim(); // например, "200 г" или "200 мл"

    if (!name) continue;

    // ищем продукт по имени из справочника
    const product = allProducts.find(
      (p) => (p.name || '').trim().toLowerCase() === name.toLowerCase(),
    );

    if (!product) {
      if (errorEl) {
        errorEl.textContent = `Продукт "${name}" не найден в базе. Выберите его из подсказок или поправьте название.`;
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (!qtyText) {
      if (errorEl) {
        errorEl.textContent = `Для ингредиента "${name}" укажите количество (целое число).`;
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // ❗ Берём только число в начале строки, всё после (г, мл и т.п.) игнорируем
    const match = qtyText.match(/^(\d+)/);
    if (!match) {
      if (errorEl) {
        errorEl.textContent =
          `Количество для "${name}" должно быть целым числом (без единицы измерения — она подставляется автоматически).`;
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const qty = parseInt(match[1], 10);

    const measurement =
      product.measurement ||
      product.Measurement ||
      product.unit ||
      product.Unit ||
      '';

    ingredientsForApi.push({
      // то, что нужно бэку:
      product_id: product.id,
      quantity: qty,

      // то, что нужно фронту для красивого отображения:
      name: product.name,
      measurement,
      unit: measurement,
    });
  }

  if (!ingredientsForApi.length) {
    if (errorEl) {
      errorEl.textContent =
        'Не получилось собрать список ингредиентов. Проверьте формат строк.';
      errorEl.classList.remove('hidden');
    }
    return;
  }


  if (!ingredientsForApi.length) {
    if (errorEl) {
      errorEl.textContent =
        'Не получилось собрать список ингредиентов. Проверьте формат строк.';
      errorEl.classList.remove('hidden');
    }
    return;
  }




  if (!ingredientsForApi.length) {
    if (errorEl) {
      errorEl.textContent =
        'Не получилось собрать список ингредиентов. Проверьте формат строк.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  const payload = {
    title,
    description,
    ingredients: ingredientsForApi,
    steps,
  };



  try {
    const res = await fetch(RECIPES_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

if (res.status === 401) {
  if (window.handleUnauthorized) {
    window.handleUnauthorized();
  } else if (window.clearUserSession) {
    window.clearUserSession();
    window.location.href = 'login.html';
  } else {
    window.location.href = 'login.html';
  }
  return;
}


    if (!res.ok) {
      if (errorEl) {
        errorEl.textContent = 'Не удалось сохранить рецепт. Попробуйте ещё раз.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const createdFromServer = await res.json();

    // Если сервер вернул свои ингредиенты — берём их,
    // иначе используем наш локальный разбор (с name + measurement)
    const createdIngredients =
      Array.isArray(createdFromServer.ingredients) && createdFromServer.ingredients.length
        ? createdFromServer.ingredients
        : ingredientsForApi;

    // То же самое с инструкциями: пробуем steps / instructions с бэка,
    // а если пусто — падаем обратно на то, что ввёл пользователь
    const createdInstructions =
      Array.isArray(createdFromServer.steps)
        ? createdFromServer.steps
        : Array.isArray(createdFromServer.instructions)
          ? createdFromServer.instructions
          : steps;

    const created = {
      ...createdFromServer,
      ingredients: createdIngredients,
      instructions: createdInstructions,
    };


    recipes.unshift(created);
    displayedRecipes = Math.max(displayedRecipes, recipes.length);
    renderRecipes();
    closeModal();
  } catch (err) {
    console.error('Ошибка при сохранении рецепта:', err);
    if (errorEl) {
      errorEl.textContent = 'Ошибка сети. Проверьте подключение.';
      errorEl.classList.remove('hidden');
    }
  }
});
initIngredientAutocomplete();

}


// ===== Автокомплит ингредиентов по префиксу =====

function initIngredientAutocomplete() {
  const textarea = document.getElementById('new-ingredients');
  if (!textarea) return;

  const parent = textarea.parentElement || textarea;

  ingredientSuggestionsContainer = document.createElement('div');
  ingredientSuggestionsContainer.id = 'ingredient-suggestions';
  ingredientSuggestionsContainer.className =
    'mt-1 border border-gray-200 rounded-xl bg-white shadow-lg max-h-60 overflow-y-auto text-sm hidden z-50';
  parent.appendChild(ingredientSuggestionsContainer);

  textarea.addEventListener('input', handleIngredientTextareaInput);

  ingredientSuggestionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ing-index]');
    if (!btn) return;

    const index = Number(btn.dataset.ingIndex);
    const product = ingredientSuggestions[index];
    if (!product) return;

    applyIngredientSuggestion(product);
  });

  // клик вне — скрываем подсказки
  document.addEventListener('click', (e) => {
    if (!ingredientSuggestionsContainer) return;
    const textarea = document.getElementById('new-ingredients');
    if (textarea && (textarea === e.target || textarea.contains(e.target))) return;
    if (ingredientSuggestionsContainer.contains(e.target)) return;
    hideIngredientSuggestions();
  });
}

function handleIngredientTextareaInput(e) {
  const textarea = e.target;
  const text = textarea.value;
  const caretPos = textarea.selectionStart;

  const ctx = getIngredientLineContext(text, caretPos);
  ingredientActiveLineIndex = ctx.lineIndex;

  const query = ctx.namePrefix;
  if (!query) {
    hideIngredientSuggestions();
    return;
  }

  if (ingredientSearchDebounceId) {
    clearTimeout(ingredientSearchDebounceId);
  }

  ingredientSearchDebounceId = setTimeout(async () => {
    if (!allProducts.length) {
      await loadAllProducts();
    }
    if (!allProducts.length) return;

    const lower = query.toLowerCase();
    const matches = allProducts
      .filter((p) => {
        if (!p.name) return false;
        const name = p.name.toLowerCase();
        return name.startsWith(lower); // префикс
      })
      .slice(0, 10);

    ingredientSuggestions = matches;
    renderIngredientSuggestions(matches);
  }, 200);
}

// Возвращает: индекс строки, полный текст строки, и то, что до дефиса — как префикс
function getIngredientLineContext(text, caretPos) {
  const beforeCaret = text.slice(0, caretPos);
  const linesBefore = beforeCaret.split('\n');
  const lineIndex = linesBefore.length - 1;

  const allLines = text.split('\n');
  const fullLine = allLines[lineIndex] || '';

  const lineBeforeCaret = linesBefore[linesBefore.length - 1] || '';
  const [namePart] = lineBeforeCaret.split(/[-—]/, 1);
  const namePrefix = (namePart || '').trim();

  return { lineIndex, fullLine, namePrefix };
}

function renderIngredientSuggestions(list) {
  if (!ingredientSuggestionsContainer) return;

  if (!list.length) {
    hideIngredientSuggestions();
    return;
  }

  ingredientSuggestionsContainer.innerHTML = list
    .map(
      (p, index) => `
        <button
          type="button"
          data-ing-index="${index}"
          class="w-full text-left px-3 py-2 hover:bg-gray-100"
        >
          ${escapeHtml(p.name || '')}
        </button>
      `,
    )
    .join('');

  ingredientSuggestionsContainer.classList.remove('hidden');
}

function hideIngredientSuggestions() {
  if (!ingredientSuggestionsContainer) return;
  ingredientSuggestionsContainer.classList.add('hidden');
  ingredientSuggestionsContainer.innerHTML = '';
  ingredientSuggestions = [];
}

function applyIngredientSuggestion(product) {
  const textarea = document.getElementById('new-ingredients');
  if (!textarea) return;

  const lines = textarea.value.split('\n');
  const lineIndex = ingredientActiveLineIndex || 0;

  const measurement =
    product.measurement ||
    product.Measurement ||
    product.unit ||
    product.Unit ||
    '';

  const prefix = `${product.name} — `;   // сюда потом вводим число
  const hasMeasurement = Boolean(measurement);
  const spacer = hasMeasurement ? ' ' : '';
  const newLine = prefix + spacer + (measurement || '');

  lines[lineIndex] = newLine;
  textarea.value = lines.join('\n');

  // считаем позицию курсора в общем тексте:
  // ставим прямо после "name — "
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i < lineIndex) {
      pos += lines[i].length + 1; // + '\n'
    } else if (i === lineIndex) {
      pos += prefix.length;
      break;
    }
  }

  textarea.focus();
  textarea.setSelectionRange(pos, pos);

  hideIngredientSuggestions();
}
