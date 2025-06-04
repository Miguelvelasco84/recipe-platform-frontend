// js/main.js

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    initializeNavigation();
    initializePageSpecificFunctions();
    checkAPIConnection();
}

// Inicializar navegación responsiva
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar el menú al hacer click en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Cerrar el menú al hacer click fuera
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Marcar la página actual en la navegación
    setActiveNavLink();
}

// Marcar el enlace de navegación activo
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        if (linkHref) {
            const linkPage = linkHref.split('/').pop();
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html') ||
                (currentPage === 'index.html' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
        }
    });
}

// Inicializar funciones específicas según la página
function initializePageSpecificFunctions() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    switch (currentPage) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'all-recipes.html':
            initializeAllRecipesPage();
            break;
        case 'add-recipe.html':
            initializeAddRecipePage();
            break;
        case 'edit-recipe.html':
            initializeEditRecipePage();
            break;
        case 'recipe-detail.html':
            initializeRecipeDetailPage();
            break;
        case 'search.html':
            initializeSearchPage();
            break;
        default:
            console.log('Página no reconocida:', currentPage);
    }
}

// Inicializar página principal
function initializeHomePage() {
    loadRecentRecipes();
}

// Inicializar página de todas las recetas
function initializeAllRecipesPage() {
    loadAllRecipes();
    initializeRecipeFilters();
}

// Inicializar página de agregar receta
function initializeAddRecipePage() {
    const form = document.getElementById('add-recipe-form');
    if (form) {
        form.addEventListener('submit', (e) => handleRecipeSubmit(e, false));
    }
    
    initializeImagePreview();
    initializeFormValidation();
}

// Inicializar página de editar receta
function initializeEditRecipePage() {
    const recipeId = getURLParameter('id');
    if (recipeId) {
        loadRecipeForEdit(recipeId);
    } else {
        UIUtils.showError('ID de receta no válido');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }

    const form = document.getElementById('edit-recipe-form');
    if (form) {
        form.addEventListener('submit', (e) => handleRecipeSubmit(e, true));
    }

    initializeImagePreview();
    initializeFormValidation();
}

// Inicializar página de detalle de receta
function initializeRecipeDetailPage() {
    const recipeId = getURLParameter('id');
    if (recipeId) {
        loadRecipeDetail(recipeId);
    } else {
        UIUtils.showError('ID de receta no válido');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Inicializar página de búsqueda
function initializeSearchPage() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Búsqueda en tiempo real con debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.trim().length >= 3) {
                    const searchType = document.getElementById('search-type').value;
                    searchRecipes(this.value.trim(), searchType);
                } else if (this.value.trim().length === 0) {
                    document.getElementById('search-results-container').innerHTML = '';
                }
            }, 500);
        });
    }
}

// Cargar receta para editar
async function loadRecipeForEdit(recipeId) {
    try {
        const recipe = await recipeAPI.getRecipeById(recipeId);
        if (!recipe) {
            UIUtils.showError('Receta no encontrada');
            return;
        }

        // Llenar el formulario con los datos de la receta
        const form = document.getElementById('edit-recipe-form');
        if (form) {
            fillFormWithRecipeData(form, recipe);
        }
    } catch (error) {
        UIUtils.showError('Error al cargar la receta');
    }
}

// Llenar formulario con datos de receta
function fillFormWithRecipeData(form, recipe) {
    const fields = ['name', 'description', 'ingredients', 'instructions', 
                   'prep_time', 'cook_time', 'servings', 'difficulty', 'category', 'tags'];
    
    fields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && recipe[field] !== null && recipe[field] !== undefined) {
            input.value = recipe[field];
        }
    });

    // Mostrar imagen actual si existe
    if (recipe.image_url) {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = `<img src="${recipe.image_url}" alt="Imagen actual" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">`;
        }
    }
}

// Cargar detalle de receta
async function loadRecipeDetail(recipeId) {
    try {
        const recipe = await recipeAPI.getRecipeById(recipeId);
        if (!recipe) {
            UIUtils.showError('Receta no encontrada');
            return;
        }

        displayRecipeDetail(recipe);
    } catch (error) {
        UIUtils.showError('Error al cargar el detalle de la receta');
    }
}

