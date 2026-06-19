import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ tenantId: req.tenant._id }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews." });
    }
};

export const createReview = async (req, res) => {
    try {
        const { clientName, clientRole, message } = req.body;
        let imageUrl = "";

        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: "Client image is required." });
        }

        const newReview = new Review({
            tenantId: req.tenant._id,
            clientName,
            clientRole,
            message,
            image: imageUrl
        });

        const savedReview = await newReview.save();
        res.status(201).json({ message: "Review published successfully!", review: savedReview });
    } catch (error) {
        console.log("Error creating review:", error.message);
        res.status(500).json({ message: "Error creating review." });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findOneAndDelete({ _id: id, tenantId: req.tenant._id });
        
        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found." });
        }
        
        res.status(200).json({ message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review." });
    }
};
