// Importaciones base
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import './style.css';

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
        // Le tocamos la puerta a tu Backend para hacer Login
        const response = await fetch('http://localhost:3001/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Le avisamos que le mandamos un JSON
            },
            body: JSON.stringify({ email, password }) // Convertimos los datos a texto
        });

        // Convertimos la respuesta del backend
        const data = await response.json();

        if (response.ok) {
            // Guardamos la "Pulsera VIP", el nombre y el ROL
            localStorage.setItem('token', data.token);
            
            if (data.user && data.user.name) {
                localStorage.setItem('userName', data.user.name);
                // Guardamos el rol (si no viene, asumimos que es cliente normal)
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
                // Lo enviamos de regreso a la tienda principal
                window.location.href = '/index.html';
            });
        } else {
            // ERROR: Contraseña incorrecta o usuario no encontrado
            Swal.fire({
                title: 'Error de ingreso',
                text: data.message || 'Credenciales incorrectas. Intenta nuevamente.',
                icon: 'error',
                confirmButtonColor: '#e63946'
            });
        }
    } catch (error) {
        console.error("Error en el login:", error);
        Swal.fire({
            title: 'Error de servidor',
            text: 'No pudimos conectar con el servidor. ¿El Backend está encendido?',
            icon: 'error'
        });
    }
});

// RECUPERAR CONTRASEÑA

forgotBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Usamos SweetAlert para pedir el correo en una ventanita elegante sin salir de la página
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

    // Si el usuario escribió un correo y le dio a Enviar...
    if (emailToRecover) {
        // Mostramos un "spinner" de carga porque el correo puede tardar un par de segundos
        Swal.fire({
            title: 'Enviando...',
            text: 'Espera un momento, el cartero de Onda Basquete está en camino.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Llamamos a la ruta de Nodemailer de tu Backend
            const response = await fetch('http://localhost:3001/api/users/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToRecover })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: '¡Correo enviado!',
                    text: 'Revisa tu bandeja de entrada o tu carpeta de Spam.',
                    icon: 'success',
                    confirmButtonColor: '#f28c28'
                });
            } else {
                Swal.fire({
                    title: 'No pudimos enviarlo',
                    text: data.message,
                    icon: 'warning',
                    confirmButtonColor: '#f28c28'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error de conexión',
                text: 'No pudimos conectar con el servidor.',
                icon: 'error'
            });
        }
    }
});