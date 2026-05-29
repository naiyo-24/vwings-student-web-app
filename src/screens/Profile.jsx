import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';

const API_BASE = 'http://localhost:8000';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_no: user?.phone_no || '',
    address: user?.address || '',
    guardian_mobile_no: user?.guardian_mobile_no || '',
  });

  if (!user) {
    return <div style={{ color: 'white', padding: '32px' }}>No profile data found. Please log in again.</div>;
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';
  const photoUrl = user.profile_photo ? `${API_BASE}/${user.profile_photo}` : null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const fd = new FormData();
      fd.append('full_name', formData.full_name);
      fd.append('phone_no', formData.phone_no);
      fd.append('address', formData.address);
      fd.append('guardian_mobile_no', formData.guardian_mobile_no);

      const response = await fetch(`${API_BASE}/api/students/put-by/${user.student_id}`, {
        method: 'PUT',
        body: fd,
      });

      if (response.ok) {
        const updated = await response.json();
        // Update the stored session
        const stored = JSON.parse(localStorage.getItem('vwings_student') || '{}');
        localStorage.setItem('vwings_student', JSON.stringify({ ...stored, ...updated }));
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await response.json().catch(() => ({}));
        setSaveError(err.detail || 'Failed to save changes.');
      }
    } catch (err) {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <h2>Account Profile</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saveSuccess && (
            <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: '600' }}>✓ Saved successfully!</span>
          )}
          {saveError && (
            <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{saveError}</span>
          )}
          {isEditing && (
            <button className="btn-secondary" onClick={() => { setIsEditing(false); setSaveError(''); setFormData({ full_name: user.full_name || '', phone_no: user.phone_no || '', address: user.address || '', guardian_mobile_no: user.guardian_mobile_no || '' }); }}>
              Cancel
            </button>
          )}
          <button className="btn-primary" onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Left column */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', boxShadow: 'var(--glass-shadow)', border: '3px solid var(--primary-yellow)' }}
            />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', marginBottom: '24px', boxShadow: 'var(--glass-shadow)', fontWeight: '700' }}>
              {initials}
            </div>
          )}

          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="text" value={user.email || ''} disabled title="Email cannot be changed" />
          </div>
          <div className="input-group">
            <label>Student ID</label>
            <input type="text" value={user.student_id || ''} disabled />
          </div>
          <div className="input-group">
            <label>Enrolled Course</label>
            <input type="text" value={user.course_name || user.course_availing || 'None'} disabled />
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="input-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} />
          </div>
          <div className="input-group">
            <label>Guardian Name</label>
            <input type="text" value={user.guardian_name || ''} disabled />
          </div>
          <div className="input-group">
            <label>Emergency Contact (Guardian)</label>
            <input type="text" name="guardian_mobile_no" value={formData.guardian_mobile_no} onChange={handleInputChange} disabled={!isEditing} />
          </div>

          <h3 style={{ marginTop: '32px', marginBottom: '8px' }}>Account Info</h3>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <p>Member since: {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
