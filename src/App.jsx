import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, Home, CreditCard, HelpCircle, User, LogOut, DownloadCloud, Menu, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import './App.css';

import Dashboard from './screens/Dashboard';
import Login from './screens/Login';
import Courses from './screens/Courses';
import CourseDetails from './screens/CourseDetails';
import Classrooms from './screens/Classrooms';
import Fees from './screens/Fees';
import Profile from './screens/Profile';
import HelpCenter from './screens/HelpCenter';
import AboutUs from './screens/AboutUs';
import Footer from './components/Footer';
import BgParticlesComponent from './components/BgParticlesComponent';
import SplashScreen from './components/SplashScreen';
import NotificationBell from './components/NotificationBell';
import GlobalSearch from './components/GlobalSearch';

import { AuthContext, useAuth } from './AuthContext';

const API_BASE = 'http://localhost:8000';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ handleLogout, handleInstallApp, showInstallButton, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';

  const links = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Classrooms', path: '/classrooms', icon: <User size={20} /> },
    { name: 'Fees Tracker', path: '/fees', icon: <CreditCard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'About Us', path: '/about', icon: <HelpCircle size={20} /> },
    { name: 'Help Center', path: '/help', icon: <HelpCircle size={20} /> },
  ];

  return (
    <>
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/V-Wings_Logo_nobg.png" alt="VWings24x7 Logo" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
            <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>VWings24x7</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Student info in sidebar */}
        {user && (
          <div style={{ padding: '12px 16px', marginBottom: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.profile_photo ? (
              <img
                src={`${API_BASE}/${user.profile_photo}`}
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#FFFFFF' }}>{user.full_name}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.student_id}</p>
            </div>
          </div>
        )}

        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {showInstallButton && (
            <button className="btn-primary" onClick={handleInstallApp} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--magenta)' }}>
              <DownloadCloud size={20} />
              Install App
            </button>
          )}
          <button className="nav-item logout-button" onClick={handleLogout} style={{ marginTop: showInstallButton ? '8px' : '0' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ toggleMobileMenu }) => {
  const { user } = useAuth();

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Student';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';
  const photoUrl = user?.profile_photo ? `${API_BASE}/${user.profile_photo}` : null;

  return (
    <div className="topbar">
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Welcome back, {firstName}! ✈️</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Ready for your next flight lesson?</p>
      </div>
      <div className="topbar-header">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <GlobalSearch />
          <NotificationBell role="student" userId={user?.student_id || "student"} />

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--primary)' }} />
            ) : (
              <div className="avatar" style={{ cursor: 'pointer' }}>{initials}</div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── AppLayout ────────────────────────────────────────────────────────────────
const AppLayout = ({ children, handleLogout, handleInstallApp, showInstallButton }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <BgParticlesComponent />
      <Sidebar
        handleLogout={handleLogout}
        handleInstallApp={handleInstallApp}
        showInstallButton={showInstallButton}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="main-content">
        <Topbar toggleMobileMenu={() => setIsMobileMenuOpen(true)} />
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Rehydrate user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('vwings_student')); } catch { return null; }
  })();
  const [user, setUser] = useState(storedUser);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    const promptEvent = window.deferredPrompt || installPrompt;
    if (!promptEvent) {
      alert('App installation is not supported by your current browser. Please open in Chrome, Edge, or on your mobile device.');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      window.deferredPrompt = null;
      setInstallPrompt(null);
    }
  };

  const handleLogin = (studentData) => {
    sessionStorage.removeItem('hasSeenWelcome');
    setUser(studentData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hasSeenWelcome');
    localStorage.removeItem('vwings_student');
    setUser(null);
  };

  const isAuthenticated = !!user;

  if (showSplash) {
    return <AnimatePresence><SplashScreen onComplete={() => setShowSplash(false)} /></AnimatePresence>;
  }

  const layoutProps = { handleLogout, handleInstallApp, showInstallButton: !!installPrompt };

  return (
    <AuthContext.Provider value={{ user }}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />

        <Route path="/" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><Dashboard /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/courses" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><Courses /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/courses/:id" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><CourseDetails /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/classrooms" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><Classrooms /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/fees" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><Fees /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/profile" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><Profile /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/about" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><AboutUs /></AppLayout>
        ) : <Navigate to="/login" />} />

        <Route path="/help" element={isAuthenticated ? (
          <AppLayout {...layoutProps}><HelpCenter /></AppLayout>
        ) : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;

