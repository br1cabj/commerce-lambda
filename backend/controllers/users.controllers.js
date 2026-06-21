import { transporter } from "../config/mailer.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { invalidateUserCache } from "../middleware/verifyToken.js";

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({
      tenantId: req.tenant._id,
      email: normalizedEmail,
    });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      tenantId: req.tenant._id,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    const userSaved = await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: userSaved._id,
        name: userSaved.name,
        email: userSaved.email,
        role: userSaved.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const userFound = await User.findOne({
      email: normalizedEmail,
      $or: [
        { tenantId: req.tenant._id },
        { tenantId: null, role: "super_admin" },
      ],
    });

    // Dummy hash to equalize timing (prevent enumeration)
    const dummyHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7GP93kvRov1gxNwq3hpGQCW";
    
    if (!userFound) {
      // Run dummy compare
      await bcrypt.compare(password, dummyHash);
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userFound.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const token = jwt.sign(
      {
        id: userFound._id,
        role: userFound.role,
        tenantId: userFound.tenantId,
        tokenVersion: userFound.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Welcome back!",
      token: token,
      user: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role,
        tenantId: userFound.tenantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userFound = await User.findOne({
      _id: req.user.id,
      tenantId: req.user.tenantId,
    });
    if (!userFound) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, userFound.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    userFound.password = hashedPassword;
    userFound.tokenVersion += 1;
    await userFound.save();
    invalidateUserCache(userFound._id);

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ message: "Server error updating password." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const userFound = await User.findOne({
      tenantId: req.tenant._id,
      email: normalizedEmail,
    });
    if (!userFound) {
      return res
        .status(200)
        .json({ message: "If an account exists, you will receive an email with instructions." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const resetToken = jwt.sign(
      { id: userFound._id, tenantId: userFound.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    transporter.sendMail({
      from: `"${escapeHtml(req.tenant.name)}" <${process.env.EMAIL_USER}>`,
      to: userFound.email,
      subject: "Password Reset Request",
      html: `
                <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                    <h2>Hello ${escapeHtml(userFound.name)}!</h2>
                    <p>We received a request to reset your password.</p>
                    <p>Click the button below to create a new password (this link expires in 15 minutes):</p>
                    <a href="${resetLink}" style="background-color: #fca311; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset my password</a>
                    <p style="font-size: 12px; color: #999;">If you didn't request this, ignore this email. Your account is safe.</p>
                </div>
            `,
    }).catch(err => console.error("Error sending recovery email asynchronously:", err.message));

    res
      .status(200)
      .json({ message: "If an account exists, you will receive an email with instructions." });
  } catch (error) {
    console.error("Error in forgotPassword:", error.message);
    res.status(500).json({ message: "Error sending recovery email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have at least 6 characters." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const userFound = await User.findOne({
      _id: verified.id,
      tenantId: verified.tenantId,
    });
    if (!userFound) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    userFound.password = hashedPassword;
    userFound.tokenVersion += 1;
    await userFound.save();
    invalidateUserCache(userFound._id);

    res
      .status(200)
      .json({ message: "Your password has been reset successfully!" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(400).json({
      message: "The link is invalid or has expired. Please request a new one.",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user.id,
      tenantId: req.user.tenantId,
    }).select("-password");

    if (!userFound) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(userFound);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Error loading profile." });
  }
};
