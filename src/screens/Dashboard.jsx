import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, UserCheck, Calendar, Bell } from 'lucide-react';
import WelcomeModalNew from '../components/WelcomeModalNew';
import CarouselCard from '../components/CarouselCard';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../App';

const API_BASE = 'http://localhost:8000';

const Dashboard = () => {
  const { user } = useAuth();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [classroomsCount, setClassroomsCount] = useState(0);

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
            <BookOpen size={24} color="var(--primary-yellow)" />
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

      <motion.div className="glass-panel" style={{ padding: '24px' }} variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Bell size={24} color="var(--primary-yellow)" />
          <h3>Recent Notifications</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.length > 0 ? notifications.map((note) => (
            <div key={note.announcement_id} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-yellow)' }}></div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>{note.headline}</h4>
                <p style={{ fontSize: '0.9rem' }}>{note.description}</p>
                <small style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>
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
