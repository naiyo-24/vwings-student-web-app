import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Eye, Globe, Phone, Mail, MapPin } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const AboutUs = () => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}
    >
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ color: 'var(--primary-yellow)', marginBottom: '8px', fontSize: '1.8rem' }}>VWINGS24x7</h2>
        <p style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Empowering Teachers, Enriching Minds</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>48 Courses</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>24 Partners</motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          <motion.div whileHover={{ x: 10 }} style={{ display: 'flex', gap: '16px', transition: '0.2s' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag color="var(--primary-yellow)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '8px' }}>Mission</h3>
              <p>Provide quality teacher training and resources.</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ x: 10 }} style={{ display: 'flex', gap: '16px', transition: '0.2s' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye color="var(--primary-yellow)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '8px' }}>Vision</h3>
              <p>Be the leading platform for teacher excellence.</p>
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <motion.div whileHover={{ scale: 1.1 }} style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>24</h3>
            <p style={{ fontSize: '0.8rem' }}>Partners</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>10y</h3>
            <p style={{ fontSize: '0.8rem' }}>Experience</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>92%</h3>
            <p style={{ fontSize: '0.8rem' }}>Placement</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>48</h3>
            <p style={{ fontSize: '0.8rem' }}>Courses</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Director" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '8px' }}>Dr. A. Director</h3>
          <p>"Our commitment is to uplift educators through practical training and continuous support."</p>
        </div>
        <div style={{ alignSelf: 'flex-end', fontStyle: 'italic', color: 'var(--text-muted)' }}>
          — Director
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Contact Us</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: Globe, text: "https://vwings24x7.example" },
            { icon: Phone, text: "+1-555-0100" },
            { icon: Mail, text: "contact@vwings24x7.example" },
            { icon: MapPin, text: "123 Education Lane, City, Country" }
          ].map((item, index) => (
            <motion.div 
              key={index} 
              whileHover={{ x: 10, color: 'var(--primary-yellow)' }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={16} color="var(--primary-yellow)" />
              </div>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
