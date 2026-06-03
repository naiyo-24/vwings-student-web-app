import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, UserCheck, Calendar, Bell, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WelcomeModalNew from '../components/WelcomeModalNew';
import CarouselCard from '../components/CarouselCard';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../AuthContext';

const API_BASE = 'http://localhost:8000';

const Dashboard = () => {
  const { user } = useAuth();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [classroomsCount, setClassroomsCount] = useState(0);
  const [feeProfile, setFeeProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show modal if they haven't seen it yet this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsWelcomeModalOpen(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }

    const fetchData = async () => {
      try {
        // Fetch Featured Courses
        const coursesRes = await fetch(`${API_BASE}/api/courses/get-all`);
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setFeaturedCourses(cData.slice(0, 4));
        }

        // Fetch Notifications
        const notifRes = await fetch(`${API_BASE}/announcements/get-all/role/student`);
        if (notifRes.ok) {
          const nData = await notifRes.json();
          const activeNotifs = nData.filter(n => n.active_status);
          setNotifications(activeNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3));
        }

        // Fetch Classrooms (to simulate enrolled count & upcoming classes)
        if (user && user.student_id) {
          const classRes = await fetch(`${API_BASE}/api/classrooms/get/by-student/${user.student_id}`);
          if (classRes.ok) {
            const classData = await classRes.json();
            setClassroomsCount(classData.length);
          }

          // Fetch Fee Profile
          if (user.course_availing) {
            const feeRes = await fetch(`${API_BASE}/api/fees/profile/${user.student_id}`);
            if (feeRes.ok) {
              setFeeProfile(await feeRes.json());
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <WelcomeModalNew isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
      <AdBanner />

      <div className="dashboard-grid">
        <motion.div className="glass-card stat-card" variants={itemVariants}>
          <div className="stat-header">
            <span>Enrolled Courses</span>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <div className="stat-value text-gradient">{user?.course_availing ? 1 : 0}</div>
          <p>Current active enrollments</p>
        </motion.div>

        <motion.div className="glass-card stat-card" variants={itemVariants}>
          <div className="stat-header">
            <span>Attendance</span>
            <UserCheck size={24} color="var(--magenta)" />
          </div>
          <div className="stat-value text-gradient">N/A</div>
          <p>Attendance tracking coming soon</p>
        </motion.div>

        <motion.div className="glass-card stat-card" variants={itemVariants}>
          <div className="stat-header">
            <span>Upcoming Classes</span>
            <Calendar size={24} color="var(--success)" />
          </div>
          <div className="stat-value text-gradient">{classroomsCount}</div>
          <p>Check your classroom schedule</p>
        </motion.div>
      </div>

      {user?.course_availing && feeProfile && (
        <motion.div className="glass-card" style={{ padding: '24px', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }} variants={itemVariants}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={28} color="var(--primary)" />
              <div>
                <h3 style={{ margin: 0 }}>Fee Overview</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.course_name || user.course_availing}</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/fees')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              Make Payment <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' }}>
            <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Fees</p>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem' }}>₹{feeProfile.total_fee || 0}</h4>
            </div>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem' }}>Paid Amount</p>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#10b981' }}>₹{feeProfile.total_paid || 0}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Online: <strong style={{ color: '#10b981' }}>₹{feeProfile.online_paid || 0}</strong></span>
                <span>Cash: <strong style={{ color: '#f59e0b' }}>₹{feeProfile.cash_paid || 0}</strong></span>
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem' }}>Pending Fees</p>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#ef4444' }}>₹{Math.max(0, (feeProfile.total_fee || 0) - (feeProfile.total_paid || 0))}</h4>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }} variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Bell size={24} color="var(--primary)" />
          <h3>Recent Notifications</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.length > 0 ? notifications.map((note) => (
            <div key={note.announcement_id} style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>{note.headline}</h4>
                <p style={{ fontSize: '0.9rem' }}>{note.description}</p>
                <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)' }}>No recent notifications.</p>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Featured Programs</h3>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
          {featuredCourses.length > 0 ? (
            featuredCourses.map(course => (
              <CarouselCard
                key={course.course_id}
                title={course.course_name}
                description={course.course_description ? course.course_description.substring(0, 50) + '...' : ''}
              />
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No featured programs available right now.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

