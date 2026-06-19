import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    const token = req.header("auth-token");

    if (!token) {
        return res.status(401).json({ message: "Access denied. You need to log in to perform this action." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(verified.id);
        if (!user || user.isDeleted) {
            return res.status(401).json({ message: "User not found or deleted." });
        }

        if (user.tokenVersion !== verified.tokenVersion) {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }

        if (req.tenant && user.role !== "super_admin") {
            if (!user.tenantId || user.tenantId.toString() !== req.tenant._id.toString()) {
                return res.status(403).json({ message: "Access denied. Token does not belong to this store." });
            }
        }

        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "The token is invalid or has expired." });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "administrador")) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. This action requires administrator privileges." });
    }
};

export const verifyTenantOwnership = async (req, res, next) => {
    if (!req.user || !req.user.tenantId) {
        return res.status(403).json({ message: "Access denied. Tenant context required." });
    }

    if (req.tenant && req.user.tenantId.toString() !== req.tenant._id.toString()) {
        return res.status(403).json({ message: "Access denied. You do not have access to this store." });
    }

    next();
};
