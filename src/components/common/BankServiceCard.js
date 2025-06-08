// src/components/common/BankServiceCard.js
import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

const BankServiceCard = ({ service }) => {
  const { 
    title, 
    description, 
    icon, 
    iconBg, 
    features = [], 
    featured = false 
  } = service;

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs="auto" className="pe-0">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: iconBg
              }}
            >
              {React.cloneElement(icon, { 
                size: 20,
                className: 'text-white' 
              })}
            </div>
          </Col>
          <Col>
            <h6 className="mb-1">{title}</h6>
            <p className="text-muted small mb-0">{description}</p>
          </Col>
          <Col xs={12} md={5} className="mt-2 mt-md-0">
            <Row className="g-2 text-center">
              {features.map((feature, idx) => (
                <Col key={idx} xs={4}>
                  <div 
                    className="border rounded p-2 h-100"
                    style={{ 
                      backgroundColor: featured ? '#f8f9fa' : 'transparent' 
                    }}
                  >
                    <div className="fw-medium">{feature}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs="auto" className="mt-3 mt-md-0">
            <Button 
              variant={featured ? "outline-primary" : "outline-secondary"} 
              size="sm"
              className="px-3"
            >
              View Details
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BankServiceCard;