import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ServiceCard = ({ 
  title, 
  description, 
  icon, 
  bgColor = '#fff', 
  textColor = '#000', 
  buttonVariant = 'primary',
  onButtonClick,
  buttonText = 'View Details',
  features = []
}) => {
  return (
    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: bgColor }}>
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3" 
            style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: 'rgba(255,255,255,0.2)' 
            }}
          >
            {React.cloneElement(icon, { 
              size: 24, 
              color: textColor,
              className: 'text-' + buttonVariant 
            })}
          </div>
          <div>
            <h5 className="mb-0" style={{ color: textColor }}>{title}</h5>
            {description && (
              <p className="mb-0 small" style={{ color: textColor, opacity: 0.8 }}>
                {description}
              </p>
            )}
          </div>
        </div>
        
        {features.length > 0 && (
          <ul className="list-unstyled mt-3 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="mb-2 d-flex align-items-center">
                <span 
                  className="d-inline-block me-2" 
                  style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: textColor, opacity: 0.6 }}
                />
                <span style={{ color: textColor, opacity: 0.9, fontSize: '0.9rem' }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}
        
        {onButtonClick && (
          <Button 
            variant={buttonVariant} 
            size="sm"
            className="mt-2"
            onClick={onButtonClick}
            style={{ minWidth: '120px' }}
          >
            {buttonText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default ServiceCard;
