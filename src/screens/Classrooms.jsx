import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Video, Upload, X } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Classrooms = () => {
  const { user } = useAuth();
  const [activeClass, setActiveClass] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const ws = useRef(null);
  const fileInputRef = useRef(null);

  // Use the logged-in student's ID or fallback for safety
  const studentId = user?.student_id || "DEMO_STUDENT";

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch(`https://appbackend.vwings247.me/api/classrooms/get/by-student/${studentId}`);
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
          const response = await fetch(`https://appbackend.vwings247.me/api/classrooms/student/${activeClass.class_id}/messages?student_id=${studentId}`);
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || !ws.current) return;

    let attachmentUrl = null;
    let attachmentType = null;

    if (attachment) {
      setUploadingAttachment(true);
      const formData = new FormData();
      formData.append('file', attachment);
      try {
        const res = await fetch('https://appbackend.vwings247.me/api/classrooms/upload-attachment', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          attachmentUrl = data.url;
          attachmentType = data.type;
        }
      } catch (error) {
        console.error("Upload failed", error);
      }
      setUploadingAttachment(false);
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    ws.current.send(JSON.stringify({
      content: message.trim() || 'Shared an attachment',
      sender_id: studentId,
      sender_role: 'student',
      attachment_url: attachmentUrl,
      attachment_type: attachmentType
    }));

    setMessage('');
  };

  if (activeClass) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel chat-container" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setActiveClass(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><ArrowLeft /></button>
            <div>
              <h3 style={{ margin: 0 }}>{activeClass.class_name}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)' }}>{activeClass.class_description || 'Live Session'}</p>
            </div>
          </div>
          {activeClass.meet_link ? (
            <a
              href={activeClass.meet_link.startsWith('http') ? activeClass.meet_link : `https://${activeClass.meet_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: '8px 16px', gap: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <Video size={16} /> Join Video
            </a>
          ) : (
            <button className="btn-secondary" disabled style={{ padding: '8px 16px', gap: '8px', opacity: 0.6, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
              <Video size={16} /> Link Pending Admin
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatHistory.map((msg, i) => {
            const isMe = msg.sender_id === studentId;
            return (
              <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? 'var(--primary)' : 'var(--surface)', padding: '12px 16px', borderRadius: '12px', maxWidth: '70%', color: isMe ? 'white' : 'var(--text-main)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 'bold', color: isMe ? 'white' : 'var(--primary)' }}>{isMe ? 'You' : msg.sender_role || 'Instructor'}</p>

                {msg.attachment_url && msg.attachment_type === 'image' && (
                  <img src={`https://appbackend.vwings247.me/${msg.attachment_url.replace(/\\/g, '/')}`} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                )}
                {msg.attachment_url && msg.attachment_type === 'pdf' && (
                  <a href={`https://appbackend.vwings247.me/${msg.attachment_url.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '8px', color: isMe ? 'white' : 'var(--primary)', textDecoration: 'underline' }}>View PDF Document</a>
                )}
                {msg.attachment_url && msg.attachment_type === 'file' && (
                  <a href={`https://appbackend.vwings247.me/${msg.attachment_url.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '8px', color: isMe ? 'white' : 'var(--primary)', textDecoration: 'underline' }}>Download File</a>
                )}

                <p style={{ margin: 0 }}>{msg.content || msg.text}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', opacity: 0.7, textAlign: 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {attachment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '8px 12px', borderRadius: '8px', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem' }}>{attachment.name}</span>
              <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              onChange={(e) => setAttachment(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ borderRadius: '50%', width: '48px', height: '48px', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '24px', padding: '12px 20px', color: 'var(--text-main)', minWidth: 0 }}
            />
            <button type="submit" className="btn-primary" disabled={uploadingAttachment} style={{ borderRadius: '50%', width: '48px', height: '48px', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploadingAttachment ? 0.5 : 1 }}>
              <Send size={20} />
            </button>
          </div>
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
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : classrooms.length === 0 ? (
        <motion.p variants={itemVariants}>You have not been assigned to any classrooms yet.</motion.p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {classrooms.map((cls, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.01, translateX: 5 }} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{cls.class_name}</h3>
                <p style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{cls.class_description || 'No description'}</p>
                {(cls.class_date || cls.class_time) && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                    📅 {cls.class_date} {cls.class_time ? `⏰ ${cls.class_time}` : ''}
                  </p>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', wordBreak: 'break-word' }}>
                  {cls.teacher_details?.length > 0 ? `Instructor: ${cls.teacher_details[0].full_name || 'N/A'}` : 'Instructor TBA'}
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => setActiveClass(cls)} style={{ padding: '8px 16px', borderRadius: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}>Join Class</motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Classrooms;
