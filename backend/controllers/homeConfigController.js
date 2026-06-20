import Tenant from "../models/Tenant.js";

export const getHomeConfig = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      homeConfig: tenant.homeConfig || {},
      translations: tenant.translations || {},
      theme: tenant.theme || {},
      settings: tenant.settings || {},
      name: tenant.name,
      slug: tenant.slug,
      categories: tenant.categories || [],
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
