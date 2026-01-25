import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import adminModel from "../models/adminModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const testConnectivity = (req, res) => {
  res.json({ message: "Backend Admin API is reachable" });
};


export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const admin = await adminModel.findAdminByUsername(username);

    if (!admin) return res.status(400).json({ message: "Invalid admin credentials" });

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) return res.status(400).json({ message: "Invalid admin credentials" });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, id: admin.id, username: admin.username });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
};


export const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await adminModel.createAdmin(username, hashedPassword);

    res.json({ message: "Admin account created successfully", username });

  } catch (error) {
    console.error("Admin creation error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Admin username already exists" });
    }

    res.status(500).json({ message: "Server error creating admin" });
  }
};


export const checkAdmins = async (req, res) => {
  try {
    const admins = await adminModel.getAllAdmins();

    res.json({
      message: "Admin accounts found",
      count: admins.length,
      admins
    });

  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      message: "Error checking admins",
      error: error.message
    });
  }
};
