import { User } from "./mongooseModels.js";

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

  const user = await User.create({
    username,
    password_hash: hashedPassword,
    full_name: fullName,
    phone_number: phoneNumber,
    address,
    user_type: userType,
    user_type_custom: userTypeCustom || null
  });

  return user.id;
};

export const findUserByUsername = async (username) => {
  const user = await User.findOne({ username });
  if (!user) return null;

  const userObj = user.toJSON();
  return {
    ...userObj,
    profile_completed: !!userObj.full_name
  };
};

export const findUserById = async (id) => {
  const user = await User.findById(id);
  return user ? user.toJSON() : null;
};

export const updateUser = async (id, userData) => {
  const {
    fullName,
    phoneNumber,
    address,
    userType,
    userTypeCustom
  } = userData;

  await User.findByIdAndUpdate(id, {
    full_name: fullName,
    phone_number: phoneNumber,
    address: address,
    user_type: userType,
    user_type_custom: userTypeCustom || null
  });
};
const userModel = {
  createUser,
  findUserByUsername,
  findUserById,
  updateUser
};

export default userModel;
