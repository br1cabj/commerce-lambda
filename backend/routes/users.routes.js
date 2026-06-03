// Imports

import { Router } from "express";

import { registerUser, loginUser, updatePassword, forgotPassword, resetPassword, getUserProfile } from "../controllers/users.controllers.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// Creo la ruta POST para registrar. Cuando alguien envie datos a /register, se llamara a nuestro mozo.

router.post("/register", registerUser);

router.post("/forgot-password", forgotPassword); // Ruta de la logica para cambiar la contraseña por Gmail.

// Ruta para iniciar sesion.

router.post("/login", loginUser);

// Aca uso PUT porque se va a actualizar un dato existente

router.put("/update-password", verifyToken, updatePassword);

// Ruta para restablecer la contraseña mediante el token de email

router.put("/reset-password/:token", resetPassword);

// Ruta para obtener los datos del perfil

router.get("/profile", verifyToken, getUserProfile);

export default router;