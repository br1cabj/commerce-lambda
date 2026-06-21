import Tenant from "../models/Tenant.js";

const tenantCache = new Map();
const CACHE_TTL = 60 * 1000;

const getCachedTenant = (key) => {
  const entry = tenantCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  tenantCache.delete(key);
  return null;
};

const setCachedTenant = (key, data) => {
  if (tenantCache.size > 500) {
    const oldest = tenantCache.keys().next().value;
    tenantCache.delete(oldest);
  }
  tenantCache.set(key, { data, timestamp: Date.now() });
};

export const identifyTenant = async (req, res, next) => {
  let tenantSlug = null;
  let customDomain = null;

  if (req.headers["x-tenant-domain"]) {
    customDomain = req.headers["x-tenant-domain"].toLowerCase();
  }

  if (req.headers["x-tenant-slug"]) {
    tenantSlug = req.headers["x-tenant-slug"].toLowerCase();
  } else if (req.headers.host) {
    const hostParts = req.headers.host.split(".");
    if (hostParts.length > 2) {
      tenantSlug = hostParts[0].toLowerCase();
    } else {
      customDomain = req.headers.host.split(":")[0].toLowerCase();
    }
  } else if (req.query.tenant) {
    tenantSlug = req.query.tenant.toLowerCase();
  }

  if (!tenantSlug && !customDomain) {
    return res.status(400).json({
      message:
        "Tenant identification required. Use X-Tenant-Slug, Custom Domain, or subdomain.",
    });
  }

  try {
    let tenant = null;

    if (customDomain && !customDomain.includes("localhost") && !customDomain.includes("127.0.0.1")) {
      tenant = getCachedTenant(`domain:${customDomain}`);
      if (!tenant) {
        tenant = await Tenant.findOne({ customDomain });
        if (tenant) setCachedTenant(`domain:${customDomain}`, tenant);
      }
    }

    if (!tenant && tenantSlug) {
      tenant = getCachedTenant(`slug:${tenantSlug}`);
      if (!tenant) {
        tenant = await Tenant.findOne({ slug: tenantSlug });
        if (tenant) setCachedTenant(`slug:${tenantSlug}`, tenant);
      }
    }

    if (!tenant) {
      return res.status(404).json({ message: "Store not found." });
    }

    if (!tenant.isActive) {
      return res
        .status(403)
        .json({ message: "This store is currently inactive." });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    console.error("Error identifying tenant:", error.message);
    res.status(500).json({ message: "Error identifying store." });
  }
};
