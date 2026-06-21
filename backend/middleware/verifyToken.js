import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userCache = new Map();
const CACHE_TTL = 60 * 1000;

const getCachedUser = (id) => {
  const entry = userCache.get(id);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  userCache.delete(id);
  return null;
};

const setCachedUser = (id, data) => {
  if (userCache.size > 1000) {
    const oldest = userCache.keys().next().value;
    userCache.delete(oldest);
  }
  userCache.set(id, { data, timestamp: Date.now() });
};

export const invalidateUserCache = (id) => {
  if (id) {
    userCache.delete(id.toString());
  }
};

export const verifyToken = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({
      message: "Access denied. You need to log in to perform this action.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let user = getCachedUser(verified.id);
    if (!user) {
      user = await User.findById(verified.id).lean();
      if (user) setCachedUser(verified.id, user);
    }
    
    if (!user || user.isDeleted) {
      return res.status(401).json({ message: "User not found or deleted." });
    }

    if (user.tokenVersion !== verified.tokenVersion) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    if (req.tenant && user.role !== "super_admin") {
      if (
        !user.tenantId ||
        user.tenantId.toString() !== req.tenant._id.toString()
      ) {
        return res.status(403).json({
          message: "Access denied. Token does not belong to this store.",
        });
      }
    }

    req.user = verified;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "The token is invalid or has expired." });
  }
};

export const isAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "administrador")
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. This action requires administrator privileges.",
    });
  }
};

export const verifyTenantOwnership = async (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res
      .status(403)
      .json({ message: "Access denied. Tenant context required." });
  }

  if (
    req.tenant &&
    req.user.tenantId.toString() !== req.tenant._id.toString()
  ) {
    return res.status(403).json({
      message: "Access denied. You do not have access to this store.",
    });
  }

  next();
};
