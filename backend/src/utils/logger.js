/**
 * Minimal logger — wraps console.log/error with timestamps and
 * levels. Not a full library (Winston/Pino) since that's overkill
 * for an MCA project scope, but centralizing it here means it's
 * a one-line swap later if needed.
 */
function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info(message, meta = {}) {
    console.log(`[${timestamp()}] [INFO] ${message}`, Object.keys(meta).length ? meta : "");
  },
  warn(message, meta = {}) {
    console.warn(`[${timestamp()}] [WARN] ${message}`, Object.keys(meta).length ? meta : "");
  },
  error(message, meta = {}) {
    console.error(`[${timestamp()}] [ERROR] ${message}`, Object.keys(meta).length ? meta : "");
  },
  // Used by server.js to log each incoming request in dev mode
  request(req) {
    console.log(`[${timestamp()}] ${req.method} ${req.originalUrl}`);
  },
};