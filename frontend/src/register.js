import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';
import { api } from './api.js';

const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturamos todos los datos del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validación de seguridad en el Frontend
    if (password !== confirmPassword) {
        return Swal.fire({
            title: 'Las contraseñas no coinciden',
            text: 'Por favor, asegúrate de escribir la misma contraseña en ambos campos.',
            icon: 'warning',
            confirmButtonColor: '#f28c28'
        });
    }

    try {
        // Enviamos los datos usando nuestra utilidad centralizada
        await api.post('/users/register', { name, email, password });

        // ¡Éxito! Cuenta creada.
        Swal.fire({
            title: '¡Bienvenido al equipo!',
            text: 'Tu cuenta ha sido creada exitosamente.',
            icon: 'success',
            confirmButtonColor: '#f28c28'
        }).then(() => {
            // Lo enviamos a la pantalla de Login para que ingrese con su nueva cuenta
            window.location.href = '/login.html';
        });

    } catch (error) {
        // Error (por ejemplo, el correo ya existe o error de validación de Joi)
        Swal.fire({
            title: 'No pudimos registrarte',
            text: error.message || 'Hubo un problema al crear la cuenta.',
            icon: 'error',
            confirmButtonColor: '#e63946'
        });
    }
});