/**
 * Role-gating middleware — used after `protect` (authMiddleware.js)
 * on routes that only admins should access: creating/editing/
 * deleting equipment, viewing the fleet-wide admin dashboard,
 * generating reports.
 *
 * Must run AFTER protect, since it reads req.user.role, which
 * protect is what sets.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "This action requires admin access." });
  }
  next();
}

/**
 * Generic version, in case a future route needs to allow more
 * than one role (e.g. requireRole("admin", "manager")).
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this action." });
    }
    next();
  };
}
