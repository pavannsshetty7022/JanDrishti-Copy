import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Home = () => {

  const { user, loading } = useAuth();
  const navigate = useNavigate();



  const handleExploreDashboard = () => {
    if (loading) return;

    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const issueCategories = [
    {
      title: 'Road Potholes',
      description: 'Report damaged roads, potholes, and broken pavements affecting daily commute.',
      icon: 'bi-cone-striped',
      color: 'danger'
    },
    {
      title: 'Garbage & Sanitation',
      description: 'Report overflowing bins, illegal dumping, and sanitation issues.',
      icon: 'bi-trash',
      color: 'success'
    },
    {
      title: 'Streetlight Problems',
      description: 'Report non-functional streetlights and inadequate lighting in your area.',
      icon: 'bi-lightbulb',
      color: 'warning'
    },
    {
      title: 'Water Supply Issues',
      description: 'Report water leakage, shortage, or contamination problems.',
      icon: 'bi-droplet',
      color: 'info'
    },
    {
      title: 'Drainage & Sewage',
      description: 'Report blocked drains, open manholes, and sewage overflow.',
      icon: 'bi-water',
      color: 'primary'
    }
  ];

  const howItWorksSteps = [
    {
      number: '1',
      title: 'Report an Issue',
      description: 'Citizens report local problems with photo, location, and description.',
      icon: 'bi-megaphone'
    },
    {
      number: '2',
      title: 'Verification',
      description: 'Admin reviews and verifies the reported issue.',
      icon: 'bi-check-circle'
    },
    {
      number: '3',
      title: 'Action Taken',
      description: 'Concerned authorities take action on the issue.',
      icon: 'bi-tools'
    },
    {
      number: '4',
      title: 'Issue Resolved',
      description: 'Status updated and community informed.',
      icon: 'bi-patch-check'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Bangalore',
      feedback: 'Thanks to JanDrishti, our streetlight issue was resolved within 3 days. The platform made it so easy to track progress!'
    },
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      feedback: 'Reporting potholes has never been this easy. I love how transparent the entire process is.'
    },
    {
      name: 'Amit Patel',
      location: 'Delhi',
      feedback: 'Now we can track issue progress transparently. This platform truly empowers citizens to make a difference.'
    }
  ];

  return (
    <div className="home-page">
      <Carousel
        fade
        interval={2000}
        pause="hover"
        className="hero-carousel"
        style={{ maxHeight: '600px' }}
        data-aos="fade-in"
      >
        <Carousel.Item>
          <div
            className="d-flex align-items-center justify-content-center hero-carousel-item"
            style={{
              backgroundImage: 'url(/images/pothole-road.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }}
            ></div>
            <div className="text-center text-white px-3 px-md-4" style={{ position: 'relative', zIndex: 2 }}>
              <h1 className="display-4 display-md-3 fw-bold mb-2 mb-md-3">Pothole on Road</h1>
              <p className="lead fs-5 fs-md-3">Road damaged? Report it in seconds.</p>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div
            className="d-flex align-items-center justify-content-center hero-carousel-item"
            style={{
              backgroundImage: 'url(/images/broken-streetlight.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }}
            ></div>
            <div className="text-center text-white px-3 px-md-4" style={{ position: 'relative', zIndex: 2 }}>
              <h1 className="display-4 display-md-3 fw-bold mb-2 mb-md-3">Broken Streetlight / Open Drain</h1>
              <p className="lead fs-5 fs-md-3">Small issues matter. Raise them easily.</p>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div
            className="d-flex align-items-center justify-content-center hero-carousel-item"
            style={{
              backgroundImage: 'url(/images/citizen-reporting.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }}
            ></div>
            <div className="text-center text-white px-3 px-md-4" style={{ position: 'relative', zIndex: 2 }}>
              <h1 className="display-4 display-md-3 fw-bold mb-2 mb-md-3">Citizen Reporting via Mobile</h1>
              <p className="lead fs-5 fs-md-3">Citizens report. Authorities respond.</p>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div
            className="d-flex align-items-center justify-content-center hero-carousel-item"
            style={{
              backgroundImage: 'url(/images/resolved-clean-street.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }}
            ></div>
            <div className="text-center text-white px-3 px-md-4" style={{ position: 'relative', zIndex: 2 }}>
              <h1 className="display-4 display-md-3 fw-bold mb-2 mb-md-3">Resolved Issue / Clean Street</h1>
              <p className="lead fs-5 fs-md-3">Track progress. See real impact.</p>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
      <Container className="py-5" data-aos="fade-up">
        <div className="text-center">
          <Button
            onClick={handleExploreDashboard}
            variant="primary"
            size="lg"
            className="px-5 py-3 fw-bold rounded-pill shadow-lg"
            disabled={loading}
            style={{
              fontSize: '1.2rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <i className="bi bi-arrow-right-circle me-2"></i>
            {loading ? 'Loading...' : 'Explore Dashboard'}
          </Button>
        </div>
      </Container>
      <section className="issue-categories py-5" style={{ backgroundColor: 'var(--card-color)' }} data-aos="fade-up">
        <Container>
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="display-6 display-md-5 fw-bold mb-3 px-3" style={{ color: 'var(--primary-text)' }}>
              Common Issues You Can Report
            </h2>
            <p className="lead text-muted px-3">
              Select from various categories to report problems in your community
            </p>
          </div>

          <Row className="g-4">
            {issueCategories.map((category, index) => (
              <Col xs={12} md={6} lg={4} key={index}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    borderRadius: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                >
                  <Card.Body className="p-4 text-center">
                    <div
                      className={`bg-${category.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className={`${category.icon} display-5 text-${category.color}`}></i>
                    </div>
                    <Card.Title className="fw-bold fs-4 mb-3">{category.title}</Card.Title>
                    <Card.Text className="text-muted">{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      <section className="how-it-works py-5" data-aos="fade-up">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 display-md-5 fw-bold mb-3 px-3" style={{ color: 'var(--primary-text)' }}>
              How It Works
            </h2>
            <p className="lead text-muted px-3">
              Simple 4-step process to report and resolve community issues
            </p>
          </div>

          <Row className="g-4">
            {howItWorksSteps.map((step, index) => (
              <Col xs={12} md={6} lg={3} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="text-center h-100">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <i className={`${step.icon} display-4 text-primary`}></i>
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                      style={{ fontSize: '1.2rem', padding: '0.5rem 0.8rem' }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h4 className="fw-bold mb-3">{step.title}</h4>
                  <p className="text-muted">{step.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      <section className="about-us py-5" style={{ backgroundColor: 'var(--card-color)' }} data-aos="fade-up">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">
              <h2 className="display-6 display-md-5 fw-bold mb-4 px-3 px-md-0" style={{ color: 'var(--primary-text)' }}>
                About JanDrishti
              </h2>
              <p className="lead mb-4 px-3 px-md-0" style={{ lineHeight: '1.8' }}>
                JanDrishti is a community-driven platform that enables citizens to report local issues,
                track their resolution, and collaborate with authorities to improve neighborhoods.
              </p>
              <p className="text-muted mb-4 px-3 px-md-0" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                Our mission is to empower communities through transparency and accountability.
                We believe that every citizen has the right to a clean, safe, and well-maintained environment.
                JanDrishti bridges the gap between citizens and authorities, making civic engagement simple and effective.
              </p>
              <div className="d-flex flex-wrap gap-3 gap-md-4 px-3 px-md-0">
                <div>
                  <h3 className="display-6 fw-bold text-primary mb-0">1000+</h3>
                  <p className="text-muted small">Issues Resolved</p>
                </div>
                <div>
                  <h3 className="display-6 fw-bold text-primary mb-0">500+</h3>
                  <p className="text-muted small">Active Citizens</p>
                </div>
                <div>
                  <h3 className="display-6 fw-bold text-primary mb-0">50+</h3>
                  <p className="text-muted small">Communities</p>
                </div>
              </div>
            </Col>
            <Col lg={6} data-aos="zoom-in">
              <div
                className="rounded-4 shadow-lg about-image-container"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="text-center text-white p-3 p-md-5">
                  <i className="bi bi-people display-4 display-md-1 mb-2 mb-md-3"></i>
                  <h3 className="fw-bold fs-5 fs-md-3">Building Better Communities Together</h3>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="testimonials py-5" data-aos="fade-up">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 display-md-5 fw-bold mb-3 px-3" style={{ color: 'var(--primary-text)' }}>
              Community Voices
            </h2>
            <p className="lead text-muted px-3">
              Hear what our users have to say about JanDrishti
            </p>
          </div>

          <Row className="g-4">
            {testimonials.map((testimonial, index) => (
              <Col xs={12} md={6} lg={4} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <i className="bi bi-quote display-4 text-primary opacity-25"></i>
                    </div>
                    <Card.Text className="mb-4 fst-italic" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                      "{testimonial.feedback}"
                    </Card.Text>
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                        style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                        <small className="text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          {testimonial.location}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;