// Mostrar detalle de receta
function displayRecipeDetail(recipe) {
    const container = document.getElementById('recipe-detail-container');
    if (!container) return;

    container.innerHTML = `
        <div class="recipe-detail">
            <div class="recipe-header">
                <h1>${recipe.name}</h1>
                <div class="recipe-actions">
                    <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-primary">Editar</a>
                    <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger">Eliminar</button>
                </div>
            </div>
            
            ${recipe.image_url ? `<img src="${recipe.image_url}" alt="${recipe.name}" class="recipe-detail-image">` : ''}
            
            <div class="recipe-meta-detail">
                <div class="meta-item">
                    <strong>⏱️ Preparación:</strong> ${recipe.prep_time || 'N/A'} min
                </div>
                <div class="meta-item">
                    <strong>🍳 Cocción:</strong> ${recipe.cook_time || 'N/A'} min
                </div>
                <div class="meta-item">
                    <strong>👥 Porciones:</strong> ${recipe.servings || 'N/A'}
                </div>
                <div class="meta-item">
                    <strong>📊 Dificultad:</strong> ${recipe.difficulty || 'N/A'}
                </div>
                <div class="meta-item">
                    <strong>🏷️ Categoría:</strong> ${recipe.category || 'N/A'}
                </div>
            </div>

            ${recipe.description ? `<div class="recipe-description"><h3>Descripción</h3><p>${recipe.description}</p></div>` : ''}

            <div class="recipe-ingredients">
                <h3>Ingredientes</h3>
                <div class="ingredients-list">
                    ${formatIngredients(recipe.ingredients)}
                </div>
            </div>

            <div class="recipe-instructions">
                <h3>Instrucciones</h3>
                <div class="instructions-list">
                    ${formatInstructions(recipe.instructions)}
                </div>
            </div>

            ${recipe.tags ? `<div class="recipe-tags"><h3>Etiquetas</h3><p>${recipe.tags}</p></div>` : ''}

            <div class="recipe-dates">
                <p><small>Creado: ${UIUtils.formatDate(recipe.created_at)}</small></p>
                ${recipe.updated_at !== recipe.created_at ? `<p><small>Actualizado: ${UIUtils.formatDate(recipe.updated_at)}</small></p>` : ''}
            </div>
        </div>
    `;
}

// Formatear ingredientes para mostrar
function formatIngredients(ingredients) {
    if (!ingredients) return '<p>No hay ingredientes especificados</p>';
    
    const lines = ingredients.split('\n').filter(line => line.trim());
    return '<ul>' + lines.map(line => `<li>${line.trim()}</li>`).join('') + '</ul>';
}

// Formatear instrucciones para mostrar
function formatInstructions(instructions) {
    if (!instructions) return '<p>No hay instrucciones especificadas</p>';
    
    const lines = instructions.split('\n').filter(line => line.trim());
    return '<ol>' + lines.map(line => `<li>${line.trim()}</li>`).join('') + '</ol>';
}

// Manejar envío de búsqueda
function handleSearchSubmit(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    
    if (searchInput && searchInput.value.trim()) {
        searchRecipes(searchInput.value.trim(), searchType.value);
    }
}

// Inicializar filtros de recetas
function initializeRecipeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            filterRecipes(filterType);
            
            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Filtrar recetas
function filterRecipes(filterType) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    recipeCards.forEach(card => {
        if (filterType === 'all') {
            card.style.display = 'block';
        } else {
            // Implementar lógica de filtrado según el tipo
            const category = card.dataset.category;
            if (category === filterType) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Inicializar vista previa de imagen
function initializeImagePreview() {
    const imageInput = document.getElementById('image');
    const preview = document.getElementById('image-preview');
    
    if (imageInput && preview) {
        imageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    UIUtils.showError('La imagen es demasiado grande. Máximo 5MB.');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Vista previa" 
                             style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = '';
            }
        });
    }
}

// Inicializar validación de formularios
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    });
}

// Validar campo individual
function validateField(event) {
    const field = event.target;
    const fieldName = field.name;
    const value = field.value.trim();

    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'name':
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'El nombre debe tener al menos 3 caracteres';
            }
            break;
        case 'ingredients':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Los ingredientes deben tener al menos 10 caracteres';
            }
            break;
        case 'instructions':
            if (value.length < 20) {
                isValid = false;
                errorMessage = 'Las instrucciones deben tener al menos 20 caracteres';
            }
            break;
        case 'prep_time':
        case 'cook_time':
        case 'servings':
            if (value && (isNaN(value) || parseInt(value) < 1)) {
                isValid = false;
                errorMessage = 'Debe ser un número mayor a 0';
            }
            break;
    }

    showFieldValidation(field, isValid, errorMessage);
}

// Mostrar validación de campo
function showFieldValidation(field, isValid, errorMessage) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.style.fontSize = 'var(--font-size-small)';
        errorDiv.style.marginTop = 'var(--spacing-xs)';
        field.parentNode.appendChild(errorDiv);
    } else {
        field.classList.remove('error');
    }
}

// Limpiar error de campo
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Verificar conexión con la API
async function checkAPIConnection() {
    try {
        // Intentar obtener recetas para verificar conexión
        await recipeAPI.getAllRecipes();
        console.log('Conexión con API establecida');
    } catch (error) {
        console.warn('No se pudo conectar con la API:', error);
        UIUtils.showWarning('No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.');
    }
}

// Función para manejar errores globales
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    UIUtils.showError('Ha ocurrido un error inesperado');
});

// Función para manejar promesas rechazadas
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada:', event.reason);
    UIUtils.showError('Error de conexión o procesamiento');
});