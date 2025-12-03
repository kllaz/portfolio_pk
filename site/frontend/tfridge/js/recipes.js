// ДЕМО-ВЕРСИЯ recipes.js БЕЗ БЭКЕНДА
// Рецепты храним в localStorage, никакого API и токенов

const RECIPES_STORAGE_KEY = 'mealplannerRecipes';

// Небольшой демо-справочник продуктов для автокомплита (можно расширить)
const DEMO_PRODUCTS = [
  { id: 1, name: 'Молоко', measurement: 'мл' },
  { id: 2, name: 'Яйца', measurement: 'шт' },
  { id: 3, name: 'Хлеб', measurement: 'г' },
  { id: 4, name: 'Сыр', measurement: 'г' },
  { id: 5, name: 'Масло сливочное', measurement: 'г' },
  { id: 6, name: 'Картофель', measurement: 'г' },
  { id: 7, name: 'Помидоры', measurement: 'г' },
];

let recipes = [];
let currentFilter = 'all';
let displayedRecipes = 8;
let allProducts = DEMO_PRODUCTS.slice(); // для автокомплита и парсинга ингредиентов

// автокомплит ингредиентов в модалке
let ingredientSuggestionsContainer = null;
let ingredientSuggestions = [];
let ingredientSearchDebounceId = null;
let ingredientActiveLineIndex = 0;

// ======================= Работа с localStorage =======================

function loadRecipesFromStorage() {
  const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
  if (!raw) {
    recipes = [];
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      recipes = [];
      return;
    }

    recipes = data.map((r, index) => {
      const id =
        r.id ??
        r.ID ??
        r.recipe_id ??
        r.RecipeID ??
        `local_${index}_${Date.now()}`;

      const ingredients = Array.isArray(r.ingredients)
        ? r.ingredients
        : Array.isArray(r.Ingredients)
        ? r.Ingredients
        : [];

      const steps = Array.isArray(r.steps)
        ? r.steps
        : Array.isArray(r.instructions)
        ? r.instructions
        : [];

      return {
        ...r,
        id,
        title: r.title || r.name || 'Без названия',
        description: r.description || '',
        ingredients,
        steps,
        instructions: r.instructions || steps,
      };
    });
  } catch (e) {
    console.warn('Не удалось распарсить рецепты из localStorage', e);
    recipes = [];
  }
}

function saveRecipesToStorage() {
  try {
    const plain = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      ingredients: r.ingredients || [],
      steps: r.steps || r.instructions || [],
    }));
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(plain));
  } catch (e) {
    console.warn('Не удалось сохранить рецепты в localStorage', e);
  }
}

// ======================= Вспомогательные функции =======================

function extractIngredientsFromRecipe(obj) {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj.ingredients) && obj.ingredients.length) return obj.ingredients;
  if (Array.isArray(obj.Ingredients) && obj.Ingredients.length) return obj.Ingredients;
  return [];
}

