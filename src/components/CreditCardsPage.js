import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Container, Row, Col, Modal, Form, Spinner, Alert, Pagination, Badge } from 'react-bootstrap';
import { FaCreditCard, FaPlus, FaMoneyBillWave, FaShoppingCart, FaUtensils, FaGamepad, FaCar, FaPiggyBank, FaCreditCard as FaCreditCardIcon, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock API calls - Replace with actual API service
const API_BASE_URL = 'http://localhost:3001';

const CreditCardsPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({
    accountId: '',
    cardNetwork: 'VISA',
    cardHolder: '',
    spendingLimit: 50000,
    isVirtual: false
  });
  const transactionsPerPage = 5;

  // Fetch user's credit cards and accounts
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;
      
      // Add selectedCard to the dependency array to fix the warning
      // eslint-disable-next-line react-hooks/exhaustive-deps
      
      try {
        setLoading(true);
        // Fetch accounts
        const accountsRes = await fetch(`${API_BASE_URL}/accounts?userId=${currentUser.id}`);
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);

        // Fetch credit cards (only credit cards, not debit)
        const cardsRes = await fetch(`${API_BASE_URL}/cards?userId=${currentUser.id}&isCreditCard=true`);
        const cardsData = await cardsRes.json();
        setCards(cardsData);

        // Fetch transactions for all cards
        if (cardsData.length > 0) {
          const txnRes = await fetch(`${API_BASE_URL}/transactions?userId=${currentUser.id}&paymentMethod=card`);
          const txnData = await txnRes.json();
          setTransactions(txnData);
          
          // Select first card by default
          if (!selectedCard && cardsData.length > 0) {
            setSelectedCard(cardsData[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id, selectedCard]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate a random card number
  const generateCardNumber = () => {
    return '4' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
  };

  // Add new credit card
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('Please log in to add a card');
      return;
    }

    try {
      const newCard = {
        ...formData,
        id: `card-${Date.now()}`,
        userId: parseInt(currentUser.id),
        accountId: parseInt(formData.accountId),
        cardNumber: generateCardNumber(),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toLocaleDateString('en-US', {month: '2-digit', year: '2-digit'}).replace('/', '/'),
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        isActive: true,
        isCreditCard: true,
        availableBalance: formData.spendingLimit,
        cardColor: formData.cardNetwork === 'VISA' ? '#1a1f71' : '#f79e1b',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });

      if (!response.ok) throw new Error('Failed to add card');
      
      const addedCard = await response.json();
      setCards([...cards, addedCard]);
      setShowAddCard(false);
      setFormData({
        accountId: '',
        cardNetwork: 'VISA',
        cardHolder: currentUser.name || '',
        spendingLimit: 50000,
        isVirtual: false
      });
      toast.success('Credit card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error(error.message || 'Failed to add card');
    }
  };

  // Filter transactions for selected card
  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions
      .filter(txn => txn.cardId === selectedCard)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [transactions, selectedCard]);

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = cardTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(cardTransactions.length / transactionsPerPage);



  // Format card number for display
  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const lastFour = number.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'shopping':
        return <FaShoppingCart className="me-2" />;
      case 'food':
        return <FaUtensils className="me-2" />;
      case 'entertainment':
        return <FaGamepad className="me-2" />;
      case 'transport':
        return <FaCar className="me-2" />;
      case 'savings':
        return <FaPiggyBank className="me-2" />;
      default:
        return <FaMoneyBillWave className="me-2" />;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaCreditCard className="me-2" /> My Credit Cards</h2>
        <Button variant="primary" onClick={() => setShowAddCard(true)}>
          <FaPlus className="me-2" /> Add Credit Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="text-center p-5">
          <FaCreditCardIcon size={48} className="mb-3 text-muted" />
          <h4>No Credit Cards Found</h4>
          <p className="text-muted mb-4">You don't have any credit cards yet. Add your first credit card to get started.</p>
          <Button variant="primary" onClick={() => setShowAddCard(true)}>
            <FaPlus className="me-2" /> Add Your First Credit Card
          </Button>
        </Card>
      ) : (
        <>
          <Row className="mb-4">
            {cards.map(card => (
              <Col key={card.id} md={6} lg={4} className="mb-4">
                <Card 
                  className={`h-100 ${selectedCard === card.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedCard(card.id)}
                  style={{ cursor: 'pointer', borderLeft: `5px solid ${card.cardColor}` }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-0">{card.cardNetwork}</h5>
                        <small className="text-muted">{card.isVirtual ? 'Virtual Card' : 'Physical Card'}</small>
                      </div>
                      <Badge bg={card.isActive ? 'success' : 'secondary'}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <h4 className="mb-1">{formatCardNumber(card.cardNumber)}</h4>
                      <small className="text-muted">Expires {card.expiryDate}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block">Card Holder</small>
                        <strong>{card.cardHolder || 'N/A'}</strong>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Available Limit</small>
                        <strong>₹{card.availableBalance?.toLocaleString() || '0'}</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {selectedCard && (
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Transactions</h5>
                {cardTransactions.length > 0 && (
                  <span className="text-muted">{cardTransactions.length} transactions found</span>
                )}
              </Card.Header>
              <Card.Body>
                {cardTransactions.length === 0 ? (
                  <div className="text-center py-4">
                    <FaCreditCard size={48} className="text-muted mb-3" />
                    <h5>No Transactions Yet</h5>
                    <p className="text-muted">Your credit card transactions will appear here.</p>
                    <Button variant="outline-primary">Make a Payment</Button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Date</th>
                            <th className="text-end">Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTransactions.map((txn, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getCategoryIcon(txn.category)}
                                  <div>
                                    <div>{txn.description || 'Card Transaction'}</div>
                                    <small className="text-muted">{txn.category || 'Other'}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FaCalendarAlt className="me-2 text-muted" />
                                  {new Date(txn.date || txn.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className={`text-end fw-bold ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                                {txn.type === 'credit' ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString()}
                              </td>
                              <td>
                                <Badge bg={txn.status === 'completed' ? 'success' : 'warning'}>
                                  {txn.status || 'pending'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                          <Pagination.Prev 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          />
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = currentPage <= 3 
                              ? i + 1 
                              : Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                            
                            if (i === 4 && currentPage < totalPages - 2) {
                              return (
                                <React.Fragment key="ellipsis">
                                  <Pagination.Ellipsis />
                                  <Pagination.Item 
                                    active={pageNum === currentPage}
                                    onClick={() => setCurrentPage(totalPages)}
                                  >
                                    {totalPages}
                                  </Pagination.Item>
                                </React.Fragment>
                              );
                            }
                            
                            return (
                              <Pagination.Item 
                                key={pageNum}
                                active={pageNum === currentPage}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Pagination.Item>
                            );
                          })}
                          <Pagination.Next 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Add Credit Card Modal */}
      <Modal show={showAddCard} onHide={() => setShowAddCard(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Credit Card</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCard}>
          <Modal.Body>
            {accounts.length === 0 ? (
              <Alert variant="warning">
                You don't have any bank accounts. Please add a bank account first.
              </Alert>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Link to Bank Account</Form.Label>
                  <Form.Select 
                    name="accountId" 
                    value={formData.accountId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Bank Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber.slice(-4)} ({account.accountType})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Card Network</Form.Label>
                  <Form.Select 
                    name="cardNetwork" 
                    value={formData.cardNetwork}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="VISA">VISA</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cardholder Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardHolder" 
                    value={formData.cardHolder || (currentUser?.name || '')}
                    onChange={handleInputChange}
                    placeholder="Enter cardholder name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Credit Limit (₹)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="spendingLimit" 
                    value={formData.spendingLimit}
                    onChange={handleInputChange}
                    min="1000"
                    step="1000"
                    required
                  />
                  <Form.Text className="text-muted">
                    Minimum credit limit is ₹1,000
                  </Form.Text>
                </Form.Group>

                <Form.Check 
                  type="switch"
                  id="isVirtual"
                  name="isVirtual"
                  label="This is a virtual card"
                  checked={formData.isVirtual}
                  onChange={handleInputChange}
                  className="mb-3"
                />
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddCard(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={accounts.length === 0 || loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                  Adding...
                </>
              ) : (
                'Add Credit Card'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CreditCardsPage;
