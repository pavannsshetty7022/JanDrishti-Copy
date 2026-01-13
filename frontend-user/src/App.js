import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import FlashScreen from './components/FlashScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import ProfileUpdate from './pages/User/ProfileUpdate';
import Profile from './pages/User/Profile';
import UserDashboard from './pages/User/UserDashboard';
import ReportIssue from './pages/User/ReportIssue';
import AboutJandrishti from './pages/AboutJandrishti';
import { Spinner } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';
import useDocumentTitle from './utils/useDocumentTitle';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AppContent = () => {
  useDocumentTitle();

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card-color)',
            color: 'var(--primary-text)',
            border: '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<FlashScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/profile-update" element={
            <PrivateRoute>
              <ProfileUpdate />
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />

          <Route path="/report-issue" element={
            <PrivateRoute>
              <ReportIssue />
            </PrivateRoute>
          } />

          <Route path="/edit-issue/:id" element={
            <PrivateRoute>
              <ReportIssue />
            </PrivateRoute>
          } />

          <Route path="/about" element={<AboutJandrishti />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