async function loadRecipeIngredientsIfNeeded(recipe) {
  // В демо-версии просто убеждаемся, что у рецепта есть поле ingredients
  recipe.ingredients = extractIngredientsFromRecipe(recipe);
  return recipe;
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

// Нормальное отображение ингредиента: "Название — 200 г"
function formatIngredientForDisplay(ingredient) {
  if (typeof ingredient === 'string') return ingredient;
  if (!ingredient || typeof ingredient !== 'object') return '';

  const name =
    ingredient.name ||
    ingredient.product_name ||
    ingredient.ProductName ||
    ingredient.title ||
    ingredient.Title ||
    'Ингредиент';

  const rawQty =
    ingredient.quantity ??
    ingredient.Quantity ??
    ingredient.amount ??
    ingredient.Amount ??
    '';

  const qty = String(rawQty || '').trim();

  const measurement =
    ingredient.measurement ||
    ingredient.Measurement ||
    ingredient.unit ||
    ingredient.Unit ||
    '';

  let text = String(name || '').trim() || 'Ингредиент';
  const parts = [];
  if (qty) parts.push(qty);
  if (measurement) parts.push(measurement);

  if (parts.length) {
    text += ' — ' + parts.join(' ');
  }

  return text;
}

// ======================= Инициализация =======================

document.addEventListener('DOMContentLoaded', function () {
  initializeFilters();
  initializeSearch();
  initializeLoadMore();
  initializeAddRecipeModal();
  loadRecipesFromStorage();
  renderRecipes();
});

// ======================= Загрузка / рендер рецептов =======================

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
    if (typeof anime !== 'undefined') {
      setTimeout(() => {
        anime({
          targets: card,
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 600,
          easing: 'easeOutCubic',
        });
      }, index * 100);
    } else {
      card.style.opacity = '1';
    }
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

// Карточка рецепта
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card rounded-2xl overflow-hidden shadow-lg cursor-pointer';
  card.style.opacity = '0';

  const imgSrc =
    recipe.image ||
    'https://picsum.photos/200/300';

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
            <div class="flex items-center space-x-3"></div>
            <button class="text-[#126df7] hover:text-[#1257bd] font-medium text-sm">Подробнее →</button>
        </div>
    </div>
  `;

  card.addEventListener('click', () => showRecipeModal(recipe));
  return card;
}

// ======================= Фильтры =======================

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

// ======================= Поиск =======================

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
        if (typeof anime !== 'undefined') {
          anime({
            targets: card,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 300,
            easing: 'easeOutCubic',
          });
        } else {
          card.style.opacity = '1';
        }
      } else {
        if (typeof anime !== 'undefined') {
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
        } else {
          card.style.display = 'none';
        }
      }
    });
  });
}

// ======================= Удаление рецепта (локально) =======================

function deleteRecipeById(recipeId) {
  recipes = recipes.filter((r) => r.id !== recipeId);
  saveRecipesToStorage();
  renderRecipes();
  hideRecipeModal();
}

// ======================= Кнопка "Загрузить ещё" =======================

function initializeLoadMore() {
  const loadMoreBtn = document.getElementById('load-more');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', function () {
    displayedRecipes += 4;
    renderRecipes();

    if (typeof anime !== 'undefined') {
      anime({
        targets: this,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeOutCubic',
      });
    }
  });
}

// ======================= Модалка с подробным рецептом =======================

async function showRecipeModal(recipe) {
  const modal = document.getElementById('recipe-modal');
  const content = document.getElementById('modal-content');
  const recipeContent = document.getElementById('modal-recipe-content');

  if (!modal || !content || !recipeContent) return;

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

  const rawInstructions = Array.isArray(fullRecipe.instructions)
    ? fullRecipe.instructions
    : Array.isArray(fullRecipe.steps)
    ? fullRecipe.steps
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
        <img src="${imgSrc}" alt="${escapeHtml(fullRecipe.title || '')}" class="w-full h-64 object-cover rounded-t-3xl">
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
                            (text) => <li class="flex items-center space-x-2"> <div class="w-2 h-2 bg-[#ffdd2d] rounded-full"></div> <span class="text-[#292929]">${escapeHtml(text)}</span> </li> ,
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
`;

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

confirmYes.addEventListener('click', (e) => {
  e.stopPropagation();
  confirmBox.classList.add('hidden');

  if (!recipe.id) {
    console.warn('Невозможно удалить рецепт: нет recipe.id');
    alert('Что-то пошло не так, id рецепта не найден.');
    return;
  }

  deleteRecipeById(recipe.id);
});

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

// ======================= Ховер-эффекты для карточек =======================

document.addEventListener(
'mouseenter',
function (e) {
const target = e.target;
if (!(target instanceof Element)) return;
const card = target.closest('.recipe-card');
if (card && typeof anime !== 'undefined') {
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
if (card && typeof anime !== 'undefined') {
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

// ======================= Модалка добавления рецепта =======================

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
if (errorEl) {
errorEl.classList.add('hidden');
errorEl.textContent = '';
}
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

form.addEventListener('submit', (e) => {
e.preventDefault();
if (errorEl) {
errorEl.classList.add('hidden');
errorEl.textContent = '';
}
const title = document.getElementById('new-title').value.trim();
const description = document.getElementById('new-description').value.trim();
const ingredientsRaw = document.getElementById('new-ingredients').value;
const instructionsRaw = document.getElementById('new-instructions').value;

const ingredientLines = ingredientsRaw
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const steps = instructionsRaw
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

if (!title) {
  if (errorEl) {
    errorEl.textContent = 'Название рецепта обязательно.';
    errorEl.classList.remove('hidden');
  }
  return;
}

if (!ingredientLines.length) {
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

// Разбираем строки вида "Молоко — 200 мл"
const ingredients = ingredientLines.map((line) => {
  const [namePart, restRaw] = line.split(/[-—]/, 2);
  const name = (namePart || '').trim();
  const rest = (restRaw || '').trim();

  let quantity = '';
  let measurement = '';

  if (rest) {
    const m = rest.match(/^(\d+)\s*(.*)$/);
    if (m) {
      quantity = m[1];
      measurement = m[2].trim();
    } else {
      measurement = rest;
    }
  }

  return {
    name,
    quantity,
    measurement,
  };
});

const newRecipe = {
  id: Date.now().toString(),
  title,
  description,
  ingredients,
  steps,
  instructions: steps,
};

recipes.unshift(newRecipe);
saveRecipesToStorage();
displayedRecipes = Math.max(displayedRecipes, recipes.length);
renderRecipes();
closeModal();
});

initIngredientAutocomplete();
}

// ======================= Автокомплит ингредиентов =======================

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

ingredientSearchDebounceId = setTimeout(() => {
if (!allProducts.length) return;
const lower = query.toLowerCase();
const matches = allProducts
  .filter((p) => {
    if (!p.name) return false;
    const name = p.name.toLowerCase();
    return name.startsWith(lower);
  })
  .slice(0, 10);

ingredientSuggestions = matches;
renderIngredientSuggestions(matches);
}, 200);
}

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
(p, index) => <button type="button" data-ing-index="${index}" class="w-full text-left px-3 py-2 hover:bg-gray-100" > ${escapeHtml(p.name || '')} </button> ,
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

const prefix = `${product.name}`;
const spacer = measurement ? ' ' : '';
const newLine = prefix + spacer + (measurement || '');

lines[lineIndex] = newLine;
textarea.value = lines.join('\n');

let pos = 0;
for (let i = 0; i < lines.length; i++) {
if (i < lineIndex) {
pos += lines[i].length + 1;
} else if (i === lineIndex) {
pos += prefix.length;
break;
}
}

textarea.focus();
textarea.setSelectionRange(pos, pos);

hideIngredientSuggestions();
}