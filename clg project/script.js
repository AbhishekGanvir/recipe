const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const mealsContainer = document.getElementById('meals');
    const resultHeading = document.getElementById('result-heading');
    const mealDetailsContainer = document.getElementById('meal-details');
    const errorContainer = document.getElementById('error-container');
    const backBtn = document.getElementById('back-btn');

    // Store last search results
    let lastMeals = [];
    let lastSearchTerm = '';

    // Event listeners
    searchBtn.addEventListener('click', searchMeals);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMeals();
        }
    });
    backBtn.addEventListener('click', showMealsList);

    // Search meals function
    async function searchMeals() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }

        showLoading();
        hideError();
        hideMealDetails();

        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            const data = await response.json();

            if (data.meals) {
                lastMeals = data.meals;
                lastSearchTerm = searchTerm;
                displayMeals(lastMeals, lastSearchTerm);
            } else {
                showError();
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
            showError();
        }
    }

    // Display meals function
    function displayMeals(meals, searchTerm) {
        resultHeading.innerHTML = `<h2>Search results for "${searchTerm}" (${meals.length} recipes found)</h2>`;
        
        mealsContainer.innerHTML = meals.map(meal => `
            <div class="meal" onclick="getMealDetails(${meal.idMeal})">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="meal-info">
                    <h3 class="meal-title">${meal.strMeal}</h3>
                    <span class="meal-category">${meal.strCategory}</span>
                </div>
            </div>
        `).join('');
    }

    // Get meal details function
    async function getMealDetails(mealId) {
        showLoading();
        
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await response.json();
            
            if (data.meals) {
                displayMealDetails(data.meals[0]);
            }
        } catch (error) {
            console.error('Error fetching meal details:', error);
        }
    }

    // Display meal details function
    function displayMealDetails(meal) {
        const ingredients = [];
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
            }
        }

        const mealDetailsHtml = `
            <div class="meal-details-content">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
                <h2 class="meal-details-title">${meal.strMeal}</h2>
                <div class="meal-details-category">
                    <span>${meal.strCategory} | ${meal.strArea}</span>
                </div>
                
                <div class="meal-details-instructions">
                    <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                    <p>${meal.strInstructions}</p>
                </div>
                
                <h3><i class="fas fa-shopping-basket"></i> Ingredients (${ingredients.length})</h3>
                <ul class="ingredients-list">
                    ${ingredients.map(ingredient => `
                        <li><i class="fas fa-check"></i> ${ingredient}</li>
                    `).join('')}
                </ul>
                
                ${meal.strYoutube ? `
                    <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                        <i class="fab fa-youtube"></i> Watch on YouTube
                    </a>
                ` : ''}
            </div>
        `;

        document.querySelector('.meal-details-content').innerHTML = mealDetailsHtml;
        hideMealsList();
        showMealDetails();
    }

    // Utility functions
    function showLoading() {
        mealsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    function showError() {
        errorContainer.classList.remove('hidden');
        mealsContainer.innerHTML = '';
        resultHeading.innerHTML = '';
    }

    function hideError() {
        errorContainer.classList.add('hidden');
    }

    function showMealDetails() {
        mealDetailsContainer.classList.remove('hidden');
    }

    function hideMealDetails() {
        mealDetailsContainer.classList.add('hidden');
    }

    function showMealsList() {
        document.querySelector('.results-section').style.display = 'block';
        hideMealDetails();

        // Re-render last meals
        if (lastMeals.length > 0) {
            displayMeals(lastMeals, lastSearchTerm);
        }
    }

    function hideMealsList() {
        document.querySelector('.results-section').style.display = 'none';
    }

    // Header background on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.top-header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Initialize with a default search
    window.addEventListener('load', () => {
        searchInput.value = 'chicken';
        searchMeals();
    });
