/**
 * Centralized error handling. Two pieces:
 *   1. notFound — catches requests to routes that don't exist
 *      (mounted after all real routes in server.js)
 *   2. errorHandler — catches errors thrown/passed via next(err)
 *      anywhere in the app, formats a consistent JSON response
 *      (mounted last, after everything else, in server.js)
 *
 * Most controllers in this project handle their own try/catch
 * and respond directly (see equipmentController.js etc.) — this
 * is the safety net for anything that slips through, plus a
 * consistent 404 shape for unknown routes.
 */

export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  // If a controller already set a status code before throwing,
  // respect it; otherwise default to 500.
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(err.stack);

  res.status(statusCode).json({
    message: err.message || "Something went wrong on the server.",
    // Only include the stack trace outside production, so it
    // never leaks internals to end users in a real deployment
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
