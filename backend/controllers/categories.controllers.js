import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { ALLOWED_IMAGE_TYPES } from "../middleware/validation.js";

const validateImageFile = (file) => {
  if (!file) return { valid: false, error: "No file provided." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }
  return { valid: true };
};

const extractPublicId = (url) => {
  try {
    if (!url || !url.includes("res.cloudinary.com")) return null;
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const partsAfterUpload = parts[1].split("/");
    let publicIdWithExtension;
    if (partsAfterUpload[0].startsWith("v") && !isNaN(partsAfterUpload[0].substring(1))) {
      publicIdWithExtension = partsAfterUpload.slice(1).join("/");
    } else {
      publicIdWithExtension = partsAfterUpload.join("/");
    }
    const dotIndex = publicIdWithExtension.lastIndexOf(".");
    const publicId = dotIndex !== -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
    return publicId;
  } catch (e) {
    return null;
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { isActive, page = 1, limit: rawLimit = 20 } = req.query;
    const limitNumber = Math.min(Math.max(1, Number(rawLimit) || 20), 100);
    const pageNumber = Math.max(1, Number(page) || 1);
    let query = { tenantId: req.tenant._id };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (pageNumber - 1) * limitNumber;

    const [categories, total] = await Promise.all([
      Category.find(query).sort({ order: 1 }).skip(skip).limit(limitNumber),
      Category.countDocuments(query),
    ]);

    res.status(200).json({
      info: {
        total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
      results: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ message: "Error fetching categories." });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error.message);
    res.status(500).json({ message: "Error fetching category." });
  }
};

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      icon,
      backgroundColor,
      displayStyle,
      showOnHome,
      parentId,
      order,
    } = req.body;

    const existingCategory = await Category.findOne({
      tenantId: req.tenant._id,
      slug,
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category slug already exists." });
    }

    let imageUrlVal = req.body.imageUrl || "";

    if (req.files && req.files.image) {
      const file = req.files.image;
      const validation = validateImageFile(file);
      if (!validation.valid) {
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
        return res.status(400).json({ message: validation.error });
      }

      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      imageUrlVal = result.secure_url;
      try {
        await fs.unlink(file.tempFilePath);
      } catch (e) {}
    }

    const newCategory = new Category({
      tenantId: req.tenant._id,
      name,
      slug,
      description: description || "",
      imageUrl: imageUrlVal,
      icon: icon || "",
      backgroundColor: backgroundColor || "",
      displayStyle: displayStyle || "image",
      showOnHome: showOnHome !== undefined ? (showOnHome === "true" || showOnHome === true) : true,
      parentId: parentId || null,
      order: order || 0,
      isActive: true,
    });

    const savedCategory = await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created!", category: savedCategory });
  } catch (error) {
    if (req.files && req.files.image) {
      try {
        await fs.unlink(req.files.image.tempFilePath);
      } catch (e) {}
    }
    console.error("Error creating category:", error.message);
    res.status(500).json({ message: "Error creating category." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      icon,
      backgroundColor,
      displayStyle,
      showOnHome,
      parentId,
      order,
    } = req.body;

    const category = await Category.findOne({ _id: id, tenantId: req.tenant._id });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (backgroundColor !== undefined) updates.backgroundColor = backgroundColor;
    if (displayStyle !== undefined) updates.displayStyle = displayStyle;
    if (showOnHome !== undefined) updates.showOnHome = showOnHome === "true" || showOnHome === true;
    if (parentId !== undefined) updates.parentId = parentId;
    if (order !== undefined) updates.order = Number(order);

    if (req.body.imageUrl !== undefined) {
      updates.imageUrl = req.body.imageUrl;
    }

    if (req.files && req.files.image) {
      const file = req.files.image;
      const validation = validateImageFile(file);
      if (!validation.valid) {
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
        return res.status(400).json({ message: validation.error });
      }

      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      updates.imageUrl = result.secure_url;
      try {
        await fs.unlink(file.tempFilePath);
      } catch (e) {}

      // Clean up old image from Cloudinary
      if (category.imageUrl) {
        const publicId = extractPublicId(category.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error("Failed to delete category image from Cloudinary:", cloudinaryError.message);
          }
        }
      }
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, tenantId: req.tenant._id },
      updates,
      { returnDocument: "after" },
    );

    res.json({ message: "Category updated!", category: updatedCategory });
  } catch (error) {
    if (req.files && req.files.image) {
      try {
        await fs.unlink(req.files.image.tempFilePath);
      } catch (e) {}
    }
    console.error("Error updating category:", error.message);
    res.status(500).json({ message: "Error updating category." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findOneAndDelete({
      _id: id,
      tenantId: req.tenant._id,
    });
    if (!deletedCategory)
      return res.status(404).json({ message: "Category not found." });

    // Clean up from Cloudinary
    if (deletedCategory.imageUrl) {
      const publicId = extractPublicId(deletedCategory.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {}
      }
    }

    res.json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Error deleting category." });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      _id: id,
      tenantId: req.tenant._id,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found." });

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      message: `Category ${category.isActive ? "activated" : "deactivated"}!`,
      category,
    });
  } catch (error) {
    console.error("Error updating category status:", error.message);
    res.status(500).json({ message: "Error updating category status." });
  }
};
