import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";

export const createTenant = async (req, res) => {
  try {
    const {
      name,
      slug,
      ownerEmail,
      ownerName,
      ownerPassword,
      plan,
      theme,
      settings,
    } = req.body;

    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(400).json({ message: "Store slug already exists." });
    }

    if (!ownerPassword || ownerPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have at least 6 characters." });
    }

    const newTenant = new Tenant({
      name,
      slug,
      plan: plan || "free",
      theme: theme || {},
      settings: settings || {},
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ownerPassword, salt);

    const owner = new User({
      tenantId: newTenant._id,
      name: ownerName,
      email: ownerEmail,
      password: hashedPassword,
      role: "admin",
    });

    await owner.save();

    newTenant.owner = owner._id;
    const savedTenant = await newTenant.save();

    res
      .status(201)
      .json({ message: "Store created successfully!", tenant: savedTenant });
  } catch (error) {
    console.error("Error creating tenant:", error.message);
    res.status(500).json({ message: "Error creating store." });
  }
};

export const getAllTenants = async (req, res) => {
  try {
    const { page = 1, limit: rawLimit = 20, isActive } = req.query;
    const limit = Math.min(Number(rawLimit) || 20, 100);
    let query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;
    const tenants = await Tenant.find(query)
      .populate("owner", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    res.status(200).json({
      info: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
      results: tenants,
    });
  } catch (error) {
    console.error("Error fetching stores:", error.message);
    res.status(500).json({ message: "Error fetching stores." });
  }
};

export const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!tenant) return res.status(404).json({ message: "Store not found." });
    res.json(tenant);
  } catch (error) {
    console.error("Error fetching store:", error.message);
    res.status(500).json({ message: "Error fetching store." });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, isActive, theme, settings } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (plan !== undefined) updates.plan = plan;
    if (isActive !== undefined) updates.isActive = isActive;
    if (theme !== undefined) updates.theme = theme;
    if (settings !== undefined) updates.settings = settings;

    const updatedTenant = await Tenant.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
    });
    if (!updatedTenant)
      return res.status(404).json({ message: "Store not found." });

    res.json({ message: "Store updated successfully!", tenant: updatedTenant });
  } catch (error) {
    console.error("Error updating store:", error.message);
    res.status(500).json({ message: "Error updating store." });
  }
};

export const toggleTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: "Store not found." });

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    res.json({
      message: `Store ${tenant.isActive ? "activated" : "suspended"} successfully!`,
      tenant,
    });
  } catch (error) {
    console.error("Error updating store status:", error.message);
    res.status(500).json({ message: "Error updating store status." });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTenant = await Tenant.findByIdAndDelete(id);
    if (!deletedTenant)
      return res.status(404).json({ message: "Store not found." });

    await Promise.all([
      User.deleteMany({ tenantId: id }),
      Product.deleteMany({ tenantId: id }),
      Order.deleteMany({ tenantId: id }),
      Category.deleteMany({ tenantId: id }),
      Coupon.deleteMany({ tenantId: id }),
      Review.deleteMany({ tenantId: id }),
    ]);

    res.json({ message: "Store and all associated data deleted permanently." });
  } catch (error) {
    console.error("Error deleting store:", error.message);
    res.status(500).json({ message: "Error deleting store." });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const tenantsByPlan = await Tenant.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    res.json({
      totalTenants,
      activeTenants,
      totalUsers,
      tenantsByPlan,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error.message);
    res.status(500).json({ message: "Error fetching analytics." });
  }
};
