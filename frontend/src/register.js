import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Capturamos todos los datos del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // 2. Validación de seguridad en el Frontend
    if (password !== confirmPassword) {
        return Swal.fire({
            title: 'Las contraseñas no coinciden',
            text: 'Por favor, asegúrate de escribir la misma contraseña en ambos campos.',
            icon: 'warning',
            confirmButtonColor: '#f28c28'
        });
    }

    try {
        // 3. Enviamos los datos a la ruta de Registro del Backend
        const response = await fetch('http://localhost:3001/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
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
        } else {
            // Error (por ejemplo, el correo ya existe)
            Swal.fire({
                title: 'No pudimos registrarte',
                text: data.message || 'Hubo un problema al crear la cuenta.',
                icon: 'error',
                confirmButtonColor: '#e63946'
            });
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        Swal.fire({
            title: 'Error de conexión',
            text: 'No pudimos conectar con el servidor.',
            icon: 'error'
        });
    }
});