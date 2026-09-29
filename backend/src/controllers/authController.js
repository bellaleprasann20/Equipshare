import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/environment.js";

function generateToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, role, companyName }
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: "Name, email, password, and company name are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, role, companyName });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // password has `select: false` in the schema — must explicitly request it here
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
}

/**
 * GET /api/auth/me
 * Requires authMiddleware — req.user is set there.
 */
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch current user.", error: err.message });
  }
}