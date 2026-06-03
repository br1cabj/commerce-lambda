import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'Jugador';
    const userRole = localStorage.getItem('userRole') || 'cliente'; 
    const loginBtn = document.getElementById('login-btn');

    if (token && loginBtn) {
        const adminButtonHTML = (userRole === 'administrador' || userRole === 'admin') 
            ? `<li><a class="dropdown-item text-warning fw-bold" href="/admin.html"> Panel de Administrador</a></li>` 
            : '';

        loginBtn.parentElement.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle fw-bold" href="#" style="color: var(--accent-color) !important;" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Hola, ${userName}
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li><a class="dropdown-item fw-bold" href="/profile.html">Mi Perfil / Mis Compras</a></li>
                    ${adminButtonHTML}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger fw-bold" href="#" id="logout-btn">Cerrar Sesión</a></li>
                </ul>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: '¿Cerrar sesión?', text: "Tendrás que volver a ingresar para comprar.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e63946', confirmButtonText: 'Sí, salir'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    window.location.reload(); 
                }
            });
        });
    }
};

checkAuth();

let globalProducts = [];

const loadProducts = async () => {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return; 

    const brandFilter = document.getElementById('filter-brand')?.value || '';
    const sizeFilter = document.getElementById('filter-size')?.value || '';

    let url = 'http://localhost:3001/api/products?isFeatured=true&';
    
    if (brandFilter) url += `brand=${brandFilter}&`;
    if (sizeFilter) url += `size=${sizeFilter}`;

    try {
        productsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border" style="color: var(--accent-color);" role="status"></div></div>';

        const response = await fetch(url);
        const data = await response.json();

        productsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h5 class="fw-bold text-dark mb-2">No hay lanzamientos destacados por ahora</h5>
                    <p class="text-muted">Prueba revisar nuestro catálogo completo en la pestaña Zapatillas.</p>
                </div>`;
            return;
        }

        globalProducts = data.results;

        data.results.forEach(product => {
            const finalPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;
            const priceHtml = product.discount > 0
                ? `<span class="text-muted text-decoration-line-through small me-2">$${product.price.toLocaleString('es-AR')}</span> <span class="text-success fw-bold fs-6">$${finalPrice.toLocaleString('es-AR')}</span>`
                : `<span class="fw-bold fs-6 text-dark">$${product.price.toLocaleString('es-AR')}</span>`;

            const sizesHtml = product.sizes && product.sizes.length > 0 
                ? product.sizes.map(s => `<span class="badge bg-light text-dark border me-1 mb-1" style="font-size: 0.7rem;">${s.size}</span>`).join('')
                : '<span class="badge bg-light text-muted border" style="font-size: 0.7rem;">Único</span>';

            const discountBadge = product.discount > 0 ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm" style="font-size: 0.7rem; z-index: 2;">-${product.discount}%</span>` : '';
            const mainImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;

            productsContainer.innerHTML += `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm border-0 product-card overflow-hidden">
                        ${discountBadge}
                        <a href="/product.html?id=${product._id}" class="bg-white text-center p-3 d-block text-decoration-none position-relative" style="height: 200px;">
                            <img src="${mainImg}" class="img-fluid h-100 w-100" alt="${product.model}" style="object-fit: contain; mix-blend-mode: multiply; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        </a>
                        <div class="card-body d-flex flex-column bg-light p-3">
                            <p class="text-muted small mb-1 text-uppercase fw-bold" style="letter-spacing: 1px; font-size: 0.7rem;">${product.brand}</p>
                            <a href="/product.html?id=${product._id}" class="text-decoration-none">
                                <h6 class="card-title fw-bold text-dark mb-2 hover-orange" style="font-size: 0.95rem;">${product.model}</h6>
                            </a>
                            <div class="mb-3">
                                <p class="text-muted mb-1" style="font-size: 0.7rem;">Talles:</p>
                                <div class="d-flex flex-wrap">${sizesHtml}</div>
                            </div>
                            <div class="mt-auto d-flex justify-content-between align-items-center mb-3">
                                <div>${priceHtml}</div>
                            </div>
                            <button class="btn hero-btn w-100 fw-bold shadow-sm py-2" style="font-size: 0.85rem;" onclick="addToCart('${product._id}')">
                                Agregar +
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        productsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Hubo un problema de conexión con el servidor.</p></div>';
    }
};

const btnApplyFilters = document.getElementById('btn-apply-filters');
if (btnApplyFilters) btnApplyFilters.addEventListener('click', () => loadProducts());

const btnClearFilters = document.getElementById('btn-clear-filters');
if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
        document.getElementById('filter-brand').value = '';
        document.getElementById('filter-size').value = '';
        loadProducts();
    });
}

const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.innerText = totalItems;
};

window.addToCart = (productId) => {
    const productToAdd = globalProducts.find(p => p._id === productId);
    if (!productToAdd) return Swal.fire('Error', 'No se pudo encontrar el producto.', 'error');
    if (productToAdd.stock < 1) return Swal.fire('Sin stock', 'Este producto está agotado.', 'warning');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex !== -1) {
        if (cart[existingProductIndex].quantity >= productToAdd.stock) {
            return Swal.fire('Stock máximo', 'No hay más unidades disponibles.', 'warning');
        }
        cart[existingProductIndex].quantity += 1;
    } else {
        const finalPrice = productToAdd.discount > 0 ? productToAdd.price - (productToAdd.price * (productToAdd.discount / 100)) : productToAdd.price;
        const mainImg = (productToAdd.images && productToAdd.images.length > 0) ? productToAdd.images[0] : productToAdd.image;
        
        cart.push({
            id: productToAdd._id,
            model: productToAdd.model,
            brand: productToAdd.brand,
            price: finalPrice,
            image: mainImg,
            quantity: 1,
            size: (productToAdd.sizes && productToAdd.sizes.length > 0) ? productToAdd.sizes[0].size : 'Único',
            maxStock: productToAdd.stock
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    Swal.fire({ title: 'Agregado al carrito', text: `Se agregó ${productToAdd.model} a tu pedido.`, icon: 'success', timer: 1500, showConfirmButton: false });
};


// CARGAR RESEÑAS EN EL INICIO

const loadReviews = async () => {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    try {
        const response = await fetch('http://localhost:3001/api/reviews');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50 small">Aún no hay reseñas. ¡Sé el primero en probar nuestras zapatillas!</div>';
            return;
        }

        container.innerHTML = data.map(review => `
            <div class="col-10 col-md-6 col-lg-4 flex-shrink-0">
                <div class="card bg-black h-100 rounded-4 p-4 shadow-sm border-0" style="border: 1px solid #333 !important;">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${review.image}" alt="${review.clientName}" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--accent-color);">
                        <div>
                            <h6 class="text-white fw-bold mb-0">${review.clientName}</h6>
                            <small style="color: var(--accent-color); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">${review.clientRole}</small>
                        </div>
                    </div>
                    <p class="text-white-50 small mb-0 fst-italic">"${review.message}"</p>
                    <div class="text-warning mt-3" style="font-size: 0.85rem;">
                        ★ ★ ★ ★ ★
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="col-12 text-center text-danger small">Error al cargar las reseñas.</div>';
    }
};

loadProducts();
updateCartCounter();
loadReviews(); // <-- Llamamos a las reseñas al abrir la página