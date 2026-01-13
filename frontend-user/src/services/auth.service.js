import api from './api';

const register = async (profileData) => {
  return api.post('/auth/register', profileData);
};

const login = async (username, password) => {
  return api.post('/auth/login', { username, password });
};

const updateProfile = async (profileData, token) => {
  return api.post('/auth/profile', profileData, token);
};

const getProfile = async (token) => {
  return api.get('/auth/profile', token);
};

const AuthService = {
  register,
  login,
  updateProfile,
  getProfile
};

export default AuthService;