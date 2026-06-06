// Imports.

import { transporter } from "../config/mailer.js";

import User from "../models/User.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";


// Funcion exportable para la encriptacion de las contraseñas y de la creacion de los usuarios.

export const registerUser = async (req, res) => {

    try {
        // Agarro los datos que envia el cliente desde el formulario.
        const { name, email, password, phone } = req.body;

        // Verifico que si ya existe un usuario con ese mismo correo electronico.
        const userExists = await User.findOne({ email });
        if(userExists){
            // Si existe, freno todo con un return y mando el error 400 (Bad request).
            return res.status(400).json({ message: "¡Atención! Este correo ya está registrado."});
        }

        // Aca es donde arranca el criptografo
        const salt = await bcrypt.genSalt(10); // Aca creo un salt que es un codigo aleatorio para mezclar con la contraseña.
        // Aca mezclo la contraseña real con la variable salt para crear un texto incomprensible.
        const hashedPassword = await bcrypt.hash(password, salt);

        // Aca creo el nuevo usuario usando el molde, pero va con la contraseña encriptada.
        const newUser = new User ({
            name,
            email,
            password: hashedPassword, // Nunca guardo la original,
            phone
        });

        // Guardo en MongoDB
        const userSaved = await newUser.save();

        // Respondo al cliente con éxito
        res.status(201).json({
            message: "¡Usuario registrado con exito en Onda Basquete!",
            user: {
            id: userSaved._id,
            name: userSaved.name,
            email: userSaved.email,
            role: userSaved.role
            }
        });

    }catch (error){
        console.log("Error al registrar usuario:", error.message);
        res.status(500).json({ message: "Error interno del servidor al registrar"});
    }
};

// Funcion exportable para que los usuarios inicien sesión.

export const loginUser = async (req, res) => {
    try {
        // Agarro el email y la constraseña del cliente que envia desde el formulario.
        const { email, password } = req.body;

        // Busco en la base de datos a ver si existe alguien con ese email.
        const userFound = await User.findOne({ email });

        // Si no se encuentra a nadie, lo rebotamos inmediatamente
        if(!userFound){
            return res.status(404).json({ message: "Usuario no encontrado. Verifica tu email."});
        }

        // Parte del criptografo. Uso la funcion compare() de bcrypt. Compara la contraseña limpia con el hash raro que tengo guardado en la bóveda.
        const isPasswordCorrect = await bcrypt.compare(password, userFound.password);

        // Si el criptografo dice que no coinciden, lo reboto.
        if(!isPasswordCorrect){
            return res.status(401).json({ message: "Contraseña incorrecta."});
        }

        // Aca jwt.sign() crea el token, pero necesita 3 datos/los datos que queremos guardar en el token/mi firma secreta/el tiempo de vencimiento(1d significa 1 dia).
        const token = jwt.sign(
            { id: userFound._id, role: userFound.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d"}
        )

        // Si el email es correcto y la contraseña es correcta, lo dejamos pasar. Por ahora solo devuelvo un msj de bienvenida.
        res.status(200).json({
            message: "¡Bienvenido a Onda Basquete!",
            token: token, // Esto hace que cada vez que el usuario navegue por la pagina, no se le pida la contraseña siempre,
            user: {
                id: userFound._id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role
            }
        });
    }catch (error){

        console.log("Error en el login:", error.message);
        res.status(500).json({ message: "Error interno del servidor al iniciar sesión."})
    }
};

// Funcion para cambiar la contraseña estando logueado.

export const updatePassword = async (req, res) => {
    try {
        // Agarro la contraseña vieja y la nueva que vienen del formulario.
        const { oldPassword, newPassword } = req.body;

        // Aca veo quien está pidiendo el cambio, esta ruta va a usar verifyToken, tenemos el ID del usuario en req.user.id
        const userFound = await User.findById(req.user.id);
        if(!userFound){
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Aca comparo la contraseña vieja con la que tengo en la base de datos.
        const isMatch = await bcrypt.compare(oldPassword, userFound.password);
        if(!isMatch){
            return res.status(400).json({ message: "La contraseña actual es incorrecta." });
        }

        // Si es correcta, acá hago la encriptacion de la nueva contraseña antes de guardarla.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Guardo la nueva contraseña en la base de datos.
        userFound.password = hashedPassword;
        await userFound.save();

        res.status(200).json({ message: "¡Contraseña actualizada con éxito en Onda Basquete!" });

    }catch (error) {
        console.log("Error al cambiar contraseña:", error.message);
        res.status(500).json({ message: "Error interno del servidor al actualizar contraseña."});
    }
};

// Función de olvidé mi contraseña para recuperarla con Gmail.

export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        // Busco si el correo existe.
        const userFound = await User.findOne({ email });
        if(!userFound){
            return res.status(404).json({ message: "No existe ninguna cuenta con ese correo." });
        }

        // Token especial temporal (15 min).
        const resetToken = jwt.sign(
            { id: userFound._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m"}
        );

        // Enlace que el usuario va a clickear.
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password.html?token=${resetToken}`;

        // Lo que se le enviara al usuario.

        await transporter.sendMail({
            from: `"Onda Basquete" <${process.env.EMAIL_USER}>`, // Remitente
            to: userFound.email, // Destinatario (el cliente)
            subject: "Recuperación de Contraseña - Onda Basquete", // Asunto
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                    <h2>¡Hola ${userFound.name}!</h2>
                    <p>Recibimos una solicitud para restablecer tu contraseña en Onda Basquete.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva (este enlace caducará en 15 minutos):</p>
                    <a href="${resetLink}" style="background-color: #fca311; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Restablecer mi contraseña</a>
                    <p style="font-size: 12px; color: #999;">Si no solicitaste esto, ignora este correo. Tu cuenta sigue segura.</p>
                </div>
            `
        });

        res.status(200).json({ message: "¡Revisa tu bandeja de entrada! Te enviamos las instrucciones." });

    }catch (error){
        console.log("Error en forgotPassword:", error.message);
        res.status(500).json({ message: "Error al enviar el correo de recuperación." });
    }
};

//  Función para resetear la contraseña una vez llegado el email.

export const resetPassword = async (req, res) => {
    try {
        // Recibo el token por la URL(params) y la nueva contraseña del body.
        const { token } = req.params;
        const { newPassword } = req.body;

        // Verifico que el token sea valido y no haya expirado. Si expiro dará error y salta al bloque catch.
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Busco al usuario por ID que se guardo del token original.
        const userFound = await User.findById(verified.id);
        if(!userFound){
            return res.status(404).json({ message : "Usuario no encontrado." });
        }

        // Encripto la nueva contraseña.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        userFound.password = hashedPassword;
        await userFound.save();

        res.status(200).json({ message: "¡Tu contraseña a sido restablecida con éxito!" });
    }catch (error){
        console.log("Error en resetPassword:", error.message);
        // Si acá falla jwt.verify(es porque pasaron los 15min o cambiaron las letras).
        res.status(400).json({ message: " El enlace es inválido o ha expirado. Por favor, solicita uno nuevo" });
    }
};

// Función para obtener los datos completos del perfil del usuario logueado
export const getUserProfile = async (req, res) => {
    try {
        // req.user.id viene del middleware verifyToken. El .select("-password") oculta la contraseña por seguridad.
        const userFound = await User.findById(req.user.id).select("-password");
        
        if(!userFound){
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json(userFound);
    } catch (error) {
        console.log("Error al obtener perfil:", error.message);
        res.status(500).json({ message: "Error interno al cargar el perfil." });
    }
};