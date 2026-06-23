import Tenant from "../models/Tenant.js";
import Category from "../models/Category.js";
import jwt from "jsonwebtoken";

export const getStoreConfig = async (req, res) => {
  try {
    const tenant = req.tenant;

    const categories = await Category.find({
      tenantId: tenant._id,
      isActive: true,
    }).sort({ order: 1 });

    // Check if the request is from an authenticated admin of this tenant
    let isAdminUser = false;
    const token = req.header("auth-token");
    if (token && process.env.JWT_SECRET) {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Match user's tenant or check super_admin
        const isUserAdminRole = verified.role === "admin" || verified.role === "administrador";
        const isSuperAdmin = verified.role === "super_admin";
        
        if (isSuperAdmin || (isUserAdminRole && verified.tenantId && verified.tenantId.toString() === tenant._id.toString())) {
          isAdminUser = true;
        }
      } catch (err) {
        // Silent catch: if invalid token, treat as public storefront request
      }
    }

    res.json({
      name: tenant.name,
      slug: tenant.slug,
      theme: tenant.theme,
      homeConfig: tenant.homeConfig || {},
      settings: {
        currency: tenant.settings.currency,
        language: tenant.settings.language,
        whatsappNumber: tenant.settings.whatsappNumber,
        email: tenant.settings.email,
        phone: tenant.settings.phone,
        address: tenant.settings.address,
        openingHours: tenant.settings.openingHours,
        paymentMethods: (tenant.settings.paymentMethods || [])
          .filter((m) => isAdminUser || m.enabled)
          .map((m) => {
            if (isAdminUser) {
              return { type: m.type, enabled: m.enabled, config: m.config || {} };
            }
            return { type: m.type, enabled: m.enabled };
          }),
        shippingMethods: (tenant.settings.shippingMethods || [])
          .filter((m) => isAdminUser || m.enabled)
          .map((m) => {
            if (isAdminUser) {
              return { type: m.type, enabled: m.enabled, name: m.name, config: m.config || {} };
            }
            return { type: m.type, enabled: m.enabled, name: m.name };
          }),
        features: tenant.settings.features,
        footer: tenant.settings.footer || {},
      },
      categories,
    });
  } catch (error) {
    console.error("Error loading store configuration:", error.message);
    res.status(500).json({ message: "Error loading store configuration." });
  }
};

export const updateStoreConfig = async (req, res) => {
  try {
    const { settings, homeConfig } = req.body;

    const tenant = await Tenant.findById(req.tenant._id);
    if (!tenant) return res.status(404).json({ message: "Store not found." });

    if (settings) {
      if (settings.currency) tenant.settings.currency = settings.currency;
      if (settings.language) tenant.settings.language = settings.language;
      if (settings.whatsappNumber !== undefined)
        tenant.settings.whatsappNumber = settings.whatsappNumber;
      if (settings.email !== undefined) tenant.settings.email = settings.email;
      if (settings.phone !== undefined) tenant.settings.phone = settings.phone;
      if (settings.address !== undefined)
        tenant.settings.address = settings.address;
      if (settings.openingHours !== undefined)
        tenant.settings.openingHours = settings.openingHours;
      if (settings.paymentMethods)
        tenant.settings.paymentMethods = settings.paymentMethods;
      if (settings.shippingMethods)
        tenant.settings.shippingMethods = settings.shippingMethods;
      if (settings.features)
        tenant.settings.features = {
          ...tenant.settings.features,
          ...settings.features,
        };
      if (settings.footer) {
        if (settings.footer.preset !== undefined) tenant.settings.footer.preset = settings.footer.preset;
        if (settings.footer.bgColorMode !== undefined) tenant.settings.footer.bgColorMode = settings.footer.bgColorMode;
        if (settings.footer.description !== undefined) tenant.settings.footer.description = settings.footer.description;
        if (settings.footer.showSocials !== undefined) tenant.settings.footer.showSocials = settings.footer.showSocials;
        if (settings.footer.showPaymentMethods !== undefined) tenant.settings.footer.showPaymentMethods = settings.footer.showPaymentMethods;
        if (settings.footer.showContactInfo !== undefined) tenant.settings.footer.showContactInfo = settings.footer.showContactInfo;
        if (settings.footer.showNewsletter !== undefined) tenant.settings.footer.showNewsletter = settings.footer.showNewsletter;
        if (settings.footer.socialLinks !== undefined) tenant.settings.footer.socialLinks = settings.footer.socialLinks;
        if (settings.footer.customLinks !== undefined) tenant.settings.footer.customLinks = settings.footer.customLinks;
        if (settings.footer.termsOfService !== undefined) tenant.settings.footer.termsOfService = settings.footer.termsOfService;
        if (settings.footer.privacyPolicy !== undefined) tenant.settings.footer.privacyPolicy = settings.footer.privacyPolicy;
        if (settings.footer.featuredCategories !== undefined) tenant.settings.footer.featuredCategories = settings.footer.featuredCategories;
      }
    }

    if (homeConfig) {
      if (homeConfig.defaultLanguage)
        tenant.homeConfig.defaultLanguage = homeConfig.defaultLanguage;
      if (homeConfig.supportedLanguages)
        tenant.homeConfig.supportedLanguages = homeConfig.supportedLanguages;
      if (homeConfig.faqItems !== undefined)
        tenant.homeConfig.faqItems = homeConfig.faqItems;
      if (homeConfig.announcements !== undefined)
        tenant.homeConfig.announcements = homeConfig.announcements;
    }

    await tenant.save();

    res.json({ message: "Store configuration updated!" });
  } catch (error) {
    console.error("Error updating store configuration:", error.message);
    res.status(500).json({ message: "Error updating store configuration." });
  }
};

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

