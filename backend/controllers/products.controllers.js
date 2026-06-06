import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";

export const getAllProducts = async (req, res) => {
    try {
        // Añadimos 'category' a los parámetros que el frontend puede pedir
        const { page = 1, limit = 10, brand, size, isFeatured, category } = req.query;
        let queryFilters = { isDeleted: false };

        if(brand) queryFilters.brand = { $regex: brand, $options: "i" };
        if(size) queryFilters["sizes.size"] = { $in: [String(size)] }; // Lo buscamos como texto
        if(isFeatured === 'true') queryFilters.isFeatured = true;
        
        // Filtro exacto por categoría
        if(category) queryFilters.category = category;

        const skip = (page - 1) * limit;
        const products = await Product.find(queryFilters).skip(skip).limit(Number(limit));
        const totalProducts = await Product.countDocuments(queryFilters);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            info: { totalProducts, totalPages, currentPage: Number(page), hasNextPage: page < totalPages, hasPrevPage: page > 1 },
            results: products
        });
    } catch (error) {
        res.status(500).json({ message: "Hubo un error al obtener los productos" });
    }
}

export const getProductById = async (req,res) => {
    try{
        const { id } = req.params;
        const productFound = await Product.findOne({ _id: id, isDeleted: false });

        if(!productFound) return res.status(404).json({ message: "Producto no encontrado."});
        if(productFound.stock === 0) return res.status(403).json({ message: "Producto temporalmente sin stock general."});

        res.json(productFound);
    }catch (error){
        res.status(500).json({ message: "Error al buscar producto."});
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        if (productData.sizes) {
            productData.sizes = JSON.parse(productData.sizes);
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
                const result = await cloudinary.uploader.upload(file.tempFilePath);
                imagesArray.push(result.secure_url);
                // Borramos el archivo temporal después de subirlo
                await fs.unlink(file.tempFilePath);
            }
            productData.images = imagesArray;
        } else {
            productData.images = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"];
        }

        const newProduct = new Product(productData);
        const productSaved = await newProduct.save();

        res.status(201).json({ message: "¡Zapatilla guardada con éxito!", product: productSaved });
    } catch (error) {
        // En caso de error, intentamos limpiar archivos si quedaron
        if (req.files && req.files.images) {
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];
            for (let file of files) {
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
        }
        res.status(500).json({ message: "Error de validación: " + error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' });
        if(!deletedProduct) return res.status(404).json({ message: "Producto no encontrado."});
        res.json({ message: "¡Producto eliminado con éxito!"});
    }catch (error) {
        res.status(500).json({ message: "Error interno al eliminar producto." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = { ...req.body };

        if (productData.sizes) {
            productData.sizes = JSON.parse(productData.sizes);
            productData.stock = productData.sizes.reduce((total, item) => total + Number(item.stock), 0);
        }

        if (req.files && req.files.images) {
            let imagesArray = [];
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];

            for (let file of files) {
                const result = await cloudinary.uploader.upload(file.tempFilePath);
                imagesArray.push(result.secure_url);
                // Borramos el archivo temporal
                await fs.unlink(file.tempFilePath);
            }
            productData.images = imagesArray;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, productData, { returnDocument: 'after' });
        if (!updatedProduct) return res.status(404).json({ message: "Producto no encontrado." });

        res.json({ message: "¡Zapatilla actualizada con éxito!", product: updatedProduct });
    } catch (error) {
        // Limpieza en caso de error
        if (req.files && req.files.images) {
            let files = req.files.images;
            if (!Array.isArray(files)) files = [files];
            for (let file of files) {
                try { await fs.unlink(file.tempFilePath); } catch (e) {}
            }
        }
        res.status(500).json({ message: "Error interno al actualizar." });
    }
};

//  Enciende o apaga la estrella de "Destacado"
export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const productFound = await Product.findById(id);
        
        if (!productFound) return res.status(404).json({ message: "Producto no encontrado." });

        productFound.isFeatured = !productFound.isFeatured;
        await productFound.save();

        res.json({ message: `Producto marcado como ${productFound.isFeatured ? 'DESTACADO' : 'NORMAL'}`, product: productFound });
    } catch (error) {
        res.status(500).json({ message: "Error al destacar el producto." });
    }
};