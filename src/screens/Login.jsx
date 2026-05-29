import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const studentData = await response.json();
        // Persist user in localStorage for session persistence
        localStorage.setItem('vwings_student', JSON.stringify(studentData));
        onLogin(studentData);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="glass-card auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-header">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', gap: '16px'
            }}
          >
            <img
              src="/assets/V-Wings_Logo_nobg.png"
              alt="VWings24x7 Logo"
              style={{ width: '90px', height: '90px', objectFit: 'contain' }}
            />
            <span style={{ color: 'var(--primary-yellow)', fontSize: '36px', fontWeight: '800', letterSpacing: '1px' }}>
              VWings24x7
            </span>
          </motion.div>
          <p>Student Portal Login</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5', fontSize: '0.875rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="student@vwings.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="input-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              disabled={loading}
              autoComplete="current-password"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(10%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center'
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                >
                  <Loader size={20} />
                </motion.div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In to Academy
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
