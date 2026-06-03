import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";

// Obtener todas las reseñas para mostrarlas en la página de inicio
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }); // Las más nuevas primero
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reseñas." });
    }
};

// Crear una nueva reseña (Solo para el Admin)
export const createReview = async (req, res) => {
    try {
        const { clientName, clientRole, message } = req.body;
        let imageUrl = "";

        // Subir la foto del cliente a Cloudinary
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: "La imagen del cliente es obligatoria." });
        }

        const newReview = new Review({
            clientName,
            clientRole,
            message,
            image: imageUrl
        });

        const savedReview = await newReview.save();
        res.status(201).json({ message: "¡Reseña publicada con éxito!", review: savedReview });
    } catch (error) {
        console.log("Error al crear reseña:", error.message);
        res.status(500).json({ message: "Error al crear la reseña." });
    }
};

// Eliminar una reseña (Solo para el Admin)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);
        
        if (!deletedReview) {
            return res.status(404).json({ message: "Reseña no encontrada." });
        }
        
        res.status(200).json({ message: "Reseña eliminada con éxito." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reseña." });
    }
};