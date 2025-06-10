import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Badge } from "react-bootstrap";
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiBarChart2, 
  FiClock, 
  FiShoppingBag, 
  FiGift, 
  FiCoffee, 
  FiShoppingCart, 
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const cards = [
  {
    id: 1,
    bank: "BankDash Platinum",
    number: "**** **** **** 1234",
    holder: "Nidisha",
    expiry: "12/27",
    balance: "75,000",
    available: "68,000",
    type: "Visa",
    bg: "#3b5998",
    transactions: [
      { id: 1, icon: <FiShoppingBag className="text-primary" />, merchant: "Amazon", date: "12 Jun 2024", amount: "-₹1,200", category: "Shopping" },
      { id: 2, icon: <FiGift className="text-success" />, merchant: "Flipkart", date: "10 Jun 2024", amount: "-₹3,500", category: "Shopping" },
      { id: 3, icon: <FiCoffee className="text-warning" />, merchant: "Starbucks", date: "08 Jun 2024", amount: "-₹350", category: "Food" },
    ]
  },
  {
    id: 2,
    bank: "BankDash Gold",
    number: "**** **** **** 5678",
    holder: "Nidisha",
    expiry: "11/26",
    balance: "32,500",
    available: "28,700",
    type: "Mastercard",
    bg: "#f39c12",
    transactions: [
      { id: 1, icon: <FiShoppingCart className="text-danger" />, merchant: "Big Bazaar", date: "05 Jun 2024", amount: "-₹2,800", category: "Groceries" },
      { id: 2, icon: <FiGift className="text-success" />, merchant: "Myntra", date: "01 Jun 2024", amount: "-₹1,800", category: "Shopping" },
    ]
  },
  {
    id: 3,
    bank: "BankDash Silver",
    number: "**** **** **** 9999",
    holder: "Nidisha",
    expiry: "10/25",
    balance: "12,000",
    available: "10,500",
    type: "Rupay",
    bg: "#16a085",
    transactions: [
      { id: 1, icon: <FiCoffee className="text-warning" />, merchant: "Cafe Coffee Day", date: "28 May 2024", amount: "-₹250", category: "Food" },
    ]
  },
];

const spendingCategories = [
  { name: "Shopping", amount: "₹12,500", percentage: 45, color: "primary" },
  { name: "Food & Drinks", amount: "₹8,300", percentage: 30, color: "warning" },
  { name: "Groceries", amount: "₹4,200", percentage: 15, color: "success" },
  { name: "Others", amount: "₹2,500", percentage: 10, color: "info" },
];

