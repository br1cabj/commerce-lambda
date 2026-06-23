import Tenant from "../models/Tenant.js";
import Category from "../models/Category.js";

export const getHomeConfig = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const categories = await Category.find({
      tenantId: tenant._id,
      isActive: true,
    }).sort({ order: 1 });

    res.json({
      homeConfig: tenant.homeConfig || {},
      translations: tenant.translations || {},
      theme: tenant.theme || {},
      settings: {
        currency: tenant.settings.currency,
        language: tenant.settings.language,
        whatsappNumber: tenant.settings.whatsappNumber,
        email: tenant.settings.email,
        phone: tenant.settings.phone,
        address: tenant.settings.address,
        features: tenant.settings.features,
        paymentMethods: (tenant.settings.paymentMethods || [])
          .filter((m) => m.enabled)
          .map((m) => ({ type: m.type, enabled: m.enabled })),
        shippingMethods: (tenant.settings.shippingMethods || [])
          .filter((m) => m.enabled)
          .map((m) => ({ type: m.type, enabled: m.enabled, name: m.name })),
      },
      name: tenant.name,
      slug: tenant.slug,
      categories: categories || [],
    });
  } catch (error) {
    console.error("Error fetching home config:", error);
    res.status(500).json({ message: "Error fetching home configuration" });
  }
};

export const updateHomeConfig = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { homeConfig, translations } = req.body;

    if (homeConfig) {
      tenant.homeConfig = {
        ...tenant.homeConfig,
        ...homeConfig,
      };
    }

    if (translations) {
      tenant.translations = {
        ...tenant.translations,
        ...translations,
      };
    }

    await tenant.save();

    res.json({
      message: "Home configuration updated successfully",
      homeConfig: tenant.homeConfig,
      translations: tenant.translations,
    });
  } catch (error) {
    console.error("Error updating home config:", error);
    res.status(500).json({ message: "Error updating home configuration" });
  }
};

export const updateHeroSlides = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ message: "Slides must be an array" });
    }
    if (slides.length > 10) {
      return res.status(400).json({ message: "Maximum 10 slides allowed" });
    }

    tenant.homeConfig.heroSlides = slides;
    await tenant.save();

    res.json({
      message: "Hero slides updated successfully",
      heroSlides: tenant.homeConfig.heroSlides,
    });
  } catch (error) {
    console.error("Error updating hero slides:", error);
    res.status(500).json({ message: "Error updating hero slides" });
  }
};

export const updateBanners = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ message: "Banners must be an array" });
    }
    if (banners.length > 20) {
      return res.status(400).json({ message: "Maximum 20 banners allowed" });
    }

    tenant.homeConfig.banners = banners;
    await tenant.save();

    res.json({
      message: "Banners updated successfully",
      banners: tenant.homeConfig.banners,
    });
  } catch (error) {
    console.error("Error updating banners:", error);
    res.status(500).json({ message: "Error updating banners" });
  }
};

export const updateTrustSignals = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { trustSignals } = req.body;
    if (!Array.isArray(trustSignals)) {
      return res
        .status(400)
        .json({ message: "Trust signals must be an array" });
    }
    if (trustSignals.length > 20) {
      return res
        .status(400)
        .json({ message: "Maximum 20 trust signals allowed" });
    }

    tenant.homeConfig.trustSignals = trustSignals;
    await tenant.save();

    res.json({
      message: "Trust signals updated successfully",
      trustSignals: tenant.homeConfig.trustSignals,
    });
  } catch (error) {
    console.error("Error updating trust signals:", error);
    res.status(500).json({ message: "Error updating trust signals" });
  }
};

export const updateSections = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: "Sections must be an array" });
    }
    if (sections.length > 50) {
      return res.status(400).json({ message: "Maximum 50 sections allowed" });
    }

    tenant.homeConfig.sections = sections;
    await tenant.save();

    res.json({
      message: "Sections updated successfully",
      sections: tenant.homeConfig.sections,
    });
  } catch (error) {
    console.error("Error updating sections:", error);
    res.status(500).json({ message: "Error updating sections" });
  }
};

export const updateTranslations = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { translations } = req.body;
    tenant.translations = {
      ...tenant.translations,
      ...translations,
    };
    await tenant.save();

    res.json({
      message: "Translations updated successfully",
      translations: tenant.translations,
    });
  } catch (error) {
    console.error("Error updating translations:", error);
    res.status(500).json({ message: "Error updating translations" });
  }
};

export const updateAnnouncements = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const { announcements } = req.body;
    if (!Array.isArray(announcements)) {
      return res.status(400).json({ message: "Announcements must be an array" });
    }
    if (announcements.length > 10) {
      return res.status(400).json({ message: "Maximum 10 announcements allowed" });
    }

    tenant.homeConfig.announcements = announcements;
    await tenant.save();

    res.json({
      message: "Announcements updated successfully",
      announcements: tenant.homeConfig.announcements,
    });
  } catch (error) {
    console.error("Error updating announcements:", error);
    res.status(500).json({ message: "Error updating announcements" });
  }
};
