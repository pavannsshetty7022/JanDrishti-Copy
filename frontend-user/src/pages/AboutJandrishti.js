import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const AboutJandrishti = () => {
    const { isDarkMode } = useTheme();
    return (
        <Container className={`py-5 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="mb-4">About JanDrishti</h1>
                    <p>
                        JanDrishti is a community‑driven platform that empowers citizens to report local issues and track their resolution. Our mission is to foster transparent governance and active community engagement.
                    </p>
                    <p>
                        Use this portal to raise concerns about infrastructure, sanitation, safety, and more. Together we build a better, more responsive environment.
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default AboutJandrishti;