export function CreditCardsPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Recalculate card widths when screen size changes
      if (cardRefs.current[activeCard]) {
        cardRefs.current[activeCard].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeCard]);

  const scrollToCard = (index) => {
    setActiveCard(index);
    if (cardRefs.current[index]) {
      cardRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const scroll = (direction) => {
    const newIndex = direction === 'left' 
      ? (activeCard - 1 + cards.length) % cards.length
      : (activeCard + 1) % cards.length;
    scrollToCard(newIndex);
  };

  const currentCard = cards[activeCard];
  const spendingTotal = spendingCategories.reduce((sum, cat) => sum + parseInt(cat.amount.replace(/[^0-9]/g, '')), 0);

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (window.innerWidth < 400) return window.innerWidth - 32; // 16px padding on each side
    if (window.innerWidth < 768) return window.innerWidth - 64; // 32px padding on each side for tablets
    return 300; // Fixed width for desktop
  };

  return (
    <Container fluid className="p-0 p-md-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
        <h4 className="mb-3 mb-md-0">My Cards</h4>
        <Button 
          variant="primary" 
          size={isMobile ? 'sm' : 'md'} 
          className="d-flex align-items-center"
        >
          <FiPlus className="me-1" /> Add New Card
        </Button>
      </div>

      {/* Cards Carousel */}
      <div className="position-relative mb-4">
        <div 
          ref={scrollRef}
          className="d-flex overflow-auto hide-scrollbar"
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollPadding: '0 16px',
            gap: '16px',
            padding: '8px 8px 24px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {cards.map((card, index) => (
            <div 
              key={card.id} 
              ref={el => cardRefs.current[index] = el}
              className="flex-shrink-0"
              style={{ 
                width: `${getCardWidth()}px`,
                scrollSnapAlign: 'center',
                transition: 'transform 0.3s ease'
              }}
              onClick={() => scrollToCard(index)}
            >
              <Card 
                className={`h-100 border-0 text-white ${activeCard === index ? 'shadow-lg' : 'opacity-75'}`}
                style={{ 
                  background: `linear-gradient(135deg, ${card.bg} 0%, ${card.bg}99 100%)`,
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  minHeight: '200px',
                  transform: activeCard === index ? 'scale(1)' : 'scale(0.95)',
                  boxShadow: activeCard === index ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Card.Body className="d-flex flex-column justify-content-between p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 text-truncate" style={{maxWidth: '70%'}}>{card.bank}</h5>
                    <div className="bg-white rounded p-1 px-2">
                      <span className="text-dark fw-bold small">{card.type}</span>
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-2 small text-white-50">Card Number</h6>
                    <h4 className="mb-3 fw-bold">{card.number}</h4>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="small text-white-50">Card Holder</div>
                        <div className="fw-medium">{card.holder}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-white-50">Expires</div>
                        <div className="fw-medium">{card.expiry}</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
        
        {!isMobile && cards.length > 1 && (
          <>
            <Button 
              onClick={() => scroll('left')}
              variant="light"
              className="position-absolute start-0 top-50 translate-middle-y rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ 
                width: '36px', 
                height: '36px',
                zIndex: 10,
                opacity: 0.9
              }}
              aria-label="Previous card"
            >
              <FiChevronLeft />
            </Button>
            <Button 
              onClick={() => scroll('right')}
              variant="light"
              className="position-absolute end-0 top-50 translate-middle-y rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ 
                width: '36px', 
                height: '36px',
                zIndex: 10,
                opacity: 0.9
              }}
              aria-label="Next card"
            >
              <FiChevronRight />
            </Button>
          </>
        )}

        {/* Card indicators for mobile */}
        {isMobile && cards.length > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`btn p-0 ${activeCard === index ? 'opacity-100' : 'opacity-50'}`}
                aria-label={`Go to card ${index + 1}`}
              >
                <div 
                  style={{
                    width: activeCard === index ? '16px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: activeCard === index ? currentCard.bg : '#ccc',
                    transition: 'all 0.3s ease'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Row className="g-4">
        {/* Card Summary */}
        <Col xs={12} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h6 className="text-muted mb-3">Card Summary</h6>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Current Balance</small>
                  <small className="fw-bold">₹{currentCard.balance}</small>
                </div>
                <ProgressBar 
                  now={85} 
                  variant="primary" 
                  style={{ height: '6px', borderRadius: '3px' }} 
                  className="bg-light"
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Available Balance</small>
                  <small className="fw-bold">₹{currentCard.available}</small>
                </div>
                <ProgressBar 
                  now={65} 
                  variant="success" 
                  style={{ height: '6px', borderRadius: '3px' }} 
                  className="bg-light"
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    <FiDollarSign className="text-primary" />
                  </div>
                  <div>
                    <small className="d-block text-muted">Spent</small>
                    <small className="fw-bold">₹{Math.round(parseInt(currentCard.balance.replace(/[^0-9]/g, '')) * 0.15).toLocaleString()}</small>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    <FiBarChart2 className="text-success" />
                  </div>
                  <div>
                    <small className="d-block text-muted">Limit</small>
                    <small className="fw-bold">₹{parseInt(currentCard.balance.replace(/[^0-9]/g, '')).toLocaleString()}</small>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                    <FiClock className="text-warning" />
                  </div>
                  <div>
                    <small className="d-block text-muted">Due in</small>
                    <small className="fw-bold">12 days</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col xs={12} lg={8}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0">Recent Transactions</h6>
                <Button variant="link" size="sm" className="text-decoration-none p-0">
                  View All
                </Button>
              </div>
              
              <div className="transaction-list">
                {currentCard.transactions.map((tx) => (
                  <div key={tx.id} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        {tx.icon}
                      </div>
                      <div>
                        <div className="fw-medium">{tx.merchant}</div>
                        <small className="text-muted">{tx.date} • {tx.category}</small>
                      </div>
                    </div>
                    <div className="fw-medium text-end">
                      <div className={tx.amount.startsWith('-') ? 'text-danger' : 'text-success'}>{tx.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Spending Breakdown */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h6 className="mb-4">Spending Breakdown</h6>
              <div className="row g-4">
                <Col xs={12} md={6} lg={4}>
                  <div className="d-flex flex-column h-100">
                    {spendingCategories.map((category, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="small">{category.name}</span>
                          <span className="small fw-medium">{category.amount}</span>
                        </div>
                        <ProgressBar 
                          now={category.percentage} 
                          variant={category.color} 
                          style={{ height: '6px', borderRadius: '3px' }} 
                          className="bg-light"
                        />
                      </div>
                    ))}
                  </div>
                </Col>
                <Col xs={12} md={6} lg={8}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="mb-0">₹{spendingTotal.toLocaleString()}</h5>
                        <small className="text-muted">Total spent this month</small>
                      </div>
                      <Badge bg="light" text="dark" className="px-3 py-2">
                        <span className="d-flex align-items-center">
                          <span className="bg-success rounded-circle me-2" style={{width: '8px', height: '8px'}}></span>
                          On track
                        </span>
                      </Badge>
                    </div>
                    <div className="bg-light rounded-3 p-3 p-md-4 flex-grow-1 d-flex flex-column justify-content-center">
                      <div className="text-center">
                        <div className="mb-3">
                          <FiBarChart2 size={32} className="text-muted" />
                        </div>
                        <h6 className="mb-2">Spending Insights</h6>
                        <p className="text-muted small mb-0">
                          You've spent 15% less this month compared to last month. Keep it up!
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}