import React from 'react';

const KpiCard = ({ title, value, icon, status }) => {
    const statusClass = status ? `kpi-${status.toLowerCase()}` : '';

    return (
        <div className={`kpi-card ${statusClass}`}>
            <div className="kpi-header">
                <div className="kpi-icon shadow-sm">
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{title}</div>
        </div>
    );
};

export default KpiCard;
