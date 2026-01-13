import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import IssueService from '../../services/issue.service';
import { socket } from '../../socket';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [animateContent, setAnimateContent] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!user || !user.token || !user.id) {
      toast.error('Authentication required. Please log in.');
      setLoading(false);
      logout();
      return;
    }
    setLoading(true);
    try {
      const fetchedIssues = await IssueService.getUserIssues(user.id, user.token);
      setIssues(fetchedIssues);
    } catch (err) {
      console.error('Failed to fetch user issues:', err);
      toast.error(err.message || 'Failed to load your issues.');
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    setAnimateContent(true);
    fetchIssues();

    socket.on('status_updated', (updatedIssue) => {
      if (updatedIssue.user_id === user?.id) {
        setIssues(prevIssues =>
          prevIssues.map(issue =>
            issue.id === updatedIssue.id ? { ...issue, status: updatedIssue.status, resolved_at: updatedIssue.resolved_at } : issue
          )
        );
        console.log('User dashboard received status update:', updatedIssue.issue_id, updatedIssue.status);
      }
    });

    return () => {
      socket.off('status_updated');
    };
  }, [fetchIssues, user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchIssues();
      return;
    }
    setLoading(true);
    try {
      const result = await IssueService.searchUserIssue(searchQuery, user.token);
      if (result) {
        setIssues([result]);
      } else {
        setIssues([]);
        toast.error('Issue not found.');
      }
    } catch (err) {
      console.error('Search issue error:', err);
      toast.error(err.message || 'Issue not found.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (issue) => {
    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIssueToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete || !user || !user.token) return;
    setLoading(true);
    try {
      await IssueService.deleteIssue(issueToDelete.id, user.token);
      setIssues(issues.filter(issue => issue.id !== issueToDelete.id));
      toast.success('Issue deleted successfully!');
    } catch (err) {
      console.error('Delete issue error:', err);
      toast.error(err.message || 'Failed to delete issue.');
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };

  if (loading && issues.length === 0) {
    return (
      <div className="d-flex flex-column">
        <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <h5 className="mt-3 text-primary">Loading issues...</h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="position-relative overflow-hidden">
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(40px)',
        animation: 'float2 10s ease-in-out infinite'
      }} />

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(40px); }
            100% { transform: translateY(0); }
          }
          @keyframes float2 {
            0% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>

      <Container className="flex-grow-1 py-4 px-3 px-md-4" style={{
        zIndex: 1,
        opacity: animateContent ? 1 : 0,
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out'
      }}>
        <BackButton />

        <div className="text-center mb-4 mt-2 px-3">
          <h2 className="display-6 fw-semibold mb-2" style={{ color: 'var(--primary-text)', fontSize: '1.75rem' }}>
            Your Reported Issues
          </h2>
          <p className="text-muted fs-6 fs-md-5 mx-auto text-container-md opacity-75">
            Manage your reports, track their resolution progress, and keep updated on community improvements.
          </p>
        </div>

        <div className="mx-auto mb-5 px-3 px-md-0" style={{ maxWidth: '600px' }}>
          <InputGroup
            className="shadow-sm overflow-hidden"
            style={{
              borderRadius: '8px',
              border: isSearchFocused
                ? '1px solid var(--primary-color)'
                : (isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'),
              boxShadow: isSearchFocused
                ? (isDarkMode ? '0 0 12px rgba(96, 165, 250, 0.2)' : '0 0 12px rgba(37, 99, 235, 0.1)')
                : 'none',
              height: '42px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <InputGroup.Text className={`${isDarkMode ? 'bg-dark border-0' : 'bg-white border-0'} py-0 ps-2 ps-md-3 transition-all`}
              style={{ color: isSearchFocused ? 'var(--primary-color)' : 'var(--text-muted)' }}
            >
              <i className={`bi bi-search fs-6 ${isSearchFocused ? 'scale-110' : ''}`} style={{ transition: 'all 0.3s ease' }}></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search Issue ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`${isDarkMode ? 'bg-dark text-light border-0' : 'bg-white border-0'} py-0 px-2 fs-6`}
              style={{ boxShadow: 'none', height: '40px', fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => { setSearchQuery(''); fetchIssues(); }}
                className="text-decoration-none text-muted px-1 px-md-2 py-0 d-flex align-items-center opacity-75 hover-opacity-100 transition-all"
                title="Clear Search"
                style={{ height: '40px', fontSize: '0.85rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.opacity = '0.75'; }}
              >
                <span className="d-none d-sm-inline">Clear</span>
                <i className="bi bi-x d-sm-none"></i>
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSearch}
              className="px-2 px-md-3 fw-bold d-flex align-items-center transition-bounce"
              disabled={loading}
              style={{
                height: '40px',
                borderTopLeftRadius: '0',
                borderBottomLeftRadius: '0',
                fontSize: '0.85rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <i className="bi bi-search d-sm-none"></i>
              <span className="d-none d-sm-inline">Search</span>
            </Button>
          </InputGroup>
        </div>



        {issues.length === 0 && !loading && (
          <div className="text-center py-4 my-4">
            <div className="mb-4 d-inline-block p-4 rounded-circle bg-primary bg-opacity-10">
              <i className="bi bi-clipboard-x display-1 text-primary opacity-50"></i>
            </div>
            <h3 className="fw-bold text-muted mb-2">No Issues Reported Yet</h3>
            <p className="text-muted mb-4 fs-5 mx-auto opacity-75" style={{ maxWidth: '500px' }}>
              It looks like you haven't reported any community issues. Be the change-maker today!
            </p>
            <Button as={Link} to="/report-issue" variant="primary" size="lg" className="px-5 py-3 fw-bold rounded-pill shadow-lg transition-bounce">
              <i className="bi bi-plus-circle me-2"></i>
              Report Your First Issue
            </Button>
          </div>
        )}

        <Row>
          {issues.map((issue, index) => (
            <Col xs={12} sm={6} md={4} key={issue.id} className="mb-4" data-aos="fade-up" data-aos-delay={index * 50}>
              <Card className="h-100 shadow-sm" style={{
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                border: 'none',
                borderRadius: '16px'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge rounded-pill px-3 py-2 ${issue.status === 'resolved' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' :
                      issue.status === 'pending' ? 'bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25' :
                        'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                      }`}>
                      {issue.status.toUpperCase()}
                    </span>
                    <small className="text-muted">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </small>
                  </div>

                  <Card.Title className="fw-bold mb-3 fs-4" style={{ color: 'var(--primary-text)' }}>
                    {issue.title}
                  </Card.Title>

                  <div className="flex-grow-1">
                    <p className="text-muted small mb-2 d-flex align-items-center">
                      <i className="bi bi-hash me-2"></i>
                      {issue.issue_id}
                    </p>
                    <p className="text-muted small mb-3 d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>
                      {issue.location}
                    </p>
                  </div>

                  {issue.resolved_at && (
                    <div className="alert alert-success py-2 px-3 small d-flex align-items-center mb-3">
                      <i className="bi bi-check2-circle me-2"></i>
                      Resolved: {new Date(issue.resolved_at).toLocaleDateString()}
                    </div>
                  )}
                  {issue.media_path && (
                    <div className="text-center mt-3">
                      <img
                        src={`http://localhost:5000${issue.media_path}`}
                        alt="Issue Media"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: '180px',
                          objectFit: 'cover',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-transparent border-0 pt-0">
                  {issue.status.toLowerCase() === 'open' ? (
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        as={Link}
                        to={`/edit-issue/${issue.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center fw-bold"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center fw-bold"
                        onClick={() => openDeleteDialog(issue)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <small className="text-muted fst-italic">
                      Cannot edit/delete {issue.status} issues.
                    </small>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
        <Modal
          show={deleteDialogOpen}
          onHide={closeDeleteDialog}
          centered
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold" style={{ color: 'var(--primary-color)' }}>
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-0">
              Are you sure you want to delete the issue "{issueToDelete?.title}" (ID: {issueToDelete?.issue_id})? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={closeDeleteDialog} className="fw-bold">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteIssue} className="fw-bold">
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default UserDashboard;