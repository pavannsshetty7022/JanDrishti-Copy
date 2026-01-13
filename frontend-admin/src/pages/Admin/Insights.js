import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';

const Insights = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="dashboard-wrapper">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <DashboardHeader onSearch={() => { }} />

                <div className="dashboard-content">
                    <header className="mb-4">
                        <h1 className="mb-1">Dashboard Insights</h1>
                        <p className="text-muted">Detailed analytics and performance metrics for JanDrishti.</p>
                    </header>

                    <div className="settings-card text-center py-5">
                        <i className="bi bi-bar-chart-line display-1 text-primary opacity-25"></i>
                        <h3 className="mt-4">Analytics Engine Connecting...</h3>
                        <p className="text-muted">Advanced insights and reporting features are currently being synchronized with the government data portal.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Insights;
