import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  const { username, password, fullName, phoneNumber, address, userType, userTypeCustom } = req.body;

  if (!username || !password || !fullName || !phoneNumber || !address || !userType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser({
      username,
      hashedPassword,
      fullName,
      phoneNumber,
      address,
      userType,
      userTypeCustom
    });

    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      id: userId,
      username,
      profileCompleted: true
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }

    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const user = await userModel.findUserByUsername(username);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      id: user.id,
      username: user.username,
      profileCompleted: user.profile_completed
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


export const updateProfile = async (req, res) => {
  const { fullName, phoneNumber, address, userType, userTypeCustom } = req.body;
  const userId = req.user.id;

  if (!fullName || !phoneNumber || !address || !userType) {
    return res.status(400).json({ message: "All profile fields are required" });
  }

  if (userType === "Other" && !userTypeCustom) {
    return res.status(400).json({ message: "Custom user type required" });
  }

  try {
    await userModel.updateUser(userId, {
      fullName,
      phoneNumber,
      address,
      userType,
      userTypeCustom
    });

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};


export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findUserById(userId);

    if (!user) return res.status(404).json({ message: "Profile not found" });

    res.json(user);

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
