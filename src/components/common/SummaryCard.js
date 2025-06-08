import React from 'react';
import { Card } from 'react-bootstrap';

const SummaryCard = ({ title, value, icon, bg = 'bg-light', textColor = 'dark' }) => {
  return (
    <Card className={`${bg} border-0 shadow-sm h-100`}>
      <Card.Body className="d-flex align-items-center">
        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <h6 className={`mb-0 text-${textColor}-50`}>{title}</h6>
          <h4 className={`mb-0 text-${textColor}`}>{value}</h4>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SummaryCard;
