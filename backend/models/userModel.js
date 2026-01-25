import { pool } from "../config/db.js";

export const createUser = async (userData) => {
  const {
    username,
    hashedPassword,
    fullName,
    phoneNumber,
    address,
    userType,
    userTypeCustom
  } = userData;

  const [result] = await pool.execute(
    `INSERT INTO users 
     (username, password_hash, full_name, phone_number, address, user_type, user_type_custom)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, hashedPassword, fullName, phoneNumber, address, userType, userTypeCustom || null]
  );

  return result.insertId;
};

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(
    `SELECT 
      id, 
      password_hash, 
      username, 
      full_name IS NOT NULL AS profile_completed 
     FROM users 
     WHERE username = ?`,
    [username]
  );

  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT 
      username, 
      full_name, 
      phone_number, 
      address, 
      user_type, 
      user_type_custom 
     FROM users 
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

export const updateUser = async (id, userData) => {
  const {
    fullName,
    phoneNumber,
    address,
    userType,
    userTypeCustom
  } = userData;

  await pool.execute(
    `UPDATE users 
     SET full_name=?, phone_number=?, address=?, user_type=?, user_type_custom=? 
     WHERE id=?`,
    [fullName, phoneNumber, address, userType, userTypeCustom || null, id]
  );
};
