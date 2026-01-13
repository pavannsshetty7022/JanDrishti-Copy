import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Alert, Pagination
} from 'react-bootstrap';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { socket } from '../../socket';


import Sidebar from '../../components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';
import KpiCard from '../../components/KpiCard';
import IssueCard from '../../components/IssueCard';
import SkeletonLoader from '../../components/SkeletonLoader';

const AdminDashboard = () => {
  const { admin, logoutAdmin } = useAdminAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchIssues = useCallback(async () => {
    if (!admin || !admin.token) {
      setError('Admin authentication required. Please log in.');
      setLoading(false);
      logoutAdmin();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fetchedIssues = await AdminService.getAllIssues(admin.token, statusFilter, searchQuery);
      setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to load issues.');
      if (err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('expired')) {
        logoutAdmin();
      }
    } finally {
      setLoading(false);
    }
  }, [admin, logoutAdmin, statusFilter, searchQuery]);

  useEffect(() => {
    fetchIssues();

    socket.on('new_issue', (newIssue) => {
      setIssues(prevIssues => [newIssue, ...prevIssues]);
      setUpdateMessage(`New issue reported: ${newIssue.issue_id}`);
      setTimeout(() => setUpdateMessage(''), 5000);
    });

    socket.on('status_updated', (updatedIssue) => {
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === updatedIssue.id ? { ...issue, status: updatedIssue.status, resolved_at: updatedIssue.resolved_at } : issue
        )
      );
    });

    return () => {
      socket.off('new_issue');
      socket.off('status_updated');
    };
  }, [fetchIssues]);

  const counters = useMemo(() => {
    return {
      OPEN: issues.filter(i => i.status.toUpperCase() === 'OPEN').length,
      PENDING: issues.filter(i => i.status.toUpperCase() === 'PENDING').length,
      RESOLVED: issues.filter(i => i.status.toUpperCase() === 'RESOLVED').length,
      REJECTED: issues.filter(i => i.status.toUpperCase() === 'REJECTED').length
    };
  }, [issues]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = issues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(issues.length / itemsPerPage);

  const filterTabs = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <DashboardHeader onSearch={handleSearch} />

        <div className="dashboard-content">
          <header className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>
              <p className="text-muted">Manage and track community issues in real-time.</p>
            </div>
            <button className="btn btn-primary d-none d-md-flex align-items-center gap-2" onClick={fetchIssues} disabled={loading}>
              <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
              Refresh Data
            </button>
          </header>
          <div className="kpi-grid">
            <KpiCard
              title="Open Issues"
              value={counters.OPEN}
              icon="bi-envelope-exclamation-fill"
              status="OPEN"
            />
            <KpiCard
              title="Pending"
              value={counters.PENDING}
              icon="bi-hourglass-split"
              status="PENDING"
            />
            <KpiCard
              title="Resolved"
              value={counters.RESOLVED}
              icon="bi-check2-circle"
              status="RESOLVED"
            />
            <KpiCard
              title="Rejected"
              value={counters.REJECTED}
              icon="bi-x-circle-fill"
              status="REJECTED"
            />
          </div>

          <section className="mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 py-2">
              <div className="status-tabs">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.label}
                    className={`status-tab ${statusFilter === tab.value ? 'active' : ''}`}
                    onClick={() => setStatusFilter(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-muted small fw-medium">
                Showing {currentItems.length} of {issues.length} issues
              </div>
            </div>

            {updateMessage && <Alert variant="info" className="border-0 shadow-sm mb-4 py-3 small animate__animated animate__fadeIn">{updateMessage}</Alert>}
            {error && <Alert variant="danger" className="border-0 shadow-sm mb-4 py-3 small animate__animated animate__shakeX">{error}</Alert>}
            <div className="issue-grid">
              {loading && issues.length === 0 ? (

                [...Array(8)].map((_, i) => <SkeletonLoader key={i} />)
              ) : issues.length === 0 ? (
                <div className="col-12 text-center py-5 bg-white rounded-lg shadow-sm border">
                  <i className="bi bi-inbox display-1 text-muted opacity-25"></i>
                  <h3 className="mt-4 text-muted">No issues found</h3>
                  <p className="text-muted">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                currentItems.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="modern-pagination">
                  <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </section>
        </div>
      </main>

      <style>
        {`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .modern-pagination .page-link {
            border: none;
            color: var(--text-muted);
            font-weight: 600;
            padding: 0.5rem 1rem;
            margin: 0 0.2rem;
            border-radius: 8px;
            transition: var(--transition);
          }
          .modern-pagination .page-item.active .page-link {
            background-color: var(--primary-color);
            color: white;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
          }
          .modern-pagination .page-link:hover {
            background-color: var(--primary-light);
            color: var(--primary-color);
          }
          .backdrop-blur {
            backdrop-filter: blur(10px);
            z-index: 10;
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
