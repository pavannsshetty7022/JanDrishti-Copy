import React from 'react';
import { Link } from 'react-router-dom';

const IssueCard = ({ issue }) => {
    const statusColors = {
        OPEN: 'status-open',
        PENDING: 'status-pending',
        RESOLVED: 'status-resolved',
        REJECTED: 'status-rejected'
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="issue-card" data-aos="fade-up">
            <div className="issue-card-header">
                <span className={`issue-status-badge ${statusColors[issue.status.toUpperCase()]}`}>
                    {issue.status}
                </span>
                <span className="issue-id">ID: {issue.id}</span>
            </div>

            <h4 className="fw-bold">{issue.title}</h4>

            <div className="issue-card-info">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-fill opacity-50"></i>
                    <span>{issue.full_name || 'Anonymous'}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-event opacity-50"></i>
                    <span>{formatDate(issue.created_at)}</span>
                </div>
            </div>

            <div className="issue-card-footer">
                <Link to={`/dashboard/issue/${issue.id}`} className="view-btn">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default IssueCard;
