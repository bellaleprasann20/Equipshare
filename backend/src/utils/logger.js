/**
 * Minimal application logger.
 *
 * Keeps logging centralized without adding Winston/Pino.
 * Easy to replace with a proper logging library later.
 */

function timestamp() {
  return new Date().toISOString();
}

function formatMeta(meta) {
  if (!meta || typeof meta !== "object" || Object.keys(meta).length === 0) {
    return "";
  }

  return meta;
}

export const logger = {
  info(message, meta = {}) {
    console.log(
      `[${timestamp()}] [INFO] ${message}`,
      formatMeta(meta)
    );
  },

  warn(message, meta = {}) {
    console.warn(
      `[${timestamp()}] [WARN] ${message}`,
      formatMeta(meta)
    );
  },

  error(message, meta = {}) {
    console.error(
      `[${timestamp()}] [ERROR] ${message}`,
      formatMeta(meta)
    );
  },

  /**
   * Request logger.
   * Used by server.js in development.
   */
  request(req) {
    console.log(
      `[${timestamp()}] ${req.method} ${req.originalUrl}`
    );
  },
};