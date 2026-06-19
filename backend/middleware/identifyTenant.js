import Tenant from "../models/Tenant.js";

export const identifyTenant = async (req, res, next) => {
    let tenantSlug = null;

    if (req.headers["x-tenant-slug"]) {
        tenantSlug = req.headers["x-tenant-slug"].toLowerCase();
    } else if (req.headers.host) {
        const hostParts = req.headers.host.split(".");
        if (hostParts.length > 2) {
            tenantSlug = hostParts[0].toLowerCase();
        }
    } else if (req.query.tenant) {
        tenantSlug = req.query.tenant.toLowerCase();
    }

    if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant identification required. Use X-Tenant-Slug header, subdomain, or ?tenant= query param." });
    }

    try {
        const tenant = await Tenant.findOne({ slug: tenantSlug });

        if (!tenant) {
            return res.status(404).json({ message: "Store not found." });
        }

        if (!tenant.isActive) {
            return res.status(403).json({ message: "This store is currently inactive." });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        res.status(500).json({ message: "Error identifying store." });
    }
};
