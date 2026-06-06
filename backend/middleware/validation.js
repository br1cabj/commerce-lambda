import Joi from "joi";

/**
 * Middleware genérico para validar el cuerpo de la petición contra un esquema de Joi.
 */
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorDetails = error.details.map((detail) => detail.message).join(", ");
            return res.status(400).json({ 
                status: "error",
                message: "Error de validación",
                details: errorDetails
            });
        }
        next();
    };
};

// Esquemas de validación
export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'El nombre es obligatorio',
        'string.min': 'El nombre debe tener al menos 2 caracteres'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Debe ser un correo electrónico válido',
        'string.empty': 'El correo electrónico es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.empty': 'La contraseña es obligatoria'
    }),
    phone: Joi.string().optional().allow("")
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export default validateSchema;
