// Import de nodemailer.

import nodemailer from "nodemailer";

// Configuracion del correo electronico(Gmail).

export const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465, // Puerto seguro de Gmail.
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Lee mi correo.
        pass: process.env.EMAIL_PASS // Lee mi contraseña en el .env
    }
});

// Aca compruebo si la credencial es valida.

transporter.verify().then(() => {
    console.log("¡El cartero de Onda Basquete está listo para enviar correos!");
}).catch((error) => {
    console.log("Error al conectar con Gmail:", error.message);
});