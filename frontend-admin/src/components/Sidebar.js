import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo';
import { useAdminAuth } from '../context/AdminAuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { logoutAdmin } = useAdminAuth();

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Link to="/dashboard" className="sidebar-brand">
                    <Logo fontSize={collapsed ? '1.4rem' : '1.8rem'} />
                </Link>
                <button
                    className="d-none d-lg-block ms-auto border-0 bg-transparent text-muted"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ cursor: 'pointer' }}
                >
                    <i className={`bi ${collapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`}></i>
                </button>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <i className="bi bi-grid-fill"></i>
                    <span className="nav-text">Dashboard</span>
                </NavLink>

                <NavLink to="/dashboard/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-pie-chart-fill"></i>
                    <span className="nav-text">Dashboard Insights</span>
                </NavLink>

                <div className="mt-auto">
                    <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <i className="bi bi-gear-fill"></i>
                        <span className="nav-text">Settings</span>
                    </NavLink>

                    <button className="nav-item logout-item border-0 bg-transparent w-100 text-start" onClick={logoutAdmin}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
