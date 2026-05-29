import React from 'react';

const CarouselCard = ({ title, description, imageUrl }) => {
  return (
    <div className="glass-card" style={{ padding: '24px', minWidth: '300px' }}>
      {imageUrl && <img src={imageUrl} alt={title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />}
      <h3 style={{ margin: '16px 0 8px 0' }}>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default CarouselCard;
