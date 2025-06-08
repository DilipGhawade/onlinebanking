import React, { useRef, useState } from "react";
import { Container, Row, Col, Card, Table, ProgressBar, Button } from "react-bootstrap";
import { FiCreditCard, FiDollarSign, FiBarChart2, FiClock, FiShoppingBag, FiGift, FiCoffee, FiShoppingCart, FiPlus } from "react-icons/fi";

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
  const scrollRef = useRef(null);

  const cardWidth = 300; // px
  const gap = 20; // px

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    
    const scrollAmount = direction === 'left' ? -(cardWidth + gap) : cardWidth + gap;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleCardClick = (index) => {
    setActiveCard(index);
  };

  const currentCard = cards[activeCard];
  const spendingTotal = spendingCategories.reduce((sum, cat) => sum + parseInt(cat.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Cards</h4>
        <Button variant="primary" size="sm">
          <FiPlus className="me-1" /> Add New Card
        </Button>
      </div>

      {/* Cards Carousel */}
      <div className="position-relative mb-4">
        <div 
          ref={scrollRef}
          className="d-flex overflow-hidden"
          style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 16px', gap: `${gap}px`, padding: '16px 0' }}
        >
          {cards.map((card, index) => (
            <div 
              key={card.id} 
              className="flex-shrink-0"
              style={{ width: `${cardWidth}px`, scrollSnapAlign: 'start' }}
              onClick={() => handleCardClick(index)}
            >
              <Card 
                className={`h-100 border-0 text-white ${activeCard === index ? 'shadow-lg' : 'opacity-75'}`}
                style={{ 
                  background: `linear-gradient(135deg, ${card.bg} 0%, ${card.bg}99 100%)`,
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">{card.bank}</h5>
                    <div className="bg-white rounded p-1 px-2">
                      <span className="text-dark fw-bold">{card.type}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="mb-1">{card.number}</h4>
                    <div className="d-flex justify-content-between align-items-center">
                      <small>Card Holder</small>
                      <small>Expires</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{card.holder}</h6>
                      <h6 className="mb-0">{card.expiry}</h6>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => scroll('left')}
          className="position-absolute start-0 top-50 translate-middle-y btn btn-light rounded-circle shadow-sm"
          style={{ width: '36px', height: '36px', zIndex: 10 }}
        >
          &lt;
        </button>
        <button 
          onClick={() => scroll('right')}
          className="position-absolute end-0 top-50 translate-middle-y btn btn-light rounded-circle shadow-sm"
          style={{ width: '36px', height: '36px', zIndex: 10 }}
        >
          &gt;
        </button>
      </div>

      <Row className="g-4">
        {/* Card Summary */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted mb-3">Card Summary</h6>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Current Balance</small>
                  <small className="fw-bold">₹{currentCard.balance}</small>
                </div>
                <ProgressBar now={85} variant="primary" style={{ height: '6px', borderRadius: '3px' }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Available Balance</small>
                  <small className="fw-bold">₹{currentCard.available}</small>
                </div>
                <ProgressBar now={65} variant="success" style={{ height: '6px', borderRadius: '3px' }} />
              </div>
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <FiDollarSign className="text-primary" />
                  </div>
                  <div className="mt-2">
                    <small className="d-block text-muted">Spent</small>
                    <small className="fw-bold">₹{Math.round(parseInt(currentCard.balance.replace(/[^0-9]/g, '')) * 0.15).toLocaleString()}</small>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <FiBarChart2 className="text-success" />
                  </div>
                  <div className="mt-2">
                    <small className="d-block text-muted">Earned</small>
                    <small className="fw-bold">1,250 pts</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Spending Statistics */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Spending Statistics</h6>
                <small className="text-muted">Total: ₹{spendingTotal.toLocaleString()}</small>
              </div>
              
              {spendingCategories.map((category, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">{category.name}</small>
                    <small className="fw-bold">{category.amount}</small>
                  </div>
                  <ProgressBar 
                    now={category.percentage} 
                    variant={category.color} 
                    style={{ height: '6px', borderRadius: '3px' }} 
                  />
                </div>
              ))}
              
              <div className="mt-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="text-muted">Daily Limit</small>
                  <small className="fw-bold">₹5,000 / ₹25,000</small>
                </div>
                <ProgressBar now={20} variant="info" style={{ height: '8px', borderRadius: '4px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Transactions</h6>
                <Button variant="link" size="sm" className="p-0">View All</Button>
              </div>
              
              <div className="d-flex flex-column gap-3">
                {currentCard.transactions.map((txn) => (
                  <div key={txn.id} className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                      {txn.icon}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{txn.merchant}</h6>
                        <span className={`fw-bold ${txn.amount.startsWith('-') ? 'text-danger' : 'text-success'}`}>
                          {txn.amount}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{txn.date}</small>
                        <small className="badge bg-light text-dark">{txn.category}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline-primary" className="w-100 mt-3 d-flex align-items-center justify-content-center">
                <FiPlus className="me-2" /> Add Money
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}