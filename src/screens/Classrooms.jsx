import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Video } from 'lucide-react';
import { useAuth } from '../App';

const Classrooms = () => {
  const { user } = useAuth();
  const [activeClass, setActiveClass] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const ws = useRef(null);

  // Use the logged-in student's ID or fallback for safety
  const studentId = user?.student_id || "DEMO_STUDENT";

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/classrooms/get/by-student/${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setClassrooms(data);
        }
      } catch (err) {
        console.error("Failed to fetch classrooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (activeClass) {
      // Fetch existing messages (bypassing student membership check for demo by using the general endpoint if needed, or student endpoint)
      const fetchMessages = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/classrooms/student/${activeClass.class_id}/messages?student_id=${studentId}`);
          if (response.ok) {
            const data = await response.json();
            setChatHistory(data);
          }
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
      fetchMessages();

      // Connect to WebSocket
      ws.current = new WebSocket(`ws://localhost:8000/api/classrooms/ws/${activeClass.class_id}/chat?user_id=${studentId}&role=student`);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message_id) {
          setChatHistory(prev => [...prev, data]);
        } else if (data.deleted_message_id) {
          setChatHistory(prev => prev.filter(m => m.message_id !== data.deleted_message_id));
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [activeClass]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !ws.current) return;
    
    ws.current.send(JSON.stringify({
      content: message,
      sender_id: studentId,
      sender_role: 'student'
    }));
    
    setMessage('');
  };

  if (activeClass) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setActiveClass(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}><ArrowLeft /></button>
            <div>
              <h3 style={{ margin: 0 }}>{activeClass.class_name}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)' }}>{activeClass.class_description || 'Live Session'}</p>
            </div>
          </div>
          <button className="btn-primary" style={{ padding: '8px 16px', gap: '8px' }}><Video size={16} /> Join Video</button>
        </div>
        
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatHistory.map((msg, i) => {
            const isMe = msg.sender_id === studentId;
            return (
              <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? 'var(--primary-yellow)' : 'var(--surface)', padding: '12px 16px', borderRadius: '12px', maxWidth: '70%', color: isMe ? 'var(--deep-navy)' : 'white' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 'bold', color: isMe ? 'var(--deep-navy)' : 'var(--primary-yellow)' }}>{isMe ? 'You' : msg.sender_role || 'Instructor'}</p>
                <p style={{ margin: 0 }}>{msg.content}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', opacity: 0.7, textAlign: 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '12px 20px', color: 'white' }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-panel" 
      style={{ padding: '32px' }}
    >
      <motion.h2 variants={itemVariants} style={{ marginBottom: '24px' }}>My Classrooms</motion.h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--primary-yellow)', borderRadius: '50%' }} />
        </div>
      ) : classrooms.length === 0 ? (
        <motion.p variants={itemVariants}>You have not been assigned to any classrooms yet.</motion.p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {classrooms.map((cls, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.01, translateX: 5 }} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{cls.class_name}</h3>
                <p style={{ fontSize: '0.9rem' }}>{cls.class_description || 'No description'}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary-yellow)', marginTop: '4px' }}>
                  {cls.teacher_details?.length > 0 ? `Instructor: ${cls.teacher_details[0].full_name || 'N/A'}` : 'Instructor TBA'}
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => setActiveClass(cls)} style={{ padding: '8px 16px', borderRadius: '8px' }}>Join Class</motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Classrooms;
