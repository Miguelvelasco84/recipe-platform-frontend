// js/api.js

// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'https://recipe-platform-backend-gguu.onrender.com', // Cambiar por tu URL de Render
    ENDPOINTS: {
        RECIPES: '/recipes',
        RECIPE_BY_ID: '/recipes/',
        SEARCH: '/recipes/search',
        UPLOAD_IMAGE: '/upload'
    }
};

// Clase para manejar las llamadas a la API
class RecipeAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // Método genérico para hacer peticiones HTTP
    async makeRequest(url, options = {}) {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.remove('hidden');

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    }

    // Obtener todas las recetas
    async getAllRecipes() {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPES}`);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            return [];
        }
    }

    // Obtener receta por ID
    async getRecipeById(id) {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPE_BY_ID}${id}`);
        } catch (error) {
            console.error('Error fetching recipe:', error);
            return null;
        }
    }

    // Buscar recetas
    async searchRecipes(query, searchType = 'name') {
        try {
            const params = new URLSearchParams({
                q: query,
                type: searchType
            });
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.SEARCH}?${params}`);
        } catch (error) {
            console.error('Error searching recipes:', error);
            return [];
        }
    }

    // Crear nueva receta
    async createRecipe(recipeData) {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPES}`, {
                method: 'POST',
                body: JSON.stringify(recipeData)
            });
        } catch (error) {
            console.error('Error creating recipe:', error);
            throw error;
        }
    }

    // Actualizar receta
    async updateRecipe(id, recipeData) {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPE_BY_ID}${id}`, {
                method: 'PUT',
                body: JSON.stringify(recipeData)
            });
        } catch (error) {
            console.error('Error updating recipe:', error);
            throw error;
        }
    }

    // Actualizar parcialmente una receta
    async patchRecipe(id, recipeData) {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPE_BY_ID}${id}`, {
                method: 'PATCH',
                body: JSON.stringify(recipeData)
            });
        } catch (error) {
            console.error('Error patching recipe:', error);
            throw error;
        }
    }

    // Eliminar receta
    async deleteRecipe(id) {
        try {
            return await this.makeRequest(`${this.baseURL}${API_CONFIG.ENDPOINTS.RECIPE_BY_ID}${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting recipe:', error);
            throw error;
        }
    }

    // Subir imagen
    async uploadImage(imageFile) {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    }

    // Obtener recetas recientes (últimas 6)
    async getRecentRecipes() {
        try {
            const recipes = await this.getAllRecipes();
            return recipes.slice(-6).reverse(); // Últimas 6 recetas
        } catch (error) {
            console.error('Error fetching recent recipes:', error);
            return [];
        }
    }
}

// Instancia global de la API
const recipeAPI = new RecipeAPI();

// Funciones de utilidad para el manejo de errores y mensajes
class UIUtils {
    static showMessage(message, type = 'info') {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message message-${type}`;
        messageContainer.textContent = message;

        // Buscar un contenedor existente o crear uno
        let container = document.getElementById('message-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'message-container';
            container.style.position = 'fixed';
            container.style.top = '80px';
            container.style.right = '20px';
            container.style.zIndex = '10000';
            document.body.appendChild(container);
        }

        container.appendChild(messageContainer);

        // Remover el mensaje después de 5 segundos
        setTimeout(() => {
            if (messageContainer.parentNode) {
                messageContainer.parentNode.removeChild(messageContainer);
            }
        }, 5000);
    }

    static showError(message) {
        this.showMessage(message, 'error');
    }

    static showSuccess(message) {
        this.showMessage(message, 'success');
    }

    static showWarning(message) {
        this.showMessage(message, 'warning');
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" 
                 alt="${recipe.name}" 
                 class="recipe-image"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
            <div class="recipe-card-content">
                <h3>${recipe.name}</h3>
                <p>${recipe.description || 'Sin descripción disponible'}</p>
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.prep_time || 'N/A'} min</span>
                    <span>👥 ${recipe.servings || 'N/A'} porciones</span>
                </div>
                <div class="recipe-actions">
                    <a href="pages/recipe-detail.html?id=${recipe.id}" class="btn btn-primary">Ver Receta</a>
                    <a href="pages/edit-recipe.html?id=${recipe.id}" class="btn btn-outline">Editar</a>
                    <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger">Eliminar</button>
                </div>
            </div>
        `;
        return card;
    }

    static validateRecipeForm(formData) {
        const errors = [];

        if (!formData.name || formData.name.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }

        if (!formData.ingredients || formData.ingredients.trim().length < 10) {
            errors.push('Los ingredientes deben tener al menos 10 caracteres');
        }

        if (!formData.instructions || formData.instructions.trim().length < 20) {
            errors.push('Las instrucciones deben tener al menos 20 caracteres');
        }

        if (formData.prep_time && (isNaN(formData.prep_time) || formData.prep_time < 1)) {
            errors.push('El tiempo de preparación debe ser un número mayor a 0');
        }

        if (formData.servings && (isNaN(formData.servings) || formData.servings < 1)) {
            errors.push('Las porciones deben ser un número mayor a 0');
        }

        return errors;
    }

    static showValidationErrors(errors) {
        if (errors.length > 0) {
            const errorMessage = 'Errores de validación:\n' + errors.join('\n');
            this.showError(errorMessage);
            return false;
        }
        return true;
    }
}

// Funciones globales para el manejo de recetas
async function deleteRecipe(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        return;
    }

    try {
        await recipeAPI.deleteRecipe(id);
        UIUtils.showSuccess('Receta eliminada exitosamente');
        
        // Recargar la página actual o actualizar la vista
        if (window.location.pathname.includes('all-recipes')) {
            loadAllRecipes();
        } else if (window.location.pathname.includes('index')) {
            loadRecentRecipes();
        }
    } catch (error) {
        UIUtils.showError('Error al eliminar la receta');
    }
}

// Función para cargar recetas recientes en la página principal
async function loadRecentRecipes() {
    try {
        const recipes = await recipeAPI.getRecentRecipes();
        const container = document.getElementById('recent-recipes-container');
        
        if (!container) return;

        if (recipes.length === 0) {
            container.innerHTML = '<p class="text-center">No hay recetas disponibles. ¡Agrega la primera!</p>';
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = UIUtils.createRecipeCard(recipe);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recent recipes:', error);
        const container = document.getElementById('recent-recipes-container');
        if (container) {
            container.innerHTML = '<p class="text-center">Error al cargar las recetas</p>';
        }
    }
}

// Función para cargar todas las recetas
async function loadAllRecipes() {
    try {
        const recipes = await recipeAPI.getAllRecipes();
        const container = document.getElementById('all-recipes-container');
        
        if (!container) return;

        if (recipes.length === 0) {
            container.innerHTML = '<p class="text-center">No hay recetas disponibles. ¡Agrega la primera!</p>';
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = UIUtils.createRecipeCard(recipe);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading all recipes:', error);
        const container = document.getElementById('all-recipes-container');
        if (container) {
            container.innerHTML = '<p class="text-center">Error al cargar las recetas</p>';
        }
    }
}

// Función para manejar la búsqueda de recetas
async function searchRecipes(query, searchType = 'name') {
    try {
        const recipes = await recipeAPI.searchRecipes(query, searchType);
        const container = document.getElementById('search-results-container');
        
        if (!container) return;

        if (recipes.length === 0) {
            container.innerHTML = '<p class="text-center">No se encontraron recetas que coincidan con tu búsqueda.</p>';
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = UIUtils.createRecipeCard(recipe);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error searching recipes:', error);
        UIUtils.showError('Error al buscar recetas');
    }
}

// Función para obtener parámetros de la URL
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Función para manejar el envío de formularios de recetas
async function handleRecipeSubmit(event, isEdit = false) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const recipeData = {
        name: formData.get('name'),
        description: formData.get('description'),
        ingredients: formData.get('ingredients'),
        instructions: formData.get('instructions'),
        prep_time: parseInt(formData.get('prep_time')) || null,
        cook_time: parseInt(formData.get('cook_time')) || null,
        servings: parseInt(formData.get('servings')) || null,
        difficulty: formData.get('difficulty'),
        category: formData.get('category'),
        tags: formData.get('tags')
    };

    // Validar datos
    const errors = UIUtils.validateRecipeForm(recipeData);
    if (!UIUtils.showValidationErrors(errors)) {
        return;
    }

    try {
        let result;
        
        if (isEdit) {
            const recipeId = getURLParameter('id');
            result = await recipeAPI.updateRecipe(recipeId, recipeData);
            UIUtils.showSuccess('Receta actualizada exitosamente');
        } else {
            result = await recipeAPI.createRecipe(recipeData);
            UIUtils.showSuccess('Receta creada exitosamente');
            form.reset();
        }

        // Manejar imagen si se seleccionó una
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            try {
                const imageResult = await recipeAPI.uploadImage(imageFile);
                // Actualizar la receta con la URL de la imagen
                await recipeAPI.patchRecipe(result.id, { image_url: imageResult.image_url });
            } catch (imageError) {
                UIUtils.showWarning('Receta guardada, pero hubo un error al subir la imagen');
            }
        }

    } catch (error) {
        UIUtils.showError(isEdit ? 'Error al actualizar la receta' : 'Error al crear la receta');
    }
}
