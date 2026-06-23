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

const extractPublicId = (url) => {
  try {
    if (!url || !url.includes("res.cloudinary.com")) return null;
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Skip version (v1234567) and take folder/public_id
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
      minPrice,
      maxPrice,
      status,
      q,
      tag,
    } = req.query;
    const limitNumber = Math.min(Math.max(1, Number(rawLimit) || 10), 100);
    const pageNumber = Math.max(1, Number(page) || 1);
    let queryFilters = { tenantId: req.tenant._id, isDeleted: false };

    if (q && q.trim().length >= 2) {
      const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const qRegex = { $regex: escapedQ, $options: "i" };
      queryFilters.$or = [
        { brand: qRegex },
        { model: qRegex },
        { category: qRegex }
      ];
    }

    if (brand) {
      const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryFilters.brand = { $regex: escapedBrand, $options: "i" };
    }
    if (size) queryFilters["sizes.size"] = { $in: [String(size)] };
    if (isFeatured === "true") queryFilters.isFeatured = true;
    if (category) queryFilters.category = category;
    if (tag) {
      queryFilters.tags = { $regex: new RegExp(`^${tag.trim()}$`, "i") };
    }
    if (minDiscount) queryFilters.discount = { $gte: Number(minDiscount) };
    if (minPrice || maxPrice) {
      queryFilters.price = {};
      if (minPrice) queryFilters.price.$gte = Number(minPrice);
      if (maxPrice) queryFilters.price.$lte = Number(maxPrice);
    }

    // Handle status filtering
    if (status) {
      if (status !== "all") {
        queryFilters.status = status;
      }
    } else {
      // Default to returning published or undef/null for compatibility
      queryFilters.status = { $in: ["published", null, undefined] };
    }

    const skip = (pageNumber - 1) * limitNumber;
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
        .limit(limitNumber),
      Product.countDocuments(queryFilters),
    ]);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      info: {
        totalProducts,
        totalPages,
        currentPage: pageNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
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
      status,
      seoTitle,
      seoDescription,
      tags,
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
      status: status || "published",
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
    };

    if (tags !== undefined) {
      if (typeof tags === "string") {
        try {
          productData.tags = JSON.parse(tags);
        } catch {
          productData.tags = tags.split(",").map(t => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        productData.tags = tags;
      }
    }

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
      isBestSeller,
      sku,
      packageWeight,
      packageLength,
      packageWidth,
      packageHeight,
      status,
      seoTitle,
      seoDescription,
      tags,
    } = req.body;

    const product = await Product.findOne({ _id: id, tenantId: req.tenant._id });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const productData = {};
    if (model !== undefined) productData.model = model;
    if (brand !== undefined) productData.brand = brand;
    if (price !== undefined) productData.price = Number(price);
    if (discount !== undefined) productData.discount = Number(discount);
    if (category !== undefined) productData.category = category;
    if (description !== undefined) productData.description = description;
    if (sku !== undefined) productData.sku = sku;
    if (earnedPoints !== undefined) productData.earnedPoints = Number(earnedPoints);
    if (isFeatured !== undefined) productData.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isNew !== undefined) productData.isNew = isNew === "true" || isNew === true;
    if (isBestSeller !== undefined) productData.isBestSeller = isBestSeller === "true" || isBestSeller === true;
    if (status !== undefined) productData.status = status;
    if (seoTitle !== undefined) productData.seoTitle = seoTitle;
    if (seoDescription !== undefined) productData.seoDescription = seoDescription;
    
    if (tags !== undefined) {
      if (typeof tags === "string") {
        try {
          productData.tags = JSON.parse(tags);
        } catch {
          productData.tags = tags.split(",").map(t => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        productData.tags = tags;
      }
    }
    
    if (packageWeight !== undefined || packageLength !== undefined || packageWidth !== undefined || packageHeight !== undefined) {
      productData.packageData = {
        weight: packageWeight !== undefined ? Number(packageWeight) : (product.packageData?.weight || 0),
        length: packageLength !== undefined ? Number(packageLength) : (product.packageData?.length || 0),
        width: packageWidth !== undefined ? Number(packageWidth) : (product.packageData?.width || 0),
        height: packageHeight !== undefined ? Number(packageHeight) : (product.packageData?.height || 0),
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

    // Advanced Image management
    let keptImages = product.images || [];
    if (req.body.existingImages !== undefined) {
      try {
        keptImages = typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (e) {
        return res.status(400).json({ message: "Invalid existingImages format." });
      }
    }

    let uploadedUrls = [];
    if (req.files && req.files.images) {
      let files = req.files.images;
      if (!Array.isArray(files)) files = [files];

      // Validate all files first
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

      // Upload all in parallel
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

      uploadedUrls = await Promise.all(uploadPromises);
    }

    const newImages = [...keptImages, ...uploadedUrls];
    if (newImages.length > 0) {
      productData.images = newImages;

      // Clean up deleted images from Cloudinary
      const imagesToRemove = product.images.filter(img => !newImages.includes(img));
      for (let img of imagesToRemove) {
        const publicId = extractPublicId(img);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error("Failed to delete image from Cloudinary:", cloudinaryError.message);
          }
        }
      }
    } else if (req.body.existingImages !== undefined) {
      // If we explicitly kept zero images and uploaded nothing
      productData.images = [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
      ];
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenant._id },
      productData,
      { returnDocument: "after" },
    );

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
