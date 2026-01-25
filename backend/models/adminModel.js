import { Admin } from "./mongooseModels.js";

export const createAdmin = async (username, hashedPassword) => {
  await Admin.create({
    username,
    password_hash: hashedPassword
  });
};

export const findAdminByUsername = async (username) => {
  const admin = await Admin.findOne({ username });
  return admin ? admin.toJSON() : null;
};

export const getAllAdmins = async () => {
  const admins = await Admin.find().select("username createdAt");
  return admins.map(admin => {
    const obj = admin.toJSON();
    return {
      id: obj.id,
      username: obj.username,
      created_at: obj.createdAt
    };
  });
};
const adminModel = {
  createAdmin,
  findAdminByUsername,
  getAllAdmins
};

export default adminModel;
