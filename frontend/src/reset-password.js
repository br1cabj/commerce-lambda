import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

// Atrapamos el Token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Si alguien entra a esta página sin un token en la URL, lo echamos
if (!token) {
    Swal.fire({
        title: 'Acceso denegado',
        text: 'No tienes un enlace válido para cambiar la contraseña.',
        icon: 'error',
        confirmButtonColor: '#e63946'
    }).then(() => {
        window.location.href = '/login.html';
    });
}

// Lógica del formulario
const resetForm = document.getElementById('reset-form');

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Verificamos que sean iguales
    if (newPassword !== confirmPassword) {
        return Swal.fire({
            title: 'Las contraseñas no coinciden',
            text: 'Asegúrate de escribir exactamente la misma clave en ambos campos.',
            icon: 'warning',
            confirmButtonColor: '#f28c28'
        });
    }

    try {
        // Hacemos un PUT a la ruta de mi Backend, inyectando el token en la URL
        const response = await fetch(`http://localhost:3001/api/users/reset-password/${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: '¡Contraseña actualizada!',
                text: 'Ya puedes iniciar sesión con tu nueva clave.',
                icon: 'success',
                confirmButtonColor: '#f28c28'
            }).then(() => {
                window.location.href = '/login.html';
            });
        } else {
            Swal.fire({
                title: 'Enlace expirado o inválido',
                text: data.message || 'Por favor, solicita un nuevo enlace de recuperación.',
                icon: 'error',
                confirmButtonColor: '#e63946'
            });
        }
    } catch (error) {
        console.error("Error al restablecer:", error);
        Swal.fire({
            title: 'Error de conexión',
            text: 'No pudimos comunicar con el servidor.',
            icon: 'error'
        });
    }
});