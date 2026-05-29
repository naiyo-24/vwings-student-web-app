import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useAuth } from '../App';

const API_BASE = 'http://localhost:8000';

const Fees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.student_id) {
      setLoading(false);
      return;
    }
    const fetchFees = async () => {
      try {
        // Fetch fees specific to this logged-in student
        const response = await fetch(`${API_BASE}/api/fees/get-by-student/${user.student_id}`);
        if (response.ok) {
          const data = await response.json();
          setFees(data);
        } else if (response.status === 404) {
          // No fees found is not an error
          setFees([]);
        }
      } catch (err) {
        console.error('Failed to fetch fees', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ padding: '32px' }}
    >
      <h2 style={{ marginBottom: '8px' }}>Fee Tracker</h2>
      {user && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Student ID: <span style={{ color: 'var(--primary-yellow)', fontWeight: '600' }}>{user.student_id}</span>
        </p>
      )}

      {/* Stats section */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
          <p>Total Fee Records</p>
          <div className="stat-value text-gradient">{fees.length}</div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <p>Receipts Uploaded</p>
          <div className="stat-value text-gradient">{fees.length}</div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <p>Course</p>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary-yellow)', marginTop: '8px' }}>
            {user?.course_name || user?.course_availing || '—'}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Payment History</h3>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading payment records...</p>
      ) : fees.length === 0 ? (
        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No payment records found. Contact admin if you have made payments.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Installment</th>
                <th style={{ padding: '12px' }}>Student ID</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.fee_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{new Date(fee.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>Installment {fee.installment_no}</td>
                  <td style={{ padding: '12px' }}>{fee.student_id}</td>
                  <td style={{ padding: '12px', color: 'var(--success)' }}>Uploaded</td>
                  <td style={{ padding: '12px' }}>
                    <a
                      href={`${API_BASE}/api/fees/download/${fee.student_id}/${fee.installment_no}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-yellow)', textDecoration: 'none' }}
                    >
                      <Download size={16} /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default Fees;
