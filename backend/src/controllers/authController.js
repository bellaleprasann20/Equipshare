import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/environment.js";

/* =========================================================
   HELPERS
   ========================================================= */

function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   POST /api/auth/register
   ========================================================= */

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      companyName,
    } = req.body;

    const normalizedName =
      String(name || "").trim();

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedCompany =
      String(companyName || "").trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !normalizedCompany
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and company name are required.",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name is too long.",
      });
    }

    if (normalizedCompany.length > 150) {
      return res.status(400).json({
        message: "Company name is too long.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const existing = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (existing) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    /*
     * IMPORTANT:
     * Never accept "role" from public registration.
     *
     * The User schema should have "user" as its normal
     * default role. If your schema uses "manager" instead,
     * change this single value to "manager".
     */
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      companyName: normalizedCompany,
      role: "user",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    console.error("register:", err);

    /*
     * Mongoose duplicate-key protection.
     */
    if (err?.code === 11000) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
}

/* =========================================================
   POST /api/auth/login
   ========================================================= */

export async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token =
      generateToken(user._id);

    return res.json({
      token,
      user,
    });
  } catch (err) {
    console.error("login:", err);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
}

/* =========================================================
   GET /api/auth/me
   Auth middleware required
   ========================================================= */

export async function getCurrentUser(
  req,
  res
) {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      user,
    });
  } catch (err) {
    console.error(
      "getCurrentUser:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to fetch current user.",
    });
  }
}