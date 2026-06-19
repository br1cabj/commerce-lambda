import Category from "../models/Category.js";

export const getAllCategories = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;
    let query = { tenantId: req.tenant._id };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const categories = await Category.find(query)
      .sort({ order: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    res.status(200).json({
      info: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
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
    const { name, slug, description, imageUrl, parentId, order } = req.body;

    const existingCategory = await Category.findOne({
      tenantId: req.tenant._id,
      slug,
    });
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
      isActive: true,
    });

    const savedCategory = await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created!", category: savedCategory });
  } catch (error) {
    console.error("Error creating category:", error.message);
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
      { returnDocument: "after" },
    );

    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found." });

    res.json({ message: "Category updated!", category: updatedCategory });
  } catch (error) {
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
