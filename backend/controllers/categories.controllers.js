import Category from "../models/Category.js";

export const getAllCategories = async (req, res) => {
    try {
        const { isActive } = req.query;
        let query = { tenantId: req.tenant._id };
        if (isActive !== undefined) query.isActive = isActive === "true";

        const categories = await Category.find(query).sort({ order: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories." });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, tenantId: req.tenant._id });
        if (!category) return res.status(404).json({ message: "Category not found." });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category." });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, imageUrl, parentId, order } = req.body;

        const existingCategory = await Category.findOne({ tenantId: req.tenant._id, slug });
        if (existingCategory) {
            return res.status(400).json({ message: "Category slug already exists." });
        }

        const newCategory = new Category({
            tenantId: req.tenant._id,
            name,
            slug,
            description: description || "",
            imageUrl: imageUrl || "",
            parentId: parentId || null,
            order: order || 0,
            isActive: true
        });

        const savedCategory = await newCategory.save();
        res.status(201).json({ message: "Category created!", category: savedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error creating category." });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: id, tenantId: req.tenant._id },
            updates,
            { returnDocument: "after" }
        );

        if (!updatedCategory) return res.status(404).json({ message: "Category not found." });

        res.json({ message: "Category updated!", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error updating category." });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findOneAndDelete({ _id: id, tenantId: req.tenant._id });
        if (!deletedCategory) return res.status(404).json({ message: "Category not found." });

        res.json({ message: "Category deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category." });
    }
};

export const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findOne({ _id: id, tenantId: req.tenant._id });
        if (!category) return res.status(404).json({ message: "Category not found." });

        category.isActive = !category.isActive;
        await category.save();

        res.json({ message: `Category ${category.isActive ? 'activated' : 'deactivated'}!`, category });
    } catch (error) {
        res.status(500).json({ message: "Error updating category status." });
    }
};
