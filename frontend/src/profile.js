import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login.html';
}

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '/index.html';
});

const loadProfileInfo = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/users/profile', {
            headers: { 'auth-token': token }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('profile-name').innerText = data.name;
            document.getElementById('profile-email').innerText = data.email;
            document.getElementById('profile-initial').innerText = data.name.charAt(0).toUpperCase();
            document.getElementById('profile-points').innerText = data.points || 0;
        } else {
            throw new Error('No se pudo cargar el perfil');
        }
    } catch (error) {
        console.error(error);
    }
};

const loadMyOrders = async () => {
    const container = document.getElementById('orders-container');
    try {
        const response = await fetch('http://localhost:3001/api/orders/my-orders', {
            headers: { 'auth-token': token }
        });
        const orders = await response.json();

        if (response.ok) {
            if (orders.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-4">Aún no has realizado ninguna compra.</p>';
                return;
            }

            container.innerHTML = orders.map(order => {
                const date = new Date(order.createdAt).toLocaleDateString('es-AR');
                let statusBadge = 'bg-secondary';
                if (order.status === 'Pendiente') statusBadge = 'bg-warning text-dark';
                if (order.status === 'En Preparación') statusBadge = 'bg-info text-dark';
                if (order.status === 'Enviado') statusBadge = 'bg-primary';
                if (order.status === 'Entregado') statusBadge = 'bg-success';
                if (order.status === 'Cancelado') statusBadge = 'bg-danger';

                return `
                    <div class="border rounded-3 p-3 mb-3 bg-light shadow-sm">
                        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                            <span class="fw-bold text-dark">Pedido del ${date}</span>
                            <span class="badge ${statusBadge}">${order.status}</span>
                        </div>
                        <div class="mb-2 small">
                            ${order.products.map(p => `<div>• Producto ID: ${p.product} | Cant: ${p.quantity} | <span class="fw-bold">$${p.price.toLocaleString('es-AR')}</span></div>`).join('')}
                        </div>
                        <div class="d-flex justify-content-between align-items-end mt-3">
                            <div class="small">
                                <strong>Envío a:</strong> ${order.shippingAddress.street} ${order.shippingAddress.number}, ${order.shippingAddress.city}<br>
                                <strong>Seguimiento:</strong> <span class="text-primary fw-bold">${order.trackingCode || 'Aún no asignado'}</span>
                            </div>
                            <h6 class="fw-bold text-success mb-0">Total: $${order.totalAmount.toLocaleString('es-AR')}</h6>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        container.innerHTML = '<p class="text-danger">Hubo un error al cargar tus compras.</p>';
    }
};

loadProfileInfo();
loadMyOrders();