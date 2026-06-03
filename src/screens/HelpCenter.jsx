import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Mail, MapPin, Phone, User, Smartphone, MessageSquare, Send, CheckCircle } from 'lucide-react';

const HelpCenter = () => {
  const [formData, setFormData] = useState({ name: '', phone_no: '', email: '', problem_description: '' });
  const [status, setStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('http://localhost:8000/api/helpcenter/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone_no: '', email: '', problem_description: '' });
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const socialLinks = [
    { icon: <Globe size={20} />, label: "Website", href: "#" },
    { icon: <Mail size={20} />, label: "Email", href: "#" },
    { icon: <MapPin size={20} />, label: "Location", href: "#" },
    { icon: <Phone size={20} />, label: "Call", href: "#" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}
    >
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '150px', background: 'var(--magenta)', filter: 'blur(80px)', opacity: '0.2', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{ margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '24px', width: 'fit-content', boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)' }}
          >
            <img src="/assets/V-Wings_Logo_nobg.png" alt="VWings24x7 Logo" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain' }} />
          </motion.div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            <span className="text-gradient">Admin Support Center</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Get in touch with the VWings24x7 administration team for any queries or support requests.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {socialLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                whileHover={{ scale: 1.05, backgroundColor: 'var(--magenta)', color: '#FFFFFF', borderColor: 'var(--magenta)', boxShadow: '0 8px 16px rgba(182, 0, 125, 0.25)' }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', background: '#FFFFFF', padding: '12px 24px', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease', border: '1px solid var(--border)', fontWeight: '600' }}
              >
                {link.icon}
                <span style={{ fontSize: '0.95rem' }}>{link.label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.8rem', marginBottom: '8px' }}>Submit a Query to Admin</h3>
          <p style={{ color: 'var(--text-muted)' }}>We are here to help. Send us your query and the admin team will resolve it promptly.</p>
        </div>

        <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
          <AnimatePresence>
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success, #10b981)', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', marginBottom: '8px' }}>
                  <CheckCircle size={24} color="#10b981" />
                  <strong style={{ color: '#10b981' }}>Your support ticket has been submitted successfully!</strong>
                </div>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div style={{ color: 'var(--danger)', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', marginBottom: '8px' }}>
                  Failed to submit ticket. Please try again.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedField === 'name' ? 'var(--magenta)' : 'var(--text-muted)', transition: 'color 0.3s' }} />
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required placeholder="Full name" style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.2)', border: focusedField === 'name' ? '1px solid var(--magenta)' : '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(182, 0, 125, 0.2)' : 'none' }} />
            </div>

            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Smartphone size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedField === 'phone' ? 'var(--magenta)' : 'var(--text-muted)', transition: 'color 0.3s' }} />
              <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} required placeholder="Phone number" style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.2)', border: focusedField === 'phone' ? '1px solid var(--magenta)' : '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(182, 0, 125, 0.2)' : 'none' }} />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedField === 'email' ? 'var(--magenta)' : 'var(--text-muted)', transition: 'color 0.3s' }} />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required placeholder="Email address" style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.2)', border: focusedField === 'email' ? '1px solid var(--magenta)' : '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(182, 0, 125, 0.2)' : 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <MessageSquare size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedField === 'desc' ? 'var(--magenta)' : 'var(--text-muted)', transition: 'color 0.3s' }} />
            <textarea
              name="problem_description"
              value={formData.problem_description}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)}
              required
              placeholder="Please describe your issue in detail..."
              style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.2)', border: focusedField === 'desc' ? '1px solid var(--magenta)' : '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', minHeight: '140px', resize: 'vertical', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxShadow: focusedField === 'desc' ? '0 0 0 3px rgba(182, 0, 125, 0.2)' : 'none' }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={status === 'submitting'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, #7c0a21 0%, #5c0011 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 10px 25px rgba(92, 0, 17, 0.5)'
            }}
          >
            {status === 'submitting' ? 'Submitting ticket...' : (
              <>
                Submit Ticket <Send size={20} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default HelpCenter;

