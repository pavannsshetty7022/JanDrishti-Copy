import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('janDrishtiUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.token) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('janDrishtiUser');
          }
        }
      } catch (error) {
        console.error("Failed to load user from localStorage:", error);
        localStorage.removeItem('janDrishtiUser');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (userData) => {
    console.log('Login data received:', userData);
    localStorage.setItem('janDrishtiUser', JSON.stringify(userData));
    setUser(userData);

    console.log('Navigating to dashboard');
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('janDrishtiUser');
    setUser(null);
    window.location.replace('/home');
  };

  const updateProfileStatus = (isCompleted) => {
    setUser(prev => {
      const updatedUser = { ...prev, profileCompleted: isCompleted };
      localStorage.setItem('janDrishtiUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateUserData = (newData) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...newData };
      localStorage.setItem('janDrishtiUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfileStatus, updateUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
