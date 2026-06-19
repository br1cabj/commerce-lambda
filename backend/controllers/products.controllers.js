import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { ALLOWED_IMAGE_TYPES } from "../middleware/validation.js";

const validateImageFile = (file) => {
    if (!file) return { valid: false, error: "No file provided." };
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}` };
    }
    return { valid: true };
};

export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, brand, size, isFeatured, category } = req.query;
        let queryFilters = { tenantId: req.tenant._id, isDeleted: false };

        if (brand) queryFilters.brand = { $regex: brand, $options: "i" };
        if (size) queryFilters["sizes.size"] = { $in: [String(size)] };
        if (isFeatured === 'true') queryFilters.isFeatured = true;
        if (category) queryFilters.category = category;

        const skip = (page - 1) * limit;
        const products = await Product.find(queryFilters).skip(skip).limit(Number(limit));
        const totalProducts = await Product.countDocuments(queryFilters);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            info: { totalProducts, totalPages, currentPage: Number(page), hasNextPage: page < totalPages, hasPrevPage: page > 1 },
            results: products
        });
    } catch (error) {
        console.error("Error retrieving products:", error.message);
        res.status(500).json({ message: "Error retrieving products" });
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const productFound = await Product.findOne({ _id: id, tenantId: req.tenant._id, isDeleted: false });

        if (!productFound) return res.status(404).json({ message: "Product not found." });
        if (productFound.stock === 0) return res.status(403).json({ message: "Product temporarily out of stock." });

        res.json(productFound);
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ message: "Error fetching product." });
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body, tenantId: req.tenant._id };

        if (productData.sizes) {
            try {
                productData.sizes = typeof productData.sizes === 'string' ? JSON.parse(productData.sizes) : productData.sizes;
            } catch (parseError) {
                return res.status(400).json({ message: "Invalid sizes format. Must be valid JSON." });
            }
            productData.stock = productData.sizes.reduce((total, item) => total + Number(item.stock), 0);
        } else {
            productData.sizes = [];
            productData.stock = 0;
        }

        if (req.files && req.files.images) {
            let imagesArray = [];
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];

            for (let file of files) {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    for (let uploaded of imagesArray) {
                        try { await cloudinary.uploader.destroy(uploaded.public_id); } catch (e) {}
                    }
                    for (let f of files) {
                        try { await fs.unlink(f.tempFilePath); } catch (e) {}
                    }
                    return res.status(400).json({ message: validation.error });
                }

                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    resource_type: "image",
                    transformation: [{ quality: "auto", fetch_format: "auto" }]
                });
                imagesArray.push(result.secure_url);
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
            productData.images = imagesArray;
        } else {
            productData.images = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"];
        }

        const newProduct = new Product(productData);
        const productSaved = await newProduct.save();

        res.status(201).json({ message: "Product created successfully!", product: productSaved });
    } catch (error) {
        if (req.files && req.files.images) {
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];
            for (let file of files) {
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
        }
        console.error("Error creating product:", error.message);
        res.status(500).json({ message: "Error creating product: " + error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findOneAndUpdate(
            { _id: id, tenantId: req.tenant._id },
            { isDeleted: true },
            { returnDocument: 'after' }
        );
        if (!deletedProduct) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product deleted successfully!" });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.status(500).json({ message: "Error deleting product." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = { ...req.body };

        if (productData.sizes) {
            try {
                productData.sizes = typeof productData.sizes === 'string' ? JSON.parse(productData.sizes) : productData.sizes;
            } catch (parseError) {
                return res.status(400).json({ message: "Invalid sizes format. Must be valid JSON." });
            }
            productData.stock = productData.sizes.reduce((total, item) => total + Number(item.stock), 0);
        }

        if (req.files && req.files.images) {
            let imagesArray = [];
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];

            for (let file of files) {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    for (let f of files) {
                        try { await fs.unlink(f.tempFilePath); } catch (e) {}
                    }
                    return res.status(400).json({ message: validation.error });
                }

                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    resource_type: "image",
                    transformation: [{ quality: "auto", fetch_format: "auto" }]
                });
                imagesArray.push(result.secure_url);
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
            productData.images = imagesArray;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, tenantId: req.tenant._id },
            productData,
            { returnDocument: 'after' }
        );
        if (!updatedProduct) return res.status(404).json({ message: "Product not found." });

        res.json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
        if (req.files && req.files.images) {
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];
            for (let file of files) {
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
        }
        console.error("Error updating product:", error.message);
        res.status(500).json({ message: "Error updating product." });
    }
};

export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const productFound = await Product.findOne({ _id: id, tenantId: req.tenant._id });

        if (!productFound) return res.status(404).json({ message: "Product not found." });

        productFound.isFeatured = !productFound.isFeatured;
        await productFound.save();

        res.json({ message: `Product marked as ${productFound.isFeatured ? 'FEATURED' : 'NORMAL'}`, product: productFound });
    } catch (error) {
        console.error("Error featuring product:", error.message);
        res.status(500).json({ message: "Error featuring product." });
    }
};
