const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const applianceSelect = document.getElementById('appliance-select');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
const itemsPerPage = 12; // Set to 12 to display recipes in batches of 12
let filteredMeals = [];

searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});
prevBtn.addEventListener('click', () => changePage(-1));
nextBtn.addEventListener('click', () => changePage(1));

function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim().toLowerCase();
    let selectedAppliance = applianceSelect.value.toLowerCase();
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`)
    .then(response => response.json())
    .then(data => {
        if (data.meals) {
            filteredMeals = data.meals.filter(meal => {
                const instructionsMatch = meal.strInstructions.toLowerCase().includes(searchInputTxt);
                const applianceMatch = selectedAppliance ? meal.strInstructions.toLowerCase().includes(selectedAppliance) : true;
                return instructionsMatch && applianceMatch;
            });
            currentPage = 1;
            displayMeals();
        } else {
            mealList.innerHTML = "Sorry, we didn't find any meals!";
            mealList.classList.add('notFound');
        }
    });
}

function displayMeals() {
    let html = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedMeals = filteredMeals.slice(start, end);

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
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredMeals.length / itemsPerPage)}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === Math.ceil(filteredMeals.length / itemsPerPage);
}

function changePage(direction) {
    currentPage += direction;
    displayMeals();
}

function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

function mealRecipeModal(meal) {
    console.log(meal);
    meal = meal[0];
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
}