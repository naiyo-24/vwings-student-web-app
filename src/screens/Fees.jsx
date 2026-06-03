import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { motion } from 'framer-motion';
import { Download, CreditCard } from 'lucide-react';
import { useAuth } from '../AuthContext';

const API_BASE = 'https://appbackend.vwings247.me';

// Helper to dynamically load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Fees = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [feeProfile, setFeeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState('full');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user?.student_id) {
      setLoading(false);
      return;
    }
    fetchFees();
  }, [user]);

  const fetchFees = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/fees/profile/${user.student_id}`);
      if (response.ok) {
        const data = await response.json();
        setFeeProfile(data);
        setFees(data.fees || []);
      } else if (response.status === 404) {
        setFees([]);
      }
    } catch (err) {
      console.error('Failed to fetch fees', err);
    } finally {
      setLoading(false);
    }
  };

  // Determine which installments are already paid
  const paidInstallments = (feeProfile?.paid_installments || fees
    .filter(f => f.payment_type === 'installment' && f.payment_status === 'completed')
    .map(f => f.installment_no)).map(Number);

  const hasFullPayment = fees.some(f => f.payment_type === 'full' && f.payment_status === 'completed');

  // Calculate next required installment based on paid ones
  const allInstallments = [1, 2, 3, 4];
  const totalAmountPaid = feeProfile?.total_paid ?? fees
    .filter(f => f.payment_status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalFee = feeProfile?.total_fee || 0;
  const pendingFee = Math.max(0, totalFee - totalAmountPaid);

  // Auto-select the next available installment or full if none paid
  useEffect(() => {
    if (paidInstallments.length === 0 && pendingFee > 0) {
      setPaymentType('full');
      setAmount(pendingFee);
    } else if (availableInstallments.length > 0) {
      setPaymentType(`installment_${availableInstallments[0]}`);
      setAmount('');
    }
  }, [feeProfile, fees, pendingFee]);

  const availableInstallments = allInstallments.filter(i => !paidInstallments.includes(i));
  const nextInstallment = availableInstallments.length > 0 ? availableInstallments[0] : 5;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setProcessing(true);
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setProcessing(false);
      return;
    }

    try {
      const isFull = paymentType === 'full';
      const instNo = isFull ? null : parseInt(paymentType.split('_')[1]);

      // 1. Create order on backend
      const orderRes = await fetch(`${API_BASE}/api/fees/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.student_id,
          payment_type: isFull ? 'full' : 'installment',
          installment_no: instNo,
          amount: parseFloat(amount)
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        toast.error(`Order creation failed: ${err.detail}`);
        setProcessing(false);
        return;
      }

      const orderData = await orderRes.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "VWings24x7",
        description: `${isFull ? 'Full Payment' : `Installment #${instNo}`} - ${user.course_availing}`,
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch(`${API_BASE}/api/fees/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                fee_id: orderData.fee_id
              })
            });

            if (verifyRes.ok) {
              toast.success("Payment successful!");
              fetchFees();
              setAmount('');
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error", err);
            toast.error("Error verifying payment.");
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone_no
        },
        theme: {
          color: "#f59e0b" // VWings primary yellow
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Failed to initiate payment.');
    } finally {
      setProcessing(false);
    }
  };

  const onlinePaid = fees
    .filter(f => f.payment_status === 'completed' && (!f.payment_mode || f.payment_mode.toLowerCase() === 'online'))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const cashPaid = fees
    .filter(f => f.payment_status === 'completed' && f.payment_mode && f.payment_mode.toLowerCase() === 'cash')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const chequePaid = fees
    .filter(f => f.payment_status === 'completed' && f.payment_mode && f.payment_mode.toLowerCase() === 'cheque')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const ddPaid = fees
    .filter(f => f.payment_status === 'completed' && f.payment_mode && f.payment_mode.toLowerCase() === 'demand_draft')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

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
          <p>Total Course Fees</p>
          <div className="stat-value text-gradient">₹{totalFee}</div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <p>Total Amount Paid</p>
          <div className="stat-value text-gradient" style={{ color: '#10b981' }}>₹{totalAmountPaid}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Online: <strong style={{ color: '#10b981' }}>₹{onlinePaid}</strong></span>
            <span>Cash: <strong style={{ color: '#f59e0b' }}>₹{cashPaid}</strong></span>
            {chequePaid > 0 && <span>Cheque: <strong style={{ color: '#3b82f6' }}>₹{chequePaid}</strong></span>}
            {ddPaid > 0 && <span>DD: <strong style={{ color: '#8b5cf6' }}>₹{ddPaid}</strong></span>}
          </div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <p>Pending Fees</p>
          <div className="stat-value" style={{ color: '#ef4444' }}>₹{pendingFee}</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '32px', marginBottom: 0 }}>

        {/* Payment Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} /> Make a Payment
          </h3>

          {totalFee === 0 ? (
            <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <p style={{ color: '#f59e0b', margin: 0, fontWeight: '500' }}>Your fee profile has not been configured by the admin yet. Please contact support.</p>
            </div>
          ) : hasFullPayment ? (
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <p style={{ color: '#10b981', margin: 0, fontWeight: '500' }}>You have completed the full payment for this course.</p>
            </div>
          ) : (pendingFee <= 0 && totalFee > 0) ? (
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <p style={{ color: '#10b981', margin: 0, fontWeight: '500' }}>You have completed all payments for this course. No remaining balance.</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Payment Option</label>
                <select
                  value={paymentType}
                  onChange={(e) => {
                    setPaymentType(e.target.value);
                    if (e.target.value === 'full') setAmount(pendingFee);
                  }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-main)' }}
                >
                  {pendingFee > 0 && (
                    <option value="full" style={{ background: 'var(--surface)', color: 'var(--text-main)' }}>
                      {paidInstallments.length === 0 ? "Full Payment" : "Pay Remaining Balance"}
                    </option>
                  )}
                  {availableInstallments.map(i => (
                    <option key={i} value={`installment_${i}`} style={{ background: 'var(--surface)', color: 'var(--text-main)' }}>Installment #{i}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={paymentType === 'full' ? "Remaining Balance" : "Enter amount to pay"}
                  style={{ background: paymentType === 'full' ? 'rgba(255,255,255,0.05)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-main)', cursor: paymentType === 'full' ? 'not-allowed' : 'text' }}
                  required
                  readOnly={paymentType === 'full'}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={processing}
                style={{ marginTop: '8px', padding: '14px', fontWeight: 'bold' }}
              >
                {processing ? 'Processing...' : `Pay ₹${amount || 0}`}
              </button>
            </form>
          )}
        </div>

        {/* History Table */}
        <div className="glass-card" style={{ padding: '24px', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '16px' }}>Payment History</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading payment records...</p>
          ) : fees.length === 0 ? (
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No payment records found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Date</th>
                    <th style={{ padding: '12px 8px' }}>Type</th>
                    <th style={{ padding: '12px 8px' }}>Mode</th>
                    <th style={{ padding: '12px 8px' }}>Amount</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.fee_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px' }}>{new Date(fee.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                        {fee.payment_type === 'installment' ? `Inst #${fee.installment_no}` : 'Full'}
                      </td>
                      <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{fee.payment_mode || 'Online'}</td>
                      <td style={{ padding: '12px 8px' }}>{fee.amount ? `₹${fee.amount}` : 'N/A'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          background: fee.payment_status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: fee.payment_status === 'completed' ? '#10b981' : '#f59e0b'
                        }}>
                          {fee.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {fee.file_path ? (
                          <a
                            href={`${API_BASE}/${fee.file_path.replace(/\\\\/g, '/')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-yellow)', textDecoration: 'none', background: 'rgba(245, 195, 0, 0.1)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem' }}
                          >
                            <Download size={14} /> View
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Fees;

