import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner, Alert, ListGroup, Dropdown, ButtonGroup } from 'react-bootstrap';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Sidebar from '../../components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';
import BackButton from '../../components/BackButton';
import IssueMapDisplay from '../../components/IssueMapDisplay';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { admin, logoutAdmin } = useAdminAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const BACKEND_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

    const fetchIssueDetails = useCallback(async () => {
        if (!admin || !admin.token) {
            logoutAdmin();
            return;
        }
        setLoading(true);
        setLoadError('');
        try {
            const data = await AdminService.getIssueById(id, admin.token);
            setIssue(data);
        } catch (err) {
            setLoadError(err.message || 'Failed to load issue details');
        } finally {
            setLoading(false);
        }
    }, [id, admin, logoutAdmin]);

    useEffect(() => {
        fetchIssueDetails();
    }, [fetchIssueDetails]);

    const handleStatusUpdate = async (newStatus) => {
        if (!admin || !admin.token) return;
        const normalizedStatus = newStatus.trim().toUpperCase();
        setUpdateStatusLoading(true);
        setSuccessMessage('');
        setUpdateError('');
        try {
            await AdminService.updateIssueStatus(id, normalizedStatus, admin.token);
            setIssue(prev => ({ ...prev, status: normalizedStatus }));
            setSuccessMessage(`Status updated to ${normalizedStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setUpdateError(err.message || 'Failed to update status');
        } finally {
            setUpdateStatusLoading(false);
        }
    };

    const handleDownload = async (path, index) => {
        try {
            const response = await fetch(`${BACKEND_URL}${path}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const extension = path.split('.').pop();
            const fileName = `${issue.issue_id}-${index + 1}.${extension}`;

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download file');
        }
    };

    const isVideo = (path) => {
        const ext = path.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg'].includes(ext);
    };


    const formatDate = (dateString, withTime = false) => {
        if (!dateString) return 'N/A';
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            ...(withTime && { hour: '2-digit', minute: '2-digit' })
        };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    if (loading) {
        return (
            <div className="dashboard-wrapper">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <DashboardHeader onSearch={() => { }} />
                    <Container className="d-flex justify-content-center align-items-center flex-grow-1" style={{ minHeight: '80vh' }}>
                        <Spinner animation="border" variant="primary" />
                    </Container>
                </main>
            </div>
        );
    }

    if (loadError || !issue) {
        return (
            <div className="dashboard-wrapper">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <DashboardHeader onSearch={() => { }} />
                    <Container className="py-5">
                        <Alert variant="danger">{loadError || 'Issue not found'}</Alert>
                        <Button variant="primary" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </Container>
                </main>
            </div>
        );
    }

    const currentStatus = issue.status.toUpperCase();

    return (
        <div className="dashboard-wrapper">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <DashboardHeader onSearch={(q) => navigate(`/dashboard?q=${q}`)} />

                <div className="dashboard-content">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
                        <div className="flex-grow-1">
                            <BackButton />
                            <h1 className="fw-bold mb-1 mt-2">
                                {issue.title}
                            </h1>
                            <p className="text-muted mb-0">Issue ID: {issue.id}</p>
                        </div>
                        <div className="text-end d-flex flex-column align-items-start align-items-md-end gap-2 w-100 w-md-auto">
                            <span className={`issue-status-badge status-${currentStatus.toLowerCase()} px-4 py-2 fs-6`}>
                                {currentStatus}
                            </span>
                            <Dropdown as={ButtonGroup} size="sm" className="w-100 w-md-auto">
                                <Button variant="primary" disabled={updateStatusLoading} className="fw-bold shadow-sm w-100 w-md-auto py-2">
                                    {updateStatusLoading ? <Spinner size="sm" /> : <>Update Status</>}
                                </Button>
                                <Dropdown.Toggle split variant="primary" id="dropdown-status-detail" />
                                <Dropdown.Menu align="end" className="shadow border-0">
                                    <Dropdown.Item active={currentStatus === 'OPEN'} onClick={() => handleStatusUpdate('OPEN')}>
                                        <i className="bi bi-circle-fill text-primary me-2 small"></i>Open
                                    </Dropdown.Item>
                                    <Dropdown.Item active={currentStatus === 'PENDING'} onClick={() => handleStatusUpdate('PENDING')}>
                                        <i className="bi bi-circle-fill text-warning me-2 small"></i>Pending
                                    </Dropdown.Item>
                                    <Dropdown.Item active={currentStatus === 'RESOLVED'} onClick={() => handleStatusUpdate('RESOLVED')}>
                                        <i className="bi bi-circle-fill text-success me-2 small"></i>Resolved
                                    </Dropdown.Item>
                                    <Dropdown.Item active={currentStatus === 'REJECTED'} onClick={() => handleStatusUpdate('REJECTED')}>
                                        <i className="bi bi-circle-fill text-danger me-2 small"></i>Rejected
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>

                    {successMessage && <Alert variant="success" className="mb-4 shadow-sm py-2 border-0 border-start border-4 border-success">{successMessage}</Alert>}
                    {updateError && <Alert variant="danger" className="mb-4 shadow-sm py-2 border-0 border-start border-4 border-danger" onClose={() => setUpdateError('')} dismissible>{updateError}</Alert>}

                    <Row className="g-4">
                        <Col xs={12} lg={8}>
                            <Card className="settings-card mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                                <Card.Body className="p-4">
                                    <div className="mb-4">
                                        <h6 className="text-muted text-uppercase fw-bold small mb-3">Description</h6>
                                        <p style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text-main)' }}>
                                            {issue.description}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="text-muted text-uppercase fw-bold small mb-3">Issue Location</h6>
                                        <IssueMapDisplay
                                            lat={issue.latitude}
                                            lng={issue.longitude}
                                            address={issue.location}
                                        />
                                    </div>

                                    <Row className="mb-4 g-3">
                                        <Col md={12}>
                                            <div className="p-3 rounded-lg kpi-card kpi-open border-start border-4">
                                                <h6 className="text-muted text-uppercase fw-bold small mb-2">Date Reported</h6>
                                                <p className="mb-0 fw-semibold">
                                                    <i className="bi bi-calendar-event-fill text-primary me-2"></i>{formatDate(issue.created_at)}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>

                                    {issue.media_paths && issue.media_paths.length > 0 && (
                                        <div className="mt-4 pt-4 border-top">
                                            <h6 className="text-muted text-uppercase fw-bold small mb-4">Attached Media ({issue.media_paths.length})</h6>
                                            <Row className="g-3">
                                                {issue.media_paths.map((path, index) => (
                                                    <Col key={index} xs={12} sm={6}>
                                                        <Card className="h-100 border-0 shadow-sm overflow-hidden bg-dark" style={{ borderRadius: '12px' }}>
                                                            <div style={{ height: '280px' }} className="d-flex align-items-center justify-content-center">
                                                                {isVideo(path) ? (
                                                                    <video controls className="w-100 h-100" style={{ objectFit: 'contain' }}>
                                                                        <source src={`${BACKEND_URL}${path}`} />
                                                                    </video>
                                                                ) : (
                                                                    <img
                                                                        src={`${BACKEND_URL}${path}`}
                                                                        alt={`Issue media ${index + 1}`}
                                                                        className="w-100 h-100"
                                                                        style={{ objectFit: 'contain', cursor: 'zoom-in' }}
                                                                        onClick={() => window.open(`${BACKEND_URL}${path}`, '_blank')}
                                                                    />
                                                                )}
                                                            </div>
                                                            <Card.Footer className="border-0 d-flex justify-content-between align-items-center py-2 px-3 bg-white">
                                                                <small className="fw-bold text-muted">Item {index + 1}</small>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="rounded-pill px-3 py-1 fw-semibold"
                                                                    onClick={() => handleDownload(path, index)}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </Button>
                                                            </Card.Footer>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} lg={4}>
                            <Card className="settings-card mb-4 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                                <Card.Header className="bg-transparent fw-bold py-3 border-bottom text-uppercase small text-muted">Reporter Information</Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Full Name</small>
                                        <span className="fw-bold">{issue.full_name || 'Anonymous'}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Phone Number</small>
                                        <span>{issue.phone_number || 'N/A'}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Address</small>
                                        <span className="d-block">{issue.address || 'N/A'}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="py-3 px-4 bg-transparent">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>User Type</small>
                                        <span className="badge-pill bg-primary-light text-primary px-3 py-1 rounded-pill small fw-bold">
                                            {issue.user_type === 'Other' ? issue.user_type_custom : issue.user_type}
                                        </span>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>

                            <Card className="settings-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                                <Card.Header className="bg-transparent fw-bold py-3 border-bottom text-uppercase small text-muted">System Details</Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Reported On</small>
                                        <span>{formatDate(issue.created_at, true)}</span>
                                    </ListGroup.Item>
                                    {issue.resolved_at && (
                                        <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom">
                                            <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Resolved On</small>
                                            <span className="fw-bold text-success">{formatDate(issue.resolved_at, true)}</span>
                                        </ListGroup.Item>
                                    )}
                                    {issue.feedback && (
                                        <ListGroup.Item className="py-4 px-4 kpi-card kpi-open border-0 rounded-0">
                                            <small className="text-primary d-block text-uppercase fw-bold mb-2" style={{ fontSize: '0.6rem' }}>User Feedback</small>
                                            <p className="mb-2 italic" style={{ fontSize: '0.95rem' }}>"{issue.feedback}"</p>
                                            {issue.rating && (
                                                <div className="d-flex text-warning gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`bi bi-star${i < issue.rating ? '-fill' : ''}`}></i>
                                                    ))}
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </main>

            <style>
                {`
                    .rounded-lg { border-radius: 12px; }
                    .italic { font-style: italic; }
                    .backdrop-blur { backdrop-filter: blur(10px); }
                `}
            </style>
        </div>
    );
};

export default IssueDetails;

