const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const applianceSelect = document.getElementById('appliance-select');
const dietarySelect = document.getElementById('dietary-select');
const paginationContainer = document.getElementById('pagination-container');

let currentPage = 1;
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
});
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim().toLowerCase();
    let selectedAppliance = applianceSelect.value.toLowerCase();
    let selectedDietary = dietarySelect.value.toLowerCase();
    let url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if (data.meals) {
            let filteredMeals = data.meals;

            if (searchInputTxt || selectedAppliance || selectedDietary) {
                filteredMeals = data.meals.filter(meal => {
                    const instructionsMatch = meal.strInstructions.includes(searchInputTxt);
                    const applianceMatch = selectedAppliance ? meal.strInstructions.toLowerCase().includes(selectedAppliance) : true;
                    const dietaryMatch = selectedDietary ? meal.strCategory.toLowerCase().includes(selectedDietary) : true;
                    return instructionsMatch && applianceMatch && dietaryMatch;
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
            currentPage = parseInt(e.target.getAttribute('data-page'));
            getMealList();
        });
    });
}

// Perform initial fetch
getMealList();