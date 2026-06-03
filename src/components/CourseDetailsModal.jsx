import React from 'react';
import { motion } from 'framer-motion';

const CourseDetailsModal = ({ course, isOpen, onClose }) => {
  if (!isOpen || !course) return null;

  const photoUrl = course.course_photo ? `https://appbackend.vwings247.me/${course.course_photo}` : null;
  const fees = course?.general_data?.course_fees ? `₹${course.general_data.course_fees}` : 'Contact for Info';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '40px', maxWidth: '600px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
        >
          &times;
        </button>
        {photoUrl && (
          <img src={photoUrl} alt={course.course_name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
        )}
        <h2 style={{ color: 'var(--primary-yellow)', marginBottom: '8px' }}>{course.course_name}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Code: {course.course_code}</p>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: 'white', marginBottom: '8px' }}>Description</h4>
          <p>{course.course_description || 'No description available.'}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: 'white', marginBottom: '8px' }}>Requirements</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            {course.min_educational_qualification && <li>Education: {course.min_educational_qualification}</li>}
            {course.age_criteria && <li>Age: {course.age_criteria}</li>}
            {course.height_requirements && <li>Height: {course.height_requirements}</li>}
            {course.weight_requirements && <li>Weight: {course.weight_requirements}</li>}
            {course.vision_standards && <li>Vision: {course.vision_standards}</li>}
            {course.medical_requirements && <li>Medical: {course.medical_requirements}</li>}
          </ul>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: 'white', marginBottom: '8px' }}>Other Details</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li>Fees: {fees}</li>
            <li>Internship Included: {course.internship_included ? 'Yes' : 'No'}</li>
            <li>Installment Available: {course.installment_available ? 'Yes' : 'No'}</li>
            {course.installment_policy && <li>Installment Policy: {course.installment_policy}</li>}
          </ul>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
          <button className="btn-primary">Enroll Now</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseDetailsModal;
