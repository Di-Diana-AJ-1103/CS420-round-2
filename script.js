const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const applianceSelect = document.getElementById('appliance-select');
const categorySelect = document.getElementById('category-select');
const paginationContainer = document.getElementById('pagination-container');
let allMeals = [];
let currentPage = 1;
//Variable for Favorites: Sasha Koroleva
let favorites = [];
const itemsPerPage = 12;

searchBtn.addEventListener('click', () => {
    currentPage = 1;
    getMealList();
});
mealList.addEventListener('click', (e) => {
    if (e.target.classList.contains('recipe-btn')) {
        const mealItem = e.target.parentElement.parentElement;
        getMealRecipe(mealItem.dataset.id);
    }
    // Event listener for adding to favorites Sasha Koroleva
    if (e.target.classList.contains('add-favorite-btn')) {
        const mealItem = e.target.parentElement.parentElement;
        const mealId = mealItem.dataset.id;
        addToFavorites(mealId); // Call the add to favorites function
    }
});
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim().toLowerCase();
    let selectedAppliance = applianceSelect.value.toLowerCase();
    let selectedCategory = categorySelect.value.toLowerCase();
    let url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

    let filteredMeals = allMeals;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if (data.meals) {
            let filteredMeals = data.meals;

            if (searchInputTxt || selectedAppliance || selectedCategory) {
                filteredMeals = data.meals.filter(meal => {
                    const instructionsMatch = meal.strInstructions.includes(searchInputTxt);
                    const applianceMatch = selectedAppliance ? meal.strInstructions.toLowerCase().includes(selectedAppliance) : true;
                    const categoryMatch = selectedCategory ? meal.strCategory.toLowerCase().includes(selectedCategory) : true;
                    return instructionsMatch && applianceMatch && categoryMatch;
                });
            }

            const paginatedMeals = paginate(filteredMeals, itemsPerPage, currentPage);
            paginatedMeals.forEach(meal => {
                html += `
                    <div class="meal-item" data-id="${meal.idMeal}">
                        <div class="meal-img">
                            <img src="${meal.strMealThumb}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                            <button class="add-favorite-btn btn" data-id="${meal.idMeal}">Add to Favorites</button>
                        </div>
                    </div>
                `;
            });

            mealList.innerHTML = html;
            renderPagination(filteredMeals.length, itemsPerPage, currentPage);
        } else {
            mealList.innerHTML = "No meals found";
            paginationContainer.innerHTML = "";
        }
    });
}

function getMealRecipe(id) {
    let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let meal = data.meals[0];
        let html = `
            <h2 class="recipe-title">${meal.strMeal}</h2>
            <p class="recipe-category">${meal.strCategory}</p>
            <div class="recipe-instruct">
                <h3>Instructions:</h3>
                <p>${meal.strInstructions}</p>
            </div>
            <div class="recipe-meal-img">
                <img src="${meal.strMealThumb}" alt="">
            </div>
            <div class="recipe-link">
                <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
            </div>
        `;
        mealDetailsContent.innerHTML = html;
        mealDetailsContent.parentElement.classList.add('showRecipe');
    });
}
// Add meals to favorites - Sasha Koroleva
function addToFavorites(mealId) {
    if (!favorites.includes(mealId)) {
        favorites.push(mealId);
        saveFavorites();
        renderFavorites();
    } else {
        alert("This meal is already in your favorites!");
    }
}

// Render favorites - Sasha Koroleva
function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';

    favorites.forEach(id => {
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
            .then(response => response.json())
            .then(data => {
                const meal = data.meals[0];
                const mealItem = document.createElement('div');
                mealItem.classList.add('meal-item');
                mealItem.setAttribute('data-id', meal.idMeal);
                mealItem.innerHTML = `
                    <div class="meal-img">
                        <img src="${meal.strMealThumb}" alt="food">
                    </div>
                    <div class="meal-name">
                        <h3>${meal.strMeal}</h3>
                        <button class="remove-favorite-btn btn" data-id="${meal.idMeal}">Remove</button>
                    </div>
                `;

                mealItem.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('remove-favorite-btn')) {
                        getMealRecipe(mealItem.dataset.id);
                    }
                });

                mealItem.querySelector('.remove-favorite-btn').addEventListener('click', (e) => {
                    const mealId = e.target.dataset.id;
                    removeFromFavorites(mealId);
                    e.stopPropagation(); // Prevent triggering recipe details
                });

                favoritesList.appendChild(mealItem);
            });
    });
}


// Remove meals from favorites - Sasha Koroleva
function removeFromFavorites(mealId) {
    favorites = favorites.filter(id => id !== mealId);
    saveFavorites();
    renderFavorites();
}

// Save favorites to localStorage - Sasha Koroleva
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

//Load favorites from localStorage - Sasha Koroleva
function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
        renderFavorites();
    }
}

function paginate(items, itemsPerPage, page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
}

function renderPagination(totalItems, itemsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let paginationHtml = '';

    if (totalPages > 1) {
        paginationHtml += `<button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        paginationHtml += `<button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    }

    paginationContainer.innerHTML = paginationHtml;

    document.querySelectorAll('.pagination-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = parseInt(e.target.getAttribute('data-page'));
            if (!isNaN(page)) {
                currentPage = page;
                getMealList();
            }
        });
    });
}

// Fetch and populate categories
function fetchCategories() {
    let url = `https://www.themealdb.com/api/json/v1/1/categories.php`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let categories = data.categories;
        let options = '<option value="">Select Category</option>';
        categories.forEach(category => {
            options += `<option value="${category.strCategory.toLowerCase()}">${category.strCategory}</option>`;
        });
        categorySelect.innerHTML = options;
    });
}

// Perform initial fetch
fetchCategories();
getMealList();