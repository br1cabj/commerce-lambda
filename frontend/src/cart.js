import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

// Función para actualizar el contador de la barra de navegación
const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = totalItems;
    }
};

// Función principal para renderizar los productos en la interfaz y calcular totales
const renderCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items-container');
    const subtotalElement = document.getElementById('summary-subtotal');
    const totalElement = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('btn-checkout');

    // Si el carrito está vacío
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <h5 class="fw-bold mb-3">Tu carrito está vacío</h5>
                <p class="text-muted mb-4">¡Agrega algunas zapatillas para empezar!</p>
                <a href="/index.html" class="btn btn-dark rounded-pill px-4">Ir a la tienda</a>
            </div>
        `;
        subtotalElement.innerText = '$0';
        totalElement.innerText = '$0';
        checkoutBtn.disabled = true;
        updateCartCounter();
        return;
    }

    // Renderizar productos si hay elementos
    let cartHtml = '';
    let totalAmount = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        cartHtml += `
            <div class="d-flex align-items-center border-bottom py-3">
                <img src="${item.image}" alt="${item.model}" class="img-fluid rounded-3 bg-light p-2 me-3" style="width: 100px; height: 100px; object-fit: contain;">
                
                <div class="flex-grow-1">
                    <p class="text-muted small mb-0 text-uppercase fw-bold" style="letter-spacing: 1px;">${item.brand}</p>
                    <h6 class="fw-bold mb-1">${item.model}</h6>
                    <p class="text-muted small mb-2">Talle: ${item.size}</p>
                    
                    <div class="d-flex align-items-center">
                        <div class="btn-group btn-group-sm me-3" role="group">
                            <button type="button" class="btn btn-outline-secondary" onclick="updateQuantity(${index}, -1)">-</button>
                            <button type="button" class="btn btn-outline-secondary disabled fw-bold px-3 text-dark">${item.quantity}</button>
                            <button type="button" class="btn btn-outline-secondary" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <span class="fw-bold text-dark">$${item.price.toLocaleString('es-AR')}</span>
                    </div>
                </div>
                
                <div class="ms-3 text-end">
                    <button class="btn btn-link text-danger p-0 mb-2 text-decoration-none small fw-bold" onclick="removeFromCart(${index})">
                        Eliminar
                    </button>
                    <h6 class="fw-bold text-success mt-2 mb-0">$${itemTotal.toLocaleString('es-AR')}</h6>
                </div>
            </div>
        `;
    });

    // Inyectamos el HTML generado
    cartContainer.innerHTML = cartHtml;
    
    // Actualizamos los montos totales en la columna derecha
    subtotalElement.innerText = `$${totalAmount.toLocaleString('es-AR')}`;
    totalElement.innerText = `$${totalAmount.toLocaleString('es-AR')}`;
    checkoutBtn.disabled = false;
    
    updateCartCounter();
};

// Funciones globales para manipular el carrito desde los botones inyectados en HTML
window.updateQuantity = (index, change) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        let newQuantity = cart[index].quantity + change;
        
        // Validación: Control de stock máximo desde la vista del carrito
        if (newQuantity > cart[index].maxStock) {
            Swal.fire({
                title: 'Stock máximo',
                text: `Solo tenemos ${cart[index].maxStock} unidades disponibles.`,
                icon: 'warning',
                confirmButtonColor: '#000000'
            });
            return; // Detenemos la ejecución para que no sume
        }
        
        // Evitamos que la cantidad sea menor a 1
        if (newQuantity < 1) {
            newQuantity = 1;
        }
        
        cart[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); // Redibujamos el carrito con los nuevos totales
    }
};

window.removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    Swal.fire({
        title: '¿Eliminar producto?',
        text: "Se quitará esta zapatilla de tu orden.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Usamos splice para borrar el elemento en la posición indicada
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart(); // Redibujamos
            
            Swal.fire({
                title: 'Eliminado',
                text: 'El producto fue removido.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
};

// Lógica del botón Finalizar Compra

const btnCheckout = document.getElementById('btn-checkout');
if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
        // Redirigimos al usuario a la página de pago
        window.location.href = '/checkout.html';
    });
}

// Ejecutamos la carga inicial apenas el usuario entra a la página
renderCart();