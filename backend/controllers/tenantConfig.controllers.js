import Tenant from "../models/Tenant.js";
import Category from "../models/Category.js";

export const getStoreConfig = async (req, res) => {
    try {
        const tenant = req.tenant;

        const categories = await Category.find({ tenantId: tenant._id, isActive: true }).sort({ order: 1 });

        res.json({
            name: tenant.name,
            slug: tenant.slug,
            theme: tenant.theme,
            settings: {
                currency: tenant.settings.currency,
                language: tenant.settings.language,
                whatsappNumber: tenant.settings.whatsappNumber,
                email: tenant.settings.email,
                phone: tenant.settings.phone,
                address: tenant.settings.address,
                paymentMethods: tenant.settings.paymentMethods.filter(m => m.enabled),
                shippingMethods: tenant.settings.shippingMethods.filter(m => m.enabled),
                features: tenant.settings.features
            },
            categories
        });
    } catch (error) {
        res.status(500).json({ message: "Error loading store configuration." });
    }
};

export const updateStoreConfig = async (req, res) => {
    try {
        const { settings } = req.body;

        const tenant = await Tenant.findById(req.tenant._id);
        if (!tenant) return res.status(404).json({ message: "Store not found." });

        if (settings) {
            if (settings.currency) tenant.settings.currency = settings.currency;
            if (settings.language) tenant.settings.language = settings.language;
            if (settings.whatsappNumber !== undefined) tenant.settings.whatsappNumber = settings.whatsappNumber;
            if (settings.email !== undefined) tenant.settings.email = settings.email;
            if (settings.phone !== undefined) tenant.settings.phone = settings.phone;
            if (settings.address !== undefined) tenant.settings.address = settings.address;
            if (settings.paymentMethods) tenant.settings.paymentMethods = settings.paymentMethods;
            if (settings.shippingMethods) tenant.settings.shippingMethods = settings.shippingMethods;
            if (settings.features) tenant.settings.features = { ...tenant.settings.features, ...settings.features };
        }

        await tenant.save();

        res.json({ message: "Store configuration updated!", tenant });
    } catch (error) {
        res.status(500).json({ message: "Error updating store configuration." });
    }
};

export const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;

        const tenant = await Tenant.findById(req.tenant._id);
        if (!tenant) return res.status(404).json({ message: "Store not found." });

        if (theme) {
            if (theme.primaryColor) tenant.theme.primaryColor = theme.primaryColor;
            if (theme.secondaryColor) tenant.theme.secondaryColor = theme.secondaryColor;
            if (theme.accentColor) tenant.theme.accentColor = theme.accentColor;
            if (theme.logoUrl !== undefined) tenant.theme.logoUrl = theme.logoUrl;
            if (theme.heroImageUrl !== undefined) tenant.theme.heroImageUrl = theme.heroImageUrl;
            if (theme.heroTitle !== undefined) tenant.theme.heroTitle = theme.heroTitle;
            if (theme.heroSubtitle !== undefined) tenant.theme.heroSubtitle = theme.heroSubtitle;
            if (theme.fontFamily) tenant.theme.fontFamily = theme.fontFamily;
        }

        await tenant.save();

        res.json({ message: "Theme updated!", theme: tenant.theme });
    } catch (error) {
        res.status(500).json({ message: "Error updating theme." });
    }
};
