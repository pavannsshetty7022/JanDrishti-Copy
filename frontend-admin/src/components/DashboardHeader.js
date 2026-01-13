import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';

const DashboardHeader = ({ onSearch }) => {
    const { admin } = useAdminAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="dashboard-header">
            <div className="search-bar">
                <i className="bi bi-search"></i>
                <input
                    type="text"
                    placeholder="Search issues, users..."
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="header-actions">
                <button className="action-btn" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                </button>

                <button className="action-btn">
                    <i className="bi bi-bell-fill"></i>
                    <span className="badge-dot"></span>
                </button>

                <div className="user-profile">
                    <div className="user-avatar text-uppercase">
                        {admin?.username?.charAt(0) || 'A'}
                    </div>
                    <div className="user-info d-none d-md-flex">
                        <span className="user-name">{admin?.username || 'Admin'}</span>
                        <span className="user-role">Government Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
