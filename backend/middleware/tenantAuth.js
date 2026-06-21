export const isAdminForTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const isAdminRole =
    req.user.role === "admin" || req.user.role === "administrador";
  const hasSuperAdminRole = req.user.role === "super_admin";

  if (!isAdminRole && !hasSuperAdminRole) {
    return res
      .status(403)
      .json({ message: "Access denied. Administrator privileges required." });
  }

  if (
    req.tenant &&
    req.user.tenantId &&
    req.user.tenantId.toString() !== req.tenant._id.toString()
  ) {
    return res.status(403).json({
      message: "Access denied. You do not have access to this store.",
    });
  }

  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Access denied. Platform administrator privileges required.",
    });
  }
  next();
};
