import Product from "../models/Product.js";
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

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit: rawLimit = 10,
      brand,
      size,
      isFeatured,
      category,
      sort,
      order,
      minDiscount,
    } = req.query;
    const limit = Math.min(Number(rawLimit) || 10, 100);
    let queryFilters = { tenantId: req.tenant._id, isDeleted: false };

    if (brand) {
      const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryFilters.brand = { $regex: escapedBrand, $options: "i" };
    }
    if (size) queryFilters["sizes.size"] = { $in: [String(size)] };
    if (isFeatured === "true") queryFilters.isFeatured = true;
    if (category) queryFilters.category = category;
    if (minDiscount) queryFilters.discount = { $gte: Number(minDiscount) };

    const skip = (page - 1) * limit;
    const ALLOWED_SORT_FIELDS = [
      "createdAt",
      "price",
      "model",
      "brand",
      "salesCount",
      "discount",
    ];
    
    const sortOptions = {};
    const validSortBy = ALLOWED_SORT_FIELDS.includes(sort) ? sort : "createdAt";
    const validOrder = order === "asc" ? 1 : -1;
    sortOptions[validSortBy] = validOrder;

    const [products, totalProducts] = await Promise.all([
      Product.find(queryFilters)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(queryFilters),
    ]);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      info: {
        totalProducts,
        totalPages,
        currentPage: Number(page),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      results: products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error.message);
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      tenantId: req.tenant._id,
      isDeleted: false,
    };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [{ _id: id }, { slug: id }];
    } else {
      query.slug = id;
    }

    const productFound = await Product.findOne(query);

    if (!productFound)
      return res.status(404).json({ message: "Product not found." });
    if (productFound.stock === 0)
      return res
        .status(200)
        .json({ message: "Product temporarily out of stock.", product: productFound });

    res.json(productFound);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ message: "Error fetching product." });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      model,
      brand,
      price,
      discount,
      category,
      description,
      sizes,
      earnedPoints,
      isFeatured,
      isNew,
      isBestSeller,
      sku,
      packageWeight,
      packageLength,
      packageWidth,
      packageHeight,
    } = req.body;

    const baseSlug = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const productData = {
      tenantId: req.tenant._id,
      model,
      brand,
      price,
      discount: discount || 0,
      category,
      description: description || "",
      sku: sku || "",
      slug,
      packageData: {
        weight: Number(packageWeight) || 0,
        length: Number(packageLength) || 0,
        width: Number(packageWidth) || 0,
        height: Number(packageHeight) || 0
      },
      earnedPoints: earnedPoints || 0,
      isFeatured: isFeatured || false,
      isNew: isNew || false,
      isBestSeller: isBestSeller || false,
    };

    if (sizes) {
      try {
        productData.sizes =
          typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (parseError) {
        return res
          .status(400)
          .json({ message: "Invalid sizes format. Must be valid JSON." });
      }
      productData.stock = productData.sizes.reduce(
        (total, item) => total + Number(item.stock),
        0,
      );
    } else {
      productData.sizes = [];
      productData.stock = 0;
    }

    if (req.files && req.files.images) {
      let imagesArray = [];
      let files = req.files.images;
      if (!Array.isArray(files)) files = [files];

      // Validar todos los archivos primero
      for (let file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          for (let f of files) {
            try {
              await fs.unlink(f.tempFilePath);
            } catch (e) {}
          }
          return res.status(400).json({ message: validation.error });
        }
      }

      // Subir todas las imagenes en paralelo
      const uploadPromises = files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
        return result.secure_url;
      });

      imagesArray = await Promise.all(uploadPromises);
      productData.images = imagesArray;
    } else {
      productData.images = [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
      ];
    }

    const newProduct = new Product(productData);
    const productSaved = await newProduct.save();

    res.status(201).json({
      message: "Product created successfully!",
      product: productSaved,
    });
  } catch (error) {
    if (req.files && req.files.images) {
      let files = req.files.images;
      if (!Array.isArray(files)) files = [files];
      for (let file of files) {
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
      }
    }
    console.error("Error creating product:", error.message);
    res
      .status(500)
      .json({ message: "Error creating product: " + error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenant._id },
      { isDeleted: true },
      { returnDocument: "after" },
    );
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Error deleting product." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      model,
      brand,
      price,
      discount,
      category,
      description,
      sizes,
      earnedPoints,
      isFeatured,
      isNew,
      isNew,
      isBestSeller,
      sku,
      packageWeight,
      packageLength,
      packageWidth,
      packageHeight,
    } = req.body;

    const productData = {};
    if (model !== undefined) productData.model = model;
    if (brand !== undefined) productData.brand = brand;
    if (price !== undefined) productData.price = price;
    if (discount !== undefined) productData.discount = discount;
    if (category !== undefined) productData.category = category;
    if (description !== undefined) productData.description = description;
    if (sku !== undefined) productData.sku = sku;
    if (earnedPoints !== undefined) productData.earnedPoints = earnedPoints;
    if (isFeatured !== undefined) productData.isFeatured = isFeatured;
    if (isNew !== undefined) productData.isNew = isNew;
    if (isBestSeller !== undefined) productData.isBestSeller = isBestSeller;
    
    if (packageWeight !== undefined || packageLength !== undefined || packageWidth !== undefined || packageHeight !== undefined) {
      productData.packageData = {
        weight: packageWeight !== undefined ? Number(packageWeight) : 0,
        length: packageLength !== undefined ? Number(packageLength) : 0,
        width: packageWidth !== undefined ? Number(packageWidth) : 0,
        height: packageHeight !== undefined ? Number(packageHeight) : 0,
      };
    }

    if (sizes !== undefined) {
      try {
        productData.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (parseError) {
        return res
          .status(400)
          .json({ message: "Invalid sizes format. Must be valid JSON." });
      }
      productData.stock = productData.sizes.reduce(
        (total, item) => total + Number(item.stock),
        0,
      );
    }

    if (req.files && req.files.images) {
      let imagesArray = [];
      let files = req.files.images;
      if (!Array.isArray(files)) files = [files];

      // Validar todos los archivos primero
      for (let file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          for (let f of files) {
            try {
              await fs.unlink(f.tempFilePath);
            } catch (e) {}
          }
          return res.status(400).json({ message: validation.error });
        }
      }

      // Subir todas las imagenes en paralelo
      const uploadPromises = files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
        return result.secure_url;
      });

      imagesArray = await Promise.all(uploadPromises);
      productData.images = imagesArray;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenant._id },
      productData,
      { returnDocument: "after" },
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found." });

    res.json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    if (req.files && req.files.images) {
      let files = req.files.images;
      if (!Array.isArray(files)) files = [files];
      for (let file of files) {
        try {
          await fs.unlink(file.tempFilePath);
        } catch (e) {}
      }
    }
    console.error("Error updating product:", error.message);
    res.status(500).json({ message: "Error updating product." });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const productFound = await Product.findOne({
      _id: id,
      tenantId: req.tenant._id,
    });

    if (!productFound)
      return res.status(404).json({ message: "Product not found." });

    productFound.isFeatured = !productFound.isFeatured;
    await productFound.save();

    res.json({
      message: `Product marked as ${productFound.isFeatured ? "FEATURED" : "NORMAL"}`,
      product: productFound,
    });
  } catch (error) {
    console.error("Error featuring product:", error.message);
    res.status(500).json({ message: "Error featuring product." });
  }
};
