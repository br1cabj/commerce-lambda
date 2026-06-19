import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createTenant = async (req, res) => {
    try {
        const { name, slug, ownerEmail, ownerName, ownerPassword, plan, theme, settings } = req.body;

        const existingTenant = await Tenant.findOne({ slug });
        if (existingTenant) {
            return res.status(400).json({ message: "Store slug already exists." });
        }

        let owner = await User.findOne({ email: ownerEmail });

        if (!owner) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ownerPassword, salt);

            owner = new User({
                name: ownerName,
                email: ownerEmail,
                password: hashedPassword,
                role: "admin"
            });
            await owner.save();
        }

        const newTenant = new Tenant({
            name,
            slug,
            owner: owner._id,
            plan: plan || "free",
            theme: theme || {},
            settings: settings || {}
        });

        const savedTenant = await newTenant.save();

        res.status(201).json({ message: "Store created successfully!", tenant: savedTenant });
    } catch (error) {
        console.log("Error creating tenant:", error.message);
        res.status(500).json({ message: "Error creating store." });
    }
};

export const getAllTenants = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive } = req.query;
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
            info: { total, currentPage: Number(page), totalPages: Math.ceil(total / limit) },
            results: tenants
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stores." });
    }
};

export const getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id).populate("owner", "name email");
        if (!tenant) return res.status(404).json({ message: "Store not found." });
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: "Error fetching store." });
    }
};

export const updateTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTenant = await Tenant.findByIdAndUpdate(id, updates, { returnDocument: "after" });
        if (!updatedTenant) return res.status(404).json({ message: "Store not found." });

        res.json({ message: "Store updated successfully!", tenant: updatedTenant });
    } catch (error) {
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

        res.json({ message: `Store ${tenant.isActive ? 'activated' : 'suspended'} successfully!`, tenant });
    } catch (error) {
        res.status(500).json({ message: "Error updating store status." });
    }
};

export const deleteTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTenant = await Tenant.findByIdAndDelete(id);
        if (!deletedTenant) return res.status(404).json({ message: "Store not found." });

        res.json({ message: "Store deleted permanently." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting store." });
    }
};

export const getPlatformAnalytics = async (req, res) => {
    try {
        const totalTenants = await Tenant.countDocuments();
        const activeTenants = await Tenant.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments();
        const tenantsByPlan = await Tenant.aggregate([
            { $group: { _id: "$plan", count: { $sum: 1 } } }
        ]);

        res.json({
            totalTenants,
            activeTenants,
            totalUsers,
            tenantsByPlan
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching analytics." });
    }
};
