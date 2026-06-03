// Imports

import Coupon from "../models/Coupon.js";

import User from "../models/User.js";

import { transporter } from "../config/mailer.js";

// Funcion para que el dueño pueda crear nuevos cupones.
export const createCoupon = async (req, res) => {
    try{
        // Agarro los datos que voy a enviar.
        const { code, discountPercentage, pointsRequired } = req.body;

        // Verifico si ya existe un cupon con esa palabra para no duplicarlo.(uso toUpperCase para que sea todo en mayusculas).
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if(existingCoupon){
            return res.status(400).json({ message: "¡Ese código de cupón ya existe!" });
        }

        // Creo el nuevo cupon.
        const newCoupon = new Coupon({
            code,
            discountPercentage,
            pointsRequired
        });

        // Lo guardo
        const savedCoupon = await newCoupon.save();

        res.status(201).json({ message: "¡Cupón creado con éxito para Onda Basquete Club",
            coupon: savedCoupon
        });
    }catch (error){
        console.log("Error al crear cupón", error.message);
        res.status(500).json({ message: "Error interno al crear cupón." });
    }
};

// Funcion para que los dueños activen o desactiven los cupones.

export const toggleCoupon = async (req, res) => {
    try {
        // Agarro el ID del cupon con la URL
        const { id } = req.params;

        // Busco el cupon la base de datos.
        const couponFound = await Coupon.findById(id);
        if(!couponFound){
            return res.status(404).json({ message: "Cupón no encontrado." });
        }

        // Aca lo activo o desactivo
        couponFound.isActive = !couponFound.isActive;

        // Guardo el cambio
        await couponFound.save();

        res.status(200).json({ message: `El cupón ahora está ${couponFound.isActive ? 'ACTIVADO' : 'DESACTIVADO'}`,
        coupon: couponFound
    });
    } catch (error) {
        console.log("Error al actualizar cupón:", error.message);
        res.status(500).json({ message: "Error interno al actualizar cupón." });
    }
};

// Funcion para que el dueño envie un correo electronico masivo con codigo de descuento.

export const sendPromoEmail = async (req, res) => {
    try {
        // mensaje del deuño
        const { title, message, discountCode } = req.body;

        // Busco los usuarios registrados.
        const allUsers = await User.find();

        // Se le envia un correo a cada uno.
        for (let user of allUsers) {
            await transporter.sendMail({
                from: `"Onda Basquete" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `${title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                        <h2>¡Hola ${user.name}!</h2>
                        <p>${message}</p>
                        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 16px;">Tu código de regalo es:</p>
                            <h1 style="color: #fca311; letter-spacing: 2px; margin: 10px 0;">${discountCode}</h1>
                        </div>
                        <p>¡Te esperamos en la tienda!</p>
                    </div>
                `
            });
        };

        res.status(200).json({ message: "¡Correos promocionales enviados a todos los clientes con éxito!" });
    } catch (error) {
        console.log("Error al enviar promociones:", error.message);
        res.status(500).json({ message: "Error interno del servidor al enviar los correos."});
    }
};

// Función para que el cliente valide un cupón en el checkout

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        
        // Buscamos el cupón (forzando mayúsculas por si el usuario lo escribe en minúsculas)
        const couponFound = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!couponFound) {
            return res.status(404).json({ message: "El cupón no existe o está mal escrito." });
        }

        if (!couponFound.isActive) {
            return res.status(400).json({ message: "Este cupón ya ha expirado o está desactivado." });
        }

        // Si todo está bien, le enviamos los datos del cupón al frontend
        res.status(200).json(couponFound);
    } catch (error) {
        console.log("Error al validar cupón:", error.message);
        res.status(500).json({ message: "Error interno al validar el cupón." });
    }
};

// Función para que el admin vea todos los cupones creados

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        console.log("Error al obtener cupones:", error.message);
        res.status(500).json({ message: "Error interno al obtener los cupones." });
    }
};

// Función para que el admin elimine un cupón

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Cupón no encontrado." });
        }
        res.status(200).json({ message: "Cupón eliminado con éxito." });
    } catch (error) {
        console.log("Error al eliminar cupón:", error.message);
        res.status(500).json({ message: "Error interno al eliminar el cupón." });
    }
};