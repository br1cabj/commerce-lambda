import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";
import { ALLOWED_IMAGE_TYPES } from "../middleware/validation.js";
import fs from "fs/promises";

const sanitizeHtml = (str) => {
  if (!str) return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ tenantId: req.tenant._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ tenantId: req.tenant._id });

    res.status(200).json({
      info: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
      results: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ message: "Error fetching reviews." });
  }
};

export const createReview = async (req, res) => {
  try {
    const { clientName, clientRole, message } = req.body;
    let imageUrl = "";

    if (req.files && req.files.image) {
      const file = req.files.image;
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return res
          .status(400)
          .json({
            message: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          });
      }
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      imageUrl = result.secure_url;
      try {
        await fs.unlink(file.tempFilePath);
      } catch (e) {}
    }

    const newReview = new Review({
      tenantId: req.tenant._id,
      clientName: sanitizeHtml(clientName),
      clientRole: sanitizeHtml(clientRole),
      message: sanitizeHtml(message),
      image: imageUrl,
    });

    const savedReview = await newReview.save();
    res
      .status(201)
      .json({ message: "Review published successfully!", review: savedReview });
  } catch (error) {
    if (req.files && req.files.image) {
      try {
        await fs.unlink(req.files.image.tempFilePath);
      } catch (e) {}
    }
    console.error("Error creating review:", error.message);
    res.status(500).json({ message: "Error creating review." });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findOneAndDelete({
      _id: id,
      tenantId: req.tenant._id,
    });

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error.message);
    res.status(500).json({ message: "Error deleting review." });
  }
};
