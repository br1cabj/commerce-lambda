import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElement = document.querySelector('.badge.text-bg-warning');
    if (cartCountElement) cartCountElement.innerText = totalItems;
};

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) window.location.href = '/index.html';

const loadProductDetails = async () => {
    try {
        const response = await fetch(`http://localhost:3001/api/products/${productId}`);
        const product = await response.json();

        if (!response.ok) throw new Error('Producto no encontrado');

        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('dynamic-content').classList.remove('d-none');

        document.getElementById('p-model').innerText = product.model;
        document.getElementById('p-brand').innerText = product.brand;
        document.getElementById('p-brand-crumb').innerText = product.brand;
        
        // BREADCRUMB DINÁMICO: Cambia dependiendo si es Zapatilla, Indumentaria o Accesorio
        const categoryCrumb = document.getElementById('p-category-crumb');
        const prodCategory = product.category || 'Zapatillas';
        categoryCrumb.innerText = prodCategory;
        if (prodCategory === 'Indumentaria') {
            categoryCrumb.href = '/indumentaria.html';
        } else if (prodCategory === 'Accesorios') {
            categoryCrumb.href = '/accesorios.html';
        } else {
            categoryCrumb.href = '/zapatillas.html';
        }
        
        // GALERÍA DE IMÁGENES
        const imagesToRender = (product.images && product.images.length > 0) ? product.images : [product.image];
        const mainImage = document.getElementById('p-main-image');
        mainImage.src = imagesToRender[0];

        const thumbnailGallery = document.getElementById('thumbnail-gallery');
        thumbnailGallery.classList.add('hide-scrollbar');
        
        thumbnailGallery.innerHTML = imagesToRender.map(imgUrl => `
            <div class="border rounded-3 p-1 bg-white shadow-sm hover-scale flex-shrink-0" style="width: 70px; height: 70px; cursor: pointer;" onclick="document.getElementById('p-main-image').src='${imgUrl}'">
                <img src="${imgUrl}" class="img-fluid h-100 w-100" style="object-fit: cover; border-radius: 6px;">
            </div>
        `).join('');

        // PRECIOS
        const priceContainer = document.getElementById('p-price-container');
        let finalPrice = product.price;

        if (product.discount > 0) {
            finalPrice = product.price - (product.price * (product.discount / 100));
            document.getElementById('p-discount-badge').innerHTML = `<span class="badge bg-danger position-absolute top-0 end-0 m-4 fs-6 px-3 py-2">-${product.discount}% OFF</span>`;
            priceContainer.innerHTML = `
                <h3 class="fw-bold text-success mb-0">$${finalPrice.toLocaleString('es-AR')}</h3>
                <p class="text-muted text-decoration-line-through mb-0">$${product.price.toLocaleString('es-AR')}</p>
            `;
        } else {
            priceContainer.innerHTML = `<h3 class="fw-bold mb-0">$${product.price.toLocaleString('es-AR')}</h3>`;
        }

        // TALLES (Soporta números y letras automáticamente)
        const sizesContainer = document.getElementById('p-sizes');
        if (product.sizes && product.sizes.length > 0) {
            sizesContainer.innerHTML = product.sizes.map(s => {
                const isOutOfStock = s.stock < 1;
                return `
                <div class="col-4 col-sm-3">
                    <input type="radio" class="btn-check size-selector" name="size" id="size-${s.size}" autocomplete="off" value="${s.size}" data-stock="${s.stock}" ${isOutOfStock ? 'disabled' : ''}>
                    <label class="btn ${isOutOfStock ? 'btn-outline-secondary opacity-50 text-decoration-line-through' : 'btn-outline-dark'} w-100 rounded-3 py-2 fw-bold d-flex flex-column align-items-center" for="size-${s.size}">
                        <span>${s.size}</span>
                        ${isOutOfStock ? '<small style="font-size:0.65rem; margin-top:-3px;">Agotado</small>' : ''}
                    </label>
                </div>
            `}).join('');
        } else {
            sizesContainer.innerHTML = '<p class="text-muted">No hay talles especificados.</p>';
        }

        // LÓGICA DEL CARRITO A PRUEBA DE BALAS
        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            const selectedSizeInput = document.querySelector('input[name="size"]:checked');
            
            if (!selectedSizeInput) return Swal.fire({ title: 'Falta el talle', text: 'Selecciona un talle.', icon: 'warning', confirmButtonColor: '#000000' });
            
            const talleElegido = String(selectedSizeInput.value).trim();
            const stockMaximoDelTalle = Number(selectedSizeInput.dataset.stock); 
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Comparamos el talle como String y en minúsculas para evitar errores
            const existingProductIndex = cart.findIndex(item => item.id === product._id && String(item.size).trim().toLowerCase() === talleElegido.toLowerCase());

            if (existingProductIndex !== -1) {
                if (cart[existingProductIndex].quantity >= stockMaximoDelTalle) {
                    return Swal.fire({ title: 'Límite alcanzado', text: `Solo quedan ${stockMaximoDelTalle} unidades del talle ${talleElegido}.`, icon: 'warning', confirmButtonColor: '#000000' });
                }
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({
                    id: product._id, model: product.model, brand: product.brand, price: finalPrice, image: imagesToRender[0],
                    quantity: 1, size: talleElegido, maxStock: stockMaximoDelTalle
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            Swal.fire({ title: 'Agregado al carrito', text: `Se agregó ${product.model} (Talle: ${talleElegido}).`, icon: 'success', timer: 1500, showConfirmButton: false });
        });

    } catch (error) {
        Swal.fire('Error', 'No pudimos cargar el producto', 'error').then(() => window.location.href = '/index.html');
    }
};

updateCartCounter();
loadProductDetails();