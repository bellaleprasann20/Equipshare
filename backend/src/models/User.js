import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "manager",
      index: true,
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Normalize email before validation/save.
 */
userSchema.pre("validate", function (next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

/**
 * Hash password only when it has changed.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare plain password with stored hash.
 */
userSchema.methods.comparePassword = function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

/**
 * Never expose password hash.
 */
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);