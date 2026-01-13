import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import IssueService from '../../services/issue.service';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import LocationPicker from '../../components/LocationPicker';
import toast from 'react-hot-toast';

const issueOptions = [
  'Road potholes', 'Broken streetlights', 'Water supply leakage or shortage',
  'Open manholes', 'Damaged footpaths', 'Overflowing garbage bins',
  'Non-functioning traffic signals', 'Power outages',
  'Broken public benches / park equipment', 'Non-functional public toilets',
  'Inadequate street lighting', 'Tree fallen / blocking pathway',
  'Uncollected garbage', 'Illegal garbage dumping', 'Drainage blockage',
  'Waterlogging during rains', 'Mosquito breeding spots',
  'Graffiti or wall defacement', 'Lack of public dustbins',
  'Smoke or air pollution', 'Stray animal issues (dogs, monkeys, etc.)',
  'Loud noise or sound pollution', 'Suspicious activity',
  'Other'
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [dateOfOccurrence, setDateOfOccurrence] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);

    if (id) {
      setIsEditing(true);
      setLoading(true);
      const fetchIssueForEdit = async () => {
        try {
          const userIssues = await IssueService.getUserIssues(user.id, user.token);
          const issueToEdit = userIssues.find(i => String(i.id) === id);

          if (issueToEdit) {
            if (issueOptions.includes(issueToEdit.title)) {
              setTitle(issueToEdit.title);
            } else {
              setTitle('Other');
              setCustomTitle(issueToEdit.title);
            }
            setDescription(issueToEdit.description);
            setLocation(issueToEdit.location);
            setLatitude(issueToEdit.latitude);
            setLongitude(issueToEdit.longitude);
            setDateOfOccurrence(issueToEdit.date_of_occurrence.split('T')[0]);

            const mediaPaths = Array.isArray(issueToEdit.media_paths)
              ? issueToEdit.media_paths
              : (issueToEdit.media_paths ? issueToEdit.media_paths.split(',') : []);

            const formattedExistingMedia = mediaPaths.map(path => ({
              path: path.trim(),
              url: `http://localhost:5000${path.trim()}`,
              type: path.trim().match(/\.(mp4|mov|avi|wmv|flv)$/i) ? 'video' : 'image'
            }));

            setExistingMedia(formattedExistingMedia);
            setPreviewMedia(formattedExistingMedia.map(m => ({ url: m.url, type: m.type })));
          } else {
            toast.error('Issue not found for editing.');
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Failed to load issue for editing:', err);
          toast.error(err.message || 'Error loading issue for editing.');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchIssueForEdit();
    }
  }, [id, user, navigate]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newMediaFiles = [...mediaFiles];
    const newPreviewMedia = [...previewMedia];

    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other');
      if (fileType !== 'other') {
        newMediaFiles.push(file);
        newPreviewMedia.push({
          url: URL.createObjectURL(file),
          type: fileType,
          name: file.name,
          isNew: true
        });
      }
    });

    setMediaFiles(newMediaFiles);
    setPreviewMedia(newPreviewMedia);
    event.target.value = null;
  };

  const handleRemoveMedia = (indexToRemove, isNewFile = true) => {
    if (isNewFile) {
      setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
      setPreviewMedia(prev => prev.filter((_, index) => index !== indexToRemove));
    } else {
      setExistingMedia(prev => prev.filter((_, index) => index !== indexToRemove));
      setPreviewMedia(prev => prev.filter((item, index) => {
        const originalIndex = prev.findIndex(p => p.url === item.url && !p.isNew);
        return originalIndex !== indexToRemove;
      }));
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!user || !user.token) {
      toast.error('You must be logged in to report/edit an issue.');
      setLoading(false);
      return;
    }

    const finalTitle = title === 'Other' ? customTitle : title;

    if (!finalTitle || !description || !location || !dateOfOccurrence) {
      toast.error('All required fields must be filled.');
      setLoading(false);
      return;
    }

    const issueData = {
      title: finalTitle,
      description,
      location,
      latitude,
      longitude,
      dateOfOccurrence,
    };

    try {
      if (isEditing) {
        await IssueService.editIssue(id, issueData, mediaFiles, existingMedia.map(m => m.path), user.token);
        toast.success('Issue updated successfully!');
      } else {
        await IssueService.reportIssue(issueData, mediaFiles, user.token);
        toast.success('Issue reported successfully!');
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Issue submission error:', error);
      toast.error(error.message || `Something went wrong during issue ${isEditing ? 'update' : 'reporting'}.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="d-flex flex-column">
        <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <h5 className="mt-3 text-primary">Loading issue for edit...</h5>
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

        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <Card className="shadow-lg border-0" style={{
              backgroundColor: 'var(--card-color)',
              borderRadius: '16px'
            }}>
              <Card.Body className="p-3 p-md-4 p-lg-5">
                <div className="text-center mb-4">
                  <i className="bi bi-flag-fill display-4 text-primary mb-3"></i>
                  <h2 className="fw-bold text-primary">
                    {isEditing ? 'Edit Issue' : 'Report New Issue'}
                  </h2>
                  <p className="text-muted">Help us improve our community</p>
                </div>

                <Form onSubmit={handleSubmit}>

                  <Form.Group className="mb-3">
                    <Form.Label>Name of Issue (Title)</Form.Label>
                    <Form.Select
                      id="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (e.target.value === 'Other') {
                          setCustomTitle('');
                        }
                      }}
                      required
                    >
                      <option value="">Select an issue type</option>
                      {issueOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {title === 'Other' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Specify Other Issue</Form.Label>
                      <Form.Control
                        type="text"
                        id="customTitle"
                        placeholder="Please specify the issue"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      id="description"
                      placeholder="Describe the issue in detail"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Issue Location</Form.Label>
                    <LocationPicker
                      value={{ lat: latitude, lng: longitude, address: location }}
                      onChange={(val) => {
                        setLocation(val.address);
                        setLatitude(val.lat);
                        setLongitude(val.lng);
                      }}
                      isEditing={isEditing}
                    />
                    <Form.Control
                      type="text"
                      id="location"
                      placeholder="Selected address will appear here"
                      value={location}
                      readOnly
                      disabled
                      required
                      className="bg-light border-0 small mt-2"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date of Occurrence</Form.Label>
                    <Form.Control
                      type="date"
                      id="dateOfOccurrence"
                      value={dateOfOccurrence}
                      onChange={(e) => setDateOfOccurrence(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Upload Media (Images/Videos)</Form.Label>
                    <div>
                      <Form.Control
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="d-none"
                        id="media-upload"
                      />
                      <label
                        htmlFor="media-upload"
                        className="btn btn-outline-primary d-flex align-items-center fw-bold"
                        style={{ borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <i className="bi bi-camera me-2"></i>
                        Choose Files
                      </label>
                    </div>

                    {previewMedia.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 gap-md-3 mt-3">
                        {previewMedia.map((media, index) => (
                          <div key={media.url} className="position-relative media-preview-item" style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}>
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={`Media Preview ${index}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            ) : (
                              <video
                                src={media.url}
                                controls
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            )}
                            <Button
                              variant="light"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle"
                              style={{
                                width: '30px',
                                height: '30px',
                                padding: '0',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)'
                              }}
                              onClick={() => handleRemoveMedia(index, media.isNew)}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                            {media.name && !media.isNew && (
                              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white text-center p-1 small">
                                {media.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {isEditing ? 'Updating Issue...' : 'Submitting Issue...'}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        {isEditing ? 'Update Issue' : 'Submit Issue'}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    size="lg"
                    className="w-100 fw-bold"
                    onClick={() => navigate('/dashboard')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReportIssue;