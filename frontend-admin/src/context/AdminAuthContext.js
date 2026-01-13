
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdmin = () => {
      try {
        const storedAdmin = localStorage.getItem('janDrishtiAdmin');
        if (storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
          if (parsedAdmin.token) {
            setAdmin(parsedAdmin);
          } else {
            localStorage.removeItem('janDrishtiAdmin');
          }
        }
      } catch (error) {
        console.error("Failed to load admin from localStorage:", error);
        localStorage.removeItem('janDrishtiAdmin');
      } finally {
        setLoading(false);
      }
    };
    loadAdmin();
  }, []);

  const loginAdmin = (adminData) => {
    console.log('Admin login data received:', adminData); 
    localStorage.setItem('janDrishtiAdmin', JSON.stringify(adminData));
    setAdmin(adminData);
    console.log('Navigating to admin dashboard'); 
    navigate('/dashboard');
  };

  const logoutAdmin = () => {
    localStorage.removeItem('janDrishtiAdmin');
    setAdmin(null);
    navigate('/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loginAdmin, logoutAdmin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);