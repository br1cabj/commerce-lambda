import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';
import { api } from './api.js';

// 1. Capturamos los elementos del HTML
const loginForm = document.getElementById('login-form');
const forgotBtn = document.getElementById('forgot-btn');

// INICIAR SESIÓN

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue

    // Capturamos lo que el usuario escribió en los inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Usamos nuestra utilidad de API centralizada
        const data = await api.post('/users/login', { email, password });

        // Guardamos la "Pulsera VIP", el nombre y el ROL
        localStorage.setItem('token', data.token);
        
        if (data.user && data.user.name) {
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userRole', data.user.role || 'cliente'); 
        } else {
            localStorage.setItem('userName', 'Jugador');
            localStorage.setItem('userRole', 'cliente');
        }

        // Alerta elegante de bienvenida
        Swal.fire({
            title: '¡Bienvenido de vuelta!',
            text: 'Ingreso exitoso a Onda Basquete.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = '/index.html';
        });

    } catch (error) {
        // ERROR: Contraseña incorrecta, usuario no encontrado o error de validación
        Swal.fire({
            title: 'Error de ingreso',
            text: error.message || 'Credenciales incorrectas. Intenta nuevamente.',
            icon: 'error',
            confirmButtonColor: '#e63946'
        });
    }
});

// RECUPERAR CONTRASEÑA

forgotBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const { value: emailToRecover } = await Swal.fire({
        title: 'Recuperar contraseña',
        text: 'Ingresa tu correo y te enviaremos un link temporal.',
        input: 'email',
        inputPlaceholder: 'nombre@ejemplo.com',
        showCancelButton: true,
        confirmButtonColor: '#f28c28',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Enviar correo',
        cancelButtonText: 'Cancelar'
    });

    if (emailToRecover) {
        Swal.fire({
            title: 'Enviando...',
            text: 'Espera un momento, el cartero de Onda Basquete está en camino.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await api.post('/users/forgot-password', { email: emailToRecover });

            Swal.fire({
                title: '¡Correo enviado!',
                text: 'Revisa tu bandeja de entrada o tu carpeta de Spam.',
                icon: 'success',
                confirmButtonColor: '#f28c28'
            });
        } catch (error) {
            Swal.fire({
                title: 'No pudimos enviarlo',
                text: error.message || 'Error al conectar con el servidor.',
                icon: 'warning',
                confirmButtonColor: '#f28c28'
            });
        }
    }
});