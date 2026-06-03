import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

let globalProducts = [];

const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'Jugador';
    const userRole = localStorage.getItem('userRole') || 'cliente'; 
    const loginBtn = document.getElementById('login-btn');

    if (token && loginBtn) {
        const adminButtonHTML = (userRole === 'administrador' || userRole === 'admin') 
            ? `<li><a class="dropdown-item text-warning fw-bold" href="/admin.html"> Panel de Administrador</a></li>` : '';

        loginBtn.parentElement.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle fw-bold" href="#" style="color: var(--accent-color) !important;" role="button" data-bs-toggle="dropdown" aria-expanded="false">Hola, ${userName}</a>
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
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            window.location.reload(); 
        });
    }
};

const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.innerText = totalItems;
};

const getCurrentCategory = () => {
    const path = window.location.pathname;
    if (path.includes('indumentaria.html')) return 'Indumentaria';
    if (path.includes('accesorios.html')) return 'Accesorios';
    return 'Zapatillas'; 
};

const loadCatalogProducts = async () => {
    const container = document.getElementById('catalog-products-container');
    const counter = document.getElementById('products-counter');
    
    const selectedBrand = document.querySelector('input[name="brand"]:checked')?.value || '';
    const selectedSize = document.querySelector('input[name="size"]:checked')?.value || '';
    const currentCategory = getCurrentCategory();

    try {
        container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-warning" role="status"></div></div>';
        
        const response = await fetch('http://localhost:3001/api/products?limit=100');
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5 bg-white rounded-4 shadow-sm"><h5 class="fw-bold mb-2">Inventario vacío</h5></div>`;
            if (counter) counter.innerText = '0 Productos';
            return;
        }

        let filteredProducts = data.results.filter(product => {
            const prodCategory = product.category || 'Zapatillas';
            return prodCategory.trim().toLowerCase() === currentCategory.trim().toLowerCase();
        });

        if (selectedBrand) {
            filteredProducts = filteredProducts.filter(product => {
                if (!product.brand) return false;
                // SOLUCIÓN: Usamos .includes() para que detecte si "Nike Jordan" contiene "Nike" o "Jordan"
                return product.brand.toLowerCase().includes(selectedBrand.toLowerCase());
            });
        }

        if (selectedSize) {
            filteredProducts = filteredProducts.filter(product => {
                if (!product.sizes || product.sizes.length === 0) return false;
                return product.sizes.some(s => String(s.size).trim().toLowerCase() === String(selectedSize).trim().toLowerCase());
            });
        }

        container.innerHTML = '';

        if (filteredProducts.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5 bg-white rounded-4 shadow-sm"><h5 class="fw-bold mb-2">No se encontraron resultados</h5><p class="text-muted">Prueba eliminando los filtros aplicados.</p></div>`;
            if (counter) counter.innerText = '0 Productos';
            return;
        }

        globalProducts = filteredProducts;
        if (counter) counter.innerText = `${filteredProducts.length} Productos`;

        filteredProducts.forEach(product => {
            const finalPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;
            const priceHtml = product.discount > 0
                ? `<span class="text-muted text-decoration-line-through small me-2">$${product.price.toLocaleString('es-AR')}</span> <span class="text-success fw-bold fs-6">$${finalPrice.toLocaleString('es-AR')}</span>`
                : `<span class="fw-bold fs-6 text-dark">$${product.price.toLocaleString('es-AR')}</span>`;

            const sizesHtml = product.sizes && product.sizes.length > 0 
                ? product.sizes.map(s => `<span class="badge bg-light text-dark border me-1 mb-1" style="font-size: 0.7rem;">${s.size}</span>`).join('')
                : '<span class="badge bg-light text-muted border" style="font-size: 0.7rem;">Único</span>';

            const discountBadge = product.discount > 0 ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm" style="font-size: 0.7rem; z-index: 2;">-${product.discount}% OFF</span>` : '';
            
            const mainImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;

            container.innerHTML += `
                <div class="col-12 col-sm-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm border-0 product-card overflow-hidden">
                        ${discountBadge}
                        <a href="/product.html?id=${product._id}" class="bg-white text-center p-3 d-block text-decoration-none position-relative" style="height: 200px;">
                            <img src="${mainImg}" class="img-fluid h-100 w-100" alt="${product.model}" style="object-fit: contain; mix-blend-mode: multiply; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        </a>
                        <div class="card-body d-flex flex-column bg-light p-3 border-top">
                            <p class="text-muted small mb-1 text-uppercase fw-bold" style="letter-spacing: 1px; font-size: 0.7rem;">${product.brand}</p>
                            <a href="/product.html?id=${product._id}" class="text-decoration-none">
                                <h6 class="card-title fw-bold text-dark mb-2 hover-orange" style="font-size: 0.95rem;">${product.model}</h6>
                            </a>
                            <div class="mb-3">
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
        if(container) container.innerHTML = '<div class="col-12 text-center text-danger">Error de conexión con el servidor.</div>'; 
    }
};

document.querySelectorAll('.filter-brand, .filter-size').forEach(input => input.addEventListener('change', loadCatalogProducts));

const clearFiltersBtn = document.getElementById('clear-filters');
if(clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('.filter-brand, .filter-size').forEach(input => input.checked = false);
        loadCatalogProducts();
    });
}

window.addToCart = (productId) => {
    const productToAdd = globalProducts.find(p => p._id === productId);
    if (!productToAdd) return Swal.fire('Error', 'Producto no encontrado.', 'error');
    if (productToAdd.stock < 1) return Swal.fire('Sin stock', 'Producto agotado.', 'warning');

    const filterSize = document.querySelector('input[name="size"]:checked')?.value;
    if (!filterSize && productToAdd.sizes && productToAdd.sizes.length > 0) {
        return Swal.fire({ title: '¿Qué talle buscas?', text: 'Usa el filtro o entra al producto para elegir el talle.', icon: 'info', confirmButtonText: 'Entendido', confirmButtonColor: '#000000' });
    }

    const sizeToAdd = filterSize ? filterSize : (productToAdd.sizes && productToAdd.sizes.length > 0 ? productToAdd.sizes[0].size : 'Único');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingProductIndex = cart.findIndex(item => item.id === productId && String(item.size).trim().toLowerCase() === String(sizeToAdd).trim().toLowerCase());

    if (existingProductIndex !== -1) {
        const stockTalle = productToAdd.sizes.find(s => String(s.size).trim().toLowerCase() === String(sizeToAdd).trim().toLowerCase())?.stock || productToAdd.stock;
        if (cart[existingProductIndex].quantity >= stockTalle) {
            return Swal.fire('Stock máximo', 'No hay más unidades.', 'warning');
        }
        cart[existingProductIndex].quantity += 1;
    } else {
        const finalPrice = productToAdd.discount > 0 ? productToAdd.price - (productToAdd.price * (productToAdd.discount / 100)) : productToAdd.price;
        const mainImg = (productToAdd.images && productToAdd.images.length > 0) ? productToAdd.images[0] : productToAdd.image;
        cart.push({
            id: productToAdd._id, model: productToAdd.model, brand: productToAdd.brand, price: finalPrice, image: mainImg,
            quantity: 1, size: sizeToAdd, maxStock: productToAdd.stock
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    Swal.fire({ title: 'Agregado', text: `${productToAdd.model} añadido al carrito.`, icon: 'success', timer: 1500, showConfirmButton: false });
};

checkAuth();
updateCartCounter();
loadCatalogProducts();