import Joi from "joi";

const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorDetails = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        details: errorDetails,
      });
    }
    next();
  };
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must have at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Must be a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must have at least 6 characters",
    "string.max": "Password must have at most 128 characters",
    "string.empty": "Password is required",
  }),
  phone: Joi.string().optional().allow(""),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Must be a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

export const passwordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must have at least 6 characters",
    "string.max": "Password must have at most 128 characters",
    "string.empty": "Password is required",
  }),
});

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default validateSchema;
