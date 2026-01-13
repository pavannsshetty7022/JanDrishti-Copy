import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../../components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';

const Settings = () => {
    const { admin, logoutAdmin } = useAdminAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <DashboardHeader onSearch={() => { }} />

                <div className="dashboard-content">
                    <header className="mb-4">
                        <h1 className="mb-1">Settings</h1>
                        <p className="text-muted">Manage your account preferences and system configuration.</p>
                    </header>

                    {saveMessage && <Alert variant="success" className="border-0 shadow-sm mb-4">{saveMessage}</Alert>}

                    <Row>
                        <Col lg={8}>
                            <div className="settings-card mb-4" data-aos="fade-up">
                                <h3 className="settings-section-title">Profile Settings</h3>
                                <Form onSubmit={handleSave}>
                                    <Row>
                                        <Col md={6}>
                                            <div className="form-group">
                                                <label className="form-label">Username</label>
                                                <input type="text" className="form-control" defaultValue={admin?.username} />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="form-group">
                                                <label className="form-label">Email Address</label>
                                                <input type="email" className="form-control" defaultValue={admin?.email || 'admin@jandrishti.gov.in'} />
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input type="password" className="form-control" placeholder="Leave blank to keep current" />
                                    </div>
                                    <Button type="submit" variant="primary" className="px-4">Save Changes</Button>
                                </Form>
                            </div>
                            <div className="settings-card mb-4" data-aos="fade-up" data-aos-delay="100">
                                <h3 className="settings-section-title">Theme & Appearance</h3>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="fw-semibold mb-1">Interface Theme</div>
                                        <div className="text-muted small">Choose between light and dark modes.</div>
                                    </div>
                                    <div className="status-tabs" style={{ margin: 0 }}>
                                        <button
                                            className={`status-tab ${!isDarkMode ? 'active' : ''}`}
                                            onClick={() => !isDarkMode ? null : toggleTheme()}
                                        >
                                            Light
                                        </button>
                                        <button
                                            className={`status-tab ${isDarkMode ? 'active' : ''}`}
                                            onClick={() => isDarkMode ? null : toggleTheme()}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="settings-card" data-aos="fade-up" data-aos-delay="200">
                                <h3 className="settings-section-title">Notifications</h3>
                                <Form.Check
                                    type="switch"
                                    id="email-notif"
                                    label="Email notifications for new issues"
                                    defaultChecked
                                    className="mb-3"
                                />
                                <Form.Check
                                    type="switch"
                                    id="sms-notif"
                                    label="Desktop notifications"
                                    defaultChecked
                                    className="mb-3"
                                />
                            </div>
                        </Col>

                        <Col lg={4}>
                            <div className="settings-card bg-primary-light border-0 shadow-none mb-4" data-aos="fade-left">
                                <h3 className="settings-section-title border-primary border-opacity-25 text-primary">System Information</h3>
                                <div className="user-profile mb-3">
                                    <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                                        {admin?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{admin?.username}</span>
                                        <span className="user-role badge bg-primary text-white p-1" style={{ fontSize: '0.6rem' }}>Government Admin</span>
                                    </div>
                                </div>
                                <div className="text-muted small mb-2">
                                    <div className="d-flex justify-content-between py-1">
                                        <span>Last Login:</span>
                                        <span className="fw-medium text-main">Today, 09:42 AM</span>
                                    </div>
                                    <div className="d-flex justify-content-between py-1">
                                        <span>System Access:</span>
                                        <span className="fw-medium text-main text-success">Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card border-danger border-opacity-25" data-aos="fade-left" data-aos-delay="100">
                                <h3 className="settings-section-title text-danger border-danger border-opacity-10">Account Actions</h3>
                                <p className="text-muted small">Sign out of your account to terminate your current session.</p>
                                <Button variant="outline-danger" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={logoutAdmin}>
                                    <i className="bi bi-box-arrow-right"></i>
                                    Logout Session
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </main>
        </div>
    );
};

export default Settings;