export const updateTheme = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenant._id);
    if (!tenant) return res.status(404).json({ message: "Store not found." });

    let themeData = req.body.theme || req.body;
    if (typeof themeData === "string") {
      try {
        themeData = JSON.parse(themeData);
      } catch (e) {}
    }

    if (themeData) {
      if (themeData.primaryColor)
        tenant.theme.primaryColor = themeData.primaryColor;
      if (themeData.secondaryColor)
        tenant.theme.secondaryColor = themeData.secondaryColor;
      if (themeData.accentColor)
        tenant.theme.accentColor = themeData.accentColor;
      if (themeData.logoUrl !== undefined)
        tenant.theme.logoUrl = themeData.logoUrl;
      if (themeData.heroImageUrl !== undefined)
        tenant.theme.heroImageUrl = themeData.heroImageUrl;
      if (themeData.heroTitle !== undefined)
        tenant.theme.heroTitle = themeData.heroTitle;
      if (themeData.heroSubtitle !== undefined)
        tenant.theme.heroSubtitle = themeData.heroSubtitle;
      if (themeData.fontFamily) tenant.theme.fontFamily = themeData.fontFamily;
    }

    if (req.files) {
      if (req.files.logo) {
        let logoFile = req.files.logo;
        if (Array.isArray(logoFile)) logoFile = logoFile[0];
        const validation = validateImageFile(logoFile);
        if (validation.valid) {
          const result = await cloudinary.uploader.upload(
            logoFile.tempFilePath,
            {
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
          );
          tenant.theme.logoUrl = result.secure_url;
          try {
            await fs.unlink(logoFile.tempFilePath);
          } catch (e) {}
        } else {
          try {
            await fs.unlink(logoFile.tempFilePath);
          } catch (e) {}
          return res.status(400).json({ message: validation.error });
        }
      }

      if (req.files.heroImage) {
        let heroFile = req.files.heroImage;
        if (Array.isArray(heroFile)) heroFile = heroFile[0];
        const validation = validateImageFile(heroFile);
        if (validation.valid) {
          const result = await cloudinary.uploader.upload(
            heroFile.tempFilePath,
            {
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
          );
          tenant.theme.heroImageUrl = result.secure_url;
          try {
            await fs.unlink(heroFile.tempFilePath);
          } catch (e) {}
        } else {
          try {
            await fs.unlink(heroFile.tempFilePath);
          } catch (e) {}
          return res.status(400).json({ message: validation.error });
        }
      }
    }

    await tenant.save();

    res.json({ message: "Theme updated!", theme: tenant.theme });
  } catch (error) {
    if (req.files) {
      if (req.files.logo) {
        let f = Array.isArray(req.files.logo)
          ? req.files.logo[0]
          : req.files.logo;
        try {
          await fs.unlink(f.tempFilePath);
        } catch (e) {}
      }
      if (req.files.heroImage) {
        let f = Array.isArray(req.files.heroImage)
          ? req.files.heroImage[0]
          : req.files.heroImage;
        try {
          await fs.unlink(f.tempFilePath);
        } catch (e) {}
      }
    }
    console.error("Error updating theme:", error.message);
    res.status(500).json({ message: "Error updating theme." });
  }
};
