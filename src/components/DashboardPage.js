import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Badge, Button, ProgressBar, 
  ListGroup, Tab, Nav, Alert, Spinner, Modal, Form
} from 'react-bootstrap';
import { FaWallet, FaUniversity, FaCreditCard, FaExchangeAlt, 
  FaShoppingCart, FaMobileAlt, FaFileInvoiceDollar, FaBell,
  FaShieldAlt, FaChartPie, FaPiggyBank, FaQuestionCircle, 
  FaBolt, FaMobile, FaFire, FaTint, FaWifi
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { userAPI, accountsAPI, transactionsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import TransferModal from './TransferModal';
import BillPayModal from './BillPayModal';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  console.log('Rendering DashboardPage');
  
  // Component lifecycle logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DashboardPage mounted');
      return () => console.log('DashboardPage unmounted');
    }
  }, []);
  
  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the authenticated user's ID
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Fetch accounts data
        const accountsData = await accountsAPI.fetchBankAccounts(userId);
        setAccounts(accountsData);
        
        // Fetch and process cards
        const allCards = [];
        
        // Get active cards from all accounts
        for (const account of accountsData) {
          try {
            const cards = await accountsAPI.getAccountCards(account.id);
            if (cards && Array.isArray(cards)) {
              // Filter for active cards only
              const activeCards = cards.filter(card => card.isActive === true);
              allCards.push(...activeCards.map(card => ({
                ...card,
                bankName: account.bankName,
                accountNumber: account.accountNumber,
                // Ensure we have all required fields with defaults
                availableBalance: card.availableBalance || 0,
                spendingLimit: card.spendingLimit || 0,
                isActive: card.isActive !== false // Default to true if not specified
              })));
            }
          } catch (error) {
            console.error(`Error fetching cards for account ${account.id}:`, error);
          }
        }
        
        setCards(allCards);
        
        // Fetch and sort transactions by date (newest first) and get the 4 most recent
        const transactionsData = await transactionsAPI.getUserTransactions(userId);
        const sortedTransactions = [...transactionsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(sortedTransactions.slice(0, 4));
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // This will re-run when userId changes

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalBalance: 0,
    totalSpendingLimit: 0,
    activeCardsCount: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    isLoading: true,
    error: null
  });

  // Fetch summary data from the server
  const fetchSummaryData = useCallback(async () => {
    if (!userId) return;
    
    try {
      // Fetch all necessary data in parallel
      const [accountsRes, transactionsRes] = await Promise.all([
        accountsAPI.fetchBankAccounts(userId),
        transactionsAPI.getUserTransactions(userId)
      ]);
      
      // Get cards from accounts
      const cardsPromises = accountsRes.map(account => 
        accountsAPI.getAccountCards(account.id).catch(() => [])
      );
      const cardsResults = await Promise.all(cardsPromises);
      const allCards = cardsResults.flat();
      const activeCards = allCards.filter(card => card.isActive === true);

      // Calculate total balance by summing up all account balances
      const totalBalance = accountsRes.reduce((sum, account) => {
        // Ensure we're working with a number and handle any potential null/undefined values
        const balance = parseFloat(account?.balance) || 0;
        return sum + balance;
      }, 0);
      
      console.log('Account balances:', accountsRes.map(acc => ({
        id: acc.id,
        balance: acc.balance,
        accountNumber: acc.accountNumber
      })));
      console.log('Calculated total balance:', totalBalance);

      // Calculate card summary
      const totalSpendingLimit = activeCards.reduce((sum, card) => 
        sum + (parseFloat(card?.spendingLimit) || 0), 0);
        
      const totalAvailableBalance = activeCards.reduce((sum, card) => 
        sum + (parseFloat(card?.availableBalance) || 0), 0);
        
      const activeCardsCount = activeCards.length;
        
      const spendingPercentage = totalSpendingLimit > 0 ? 
        Math.round(((totalSpendingLimit - totalAvailableBalance) / totalSpendingLimit) * 100) : 0;

      // Calculate monthly summary
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = Array.isArray(transactionsRes) ? transactionsRes.filter(tx => {
        if (!tx || !tx.date) return false;
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      }) : [];
      
      const totalIncome = monthlyTransactions
        .filter(tx => tx && (tx.type === 'credit' || tx.type === 'income'))
        .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);
        
      const totalExpenses = monthlyTransactions
        .filter(tx => tx && (tx.type === 'debit' || tx.type === 'expense'))
        .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);

      setSummaryData({
        totalBalance,
        totalSpendingLimit,
        activeCardsCount,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses,
        spendingPercentage,
        totalAvailableBalance,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load summary data. Please try again later.'
      }));
    }
  }, [userId]);

  // Set up auto-refresh for summary data
  useEffect(() => {
    // Initial fetch
    fetchSummaryData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchSummaryData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSummaryData]);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showBillPayModal, setShowBillPayModal] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState('electricity');
  const navigate = useNavigate();

  // Fetch latest data
  const fetchLatestData = useCallback(async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        accountsAPI.fetchBankAccounts(userId),
        transactionsAPI.getUserTransactions(userId)
      ]);
      
      // Sort transactions by date (newest first) and get the 4 most recent
      const sortedTransactions = [...transactionsData].sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedTransactions.slice(0, 4));
      
      setAccounts(accountsData);
      
      // Extract all cards from accounts
      const allCards = accountsData.flatMap(account => account.cards || []);
      setCards(allCards);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Handle quick actions
  const handleQuickAction = (action) => {
    if (!userId) {
      toast.error('Please log in to perform this action');
      return;
    }

    switch (action) {
      case 'transfer':
        setShowTransferModal(true);
        break;
        
      case 'bills':
        setShowBillPayModal(true);
        break;
        
      case 'recharge':
        setShowRechargeModal(true);
        break;
        
      case 'card':
        // In a real app, this would open card services
        toast.info('Card services coming soon!');
        break;
        
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  // Handle successful bill payment
  const handleBillPaymentSuccess = (updatedAccount) => {
    console.log('Payment successful, updating UI with:', updatedAccount);
    
    if (!updatedAccount || !updatedAccount.id) {
      console.error('Invalid account data received:', updatedAccount);
      toast.error('Error updating account information');
      return;
    }

    // Update the account in the local state
    setAccounts(prevAccounts => {
      const updatedAccounts = prevAccounts.map(acc => 
        acc.id === updatedAccount.id 
          ? { 
              ...acc, 
              balance: updatedAccount.balance,
              // Preserve existing metadata while updating with new values
              metadata: {
                ...(acc.metadata || {}),
                ...(updatedAccount.metadata || {})
              }
            } 
          : acc
      );
      console.log('Updated accounts:', updatedAccounts);
      return updatedAccounts;
    });
    
    // If payment was made via card, update the card's available balance
    if (updatedAccount.metadata?.cardId) {
      setCards(prevCards => {
        const updatedCards = prevCards.map(card => 
          card.id === updatedAccount.metadata.cardId 
            ? { 
                ...card, 
                availableBalance: updatedAccount.balance,
                // Update the last used date for sorting
                lastUsed: new Date().toISOString(),
                // Update card's account balance
                accountBalance: updatedAccount.balance
              } 
            : card
        );
        console.log('Updated cards:', updatedCards);
        return updatedCards;
      });
    }
    
    // Refresh transactions to show the new payment
    fetchLatestData();
    
    // Show success message
    toast.success('Bill payment successful!');
    setShowBillPayModal(false);
  };

  // Handle quick bill payment for common bill types
  const handleQuickBillPayment = (billType) => {
    if (!accounts.length) {
      toast.error('No accounts available for payment');
      return;
    }
    
    // In a real app, you might want to pre-fill some bill details based on the bill type
    // For now, we'll just show the bill pay modal with the selected bill type
    setSelectedBillType(billType);
    setShowBillPayModal(true);
  };

  // Handle transfer completion
  const handleTransferComplete = () => {
    fetchLatestData();
    toast.success('Transfer completed successfully!');
  };

  // Quick actions
  const quickActions = [
    { 
      id: 1, 
      title: 'Transfer Money', 
      icon: <FaExchangeAlt size={20} />, 
      variant: 'primary',
      action: 'transfer',
      description: 'Send money to any bank account or UPI ID'
    },
    { 
      id: 2, 
      title: 'Pay Bills', 
      icon: <FaFileInvoiceDollar size={20} />, 
      variant: 'success',
      action: 'bills',
      description: 'Pay utility bills and recharges'
    },
    { 
      id: 3, 
      title: 'Mobile Recharge', 
      icon: <FaMobileAlt size={20} />, 
      variant: 'info',
      action: 'recharge',
      description: 'Recharge prepaid mobile or DTH'
    },
    { 
      id: 4, 
      title: 'Card Services', 
      icon: <FaCreditCard size={20} />, 
      variant: 'warning',
      action: 'card',
      description: 'Manage your cards and transactions'
    }
  ];

  // Handle view account details
  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  // Render modals
  const renderModals = () => {
    return (
      <>
        <TransferModal 
          show={showTransferModal} 
          onHide={() => setShowTransferModal(false)} 
          accounts={accounts}
          userId={userId}
          onTransferComplete={fetchLatestData}
        />
        
        <BillPayModal 
          show={showBillPayModal}
          onHide={() => setShowBillPayModal(false)}
          accounts={accounts}
          cards={cards}
          onPaymentSuccess={handleBillPaymentSuccess}
          defaultBillType={selectedBillType}
        />
        
        {/* Account Details Modal */}
        {selectedAccount && (
          <Modal show={showAccountDetails} onHide={() => setShowAccountDetails(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Account Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-4">
                <h5 className="text-muted mb-3">{selectedAccount.accountType} Account</h5>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-muted mb-1">Account Number</p>
                    <h5>{selectedAccount.accountNumber}</h5>
                  </div>
                  <div className="text-end">
                    <p className="text-muted mb-1">Available Balance</p>
                    <h4 className="text-primary">
                      {formatCurrency(selectedAccount.balance, selectedAccount.currency || 'INR')}
                    </h4>
                  </div>
                </div>
                
                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 small">Bank Name</p>
                      <p className="mb-0">{selectedAccount.bankName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 small">Branch</p>
                      <p className="mb-0">{selectedAccount.branch || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 small">IFSC Code</p>
                      <p className="mb-0">{selectedAccount.ifsc || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 small">Account Status</p>
                      <p className="mb-0">
                        {selectedAccount.isActive ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="secondary">Inactive</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 small">Account Opened</p>
                      <p className="mb-0">
                        {selectedAccount.createdAt 
                          ? new Date(selectedAccount.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="mb-3">Linked Cards</h6>
                {cards.filter(card => card.accountId === selectedAccount.id).length > 0 ? (
                  <ListGroup variant="flush">
                    {cards
                      .filter(card => card.accountId === selectedAccount.id)
                      .map(card => (
                        <ListGroup.Item key={card.id} className="px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0 fw-medium">
                                {card.cardNetwork} {card.cardType}
                              </p>
                              <small className="text-muted">
                                •••• {card.cardNumber.slice(-4)} | 
                                {card.isVirtual ? ' Virtual' : ' Physical'} Card
                              </small>
                            </div>
                            <div>
                              <Badge bg={card.isActive ? 'success' : 'secondary'} className="me-2">
                                {card.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-3 text-muted">
                    <FaCreditCard size={24} className="mb-2" />
                    <p className="mb-0">No cards linked to this account</p>
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAccountDetails(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </>
    );
  };

  // Security alerts
  const securityAlerts = [
    { id: 1, message: 'Last login: Today at 10:30 AM', type: 'info' },
    { id: 2, message: 'Update your password for better security', type: 'warning' },
  ];

  // Recent offers
  const offers = [
    { id: 1, title: '5% Cashback on UPI Payments', description: 'Use code UPI5' },
    { id: 2, title: 'Special Loan Offer', description: 'Get pre-approved personal loan at 10.5% p.a.' },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="w-100">
      {/* Welcome Section */}
      {/* <div className="px-3 pt-3">
        <h2 className="mb-0">Hello, {user.name || 'User'}</h2>
        <p className="text-muted mb-0">Welcome back to your dashboard</p>
      </div> */}

      {/* Render Modals */}
      {renderModals()}

      {/* Main Content */}
      <Container fluid className="px-0">
        {/* Account Summary Section */}
        <Row className="mb-4">
          {summaryData.isLoading ? (
            // Loading state
            [1, 2, 3].map((i) => (
              <Col key={i} xs={12} sm={6} lg={4} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-light p-3 rounded-circle">
                        <div className="placeholder-glow">
                          <div className="placeholder" style={{ width: '24px', height: '24px' }}></div>
                        </div>
                      </div>
                      <div className="text-end w-75">
                        <div className="placeholder-glow">
                          <span className="placeholder col-6"></span>
                          <h4 className="mt-2">
                            <span className="placeholder col-8"></span>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : summaryData.error ? (
            // Error state
            <Col xs={12}>
              <Alert variant="danger">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="alert-heading mb-1">Error Loading Summary</h6>
                    <p className="mb-0">{summaryData.error}</p>
                  </div>
                </div>
              </Alert>
            </Col>
          ) : (
            // Account Summary Cards
            <>
              {/* Total Balance Card */}
              <Col xs={12} sm={6} lg={4} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <FaWallet className="text-success" size={24} />
                      </div>
                      <div className="text-end">
                        <h6 className="text-muted mb-1">Total Balance</h6>
                        <h4 className="mb-0">{formatCurrency(summaryData.totalBalance, 'INR')}</h4>
                        <small className="text-muted">Across all accounts</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Spending Limit Card */}
              <Col xs={12} sm={6} lg={4} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <FaCreditCard className="text-primary" size={24} />
                      </div>
                      <div className="text-end">
                        <h6 className="text-muted mb-1">Spending Limit</h6>
                        <h4 className="mb-1">{formatCurrency(summaryData.totalSpendingLimit, 'INR')}</h4>
                        <div className="mt-2">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Available: {formatCurrency(summaryData.totalAvailableBalance, 'INR')}</span>
                            <span>{summaryData.spendingPercentage}% Used</span>
                          </div>
                          <ProgressBar 
                            now={summaryData.spendingPercentage} 
                            variant="primary"
                            className="rounded-pill" 
                            style={{ height: '6px' }} 
                          />
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Active Cards Card */}
              <Col xs={12} sm={6} lg={4} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <FaCreditCard className="text-info" size={24} />
                      </div>
                      <div className="text-end">
                        <h6 className="text-muted mb-1">Active Cards</h6>
                        <h4 className="mb-0">{summaryData.activeCardsCount}</h4>
                        <small className="text-muted">
                          {summaryData.activeCardsCount === 1 ? 'Card' : 'Cards'} linked to your accounts
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}
        </Row>

        <Row>
          {/* Left Column */}
          <Col lg={8} className="mb-4">
            {/* Account Summary */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">Account Summary</h5>
              </Card.Header>
              <Card.Body>
                <Tab.Container defaultActiveKey={accounts[0]?.id}>
                  <Nav variant="tabs" className="mb-3">
                    {accounts.map((account) => (
                      <Nav.Item key={account.id}>
                        <Nav.Link eventKey={account.id}>
                          {account.accountType}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                  
                  <Tab.Content>
                    {accounts.map((account) => (
                      <Tab.Pane key={account.id} eventKey={account.id}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <h6 className="text-muted mb-1">Account Number</h6>
                            <p className="mb-0">•••• {account.accountNumber?.slice(-4)}</p>
                          </div>
                          <div className="text-end">
                            <h6 className="text-muted mb-1">Available Balance</h6>
                            <h4 className="mb-0">{formatCurrency(account.balance, account.currency)}</h4>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewDetails(account)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => {
                              // Navigate to transactions page with account filter
                              navigate(`/dashboard/transactions?accountId=${account.id}`);
                            }}
                          >
                            Transactions
                          </Button>
                        </div>
                      </Tab.Pane>
                    ))}
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Transactions</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-decoration-none"
                  onClick={() => navigate('/dashboard/transactions')}
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {transactions.length > 0 ? (
                  <ListGroup variant="flush">
                    {transactions.map((txn) => (
                      <ListGroup.Item key={txn.id} className="px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className={`p-2 rounded-circle ${txn.type === 'credit' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                              {txn.type === 'credit' ? (
                                <FaExchangeAlt className="text-success" />
                              ) : (
                                <FaShoppingCart className="text-danger" />
                              )}
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-0">{txn.description}</h6>
                              <small className="text-muted">
                                {new Date(txn.date).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                          <div className={`text-end ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                            <strong>{txn.type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency)}</strong>
                            <div className="text-muted small">
                              {txn.status === 'completed' ? (
                                <span className="text-success">Completed</span>
                              ) : (
                                <span className="text-warning">Pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No recent transactions found</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column */}
          <Col lg={4}>
            {/* Quick Actions */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-3">
                  {quickActions.map((action) => (
                    <Col key={action.id} xs={6}>
                      <Button 
                        variant={`outline-${action.variant}`} 
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2"
                        onClick={() => handleQuickAction(action.action)}
                        disabled={isProcessingPayment}
                        style={{ minHeight: '100px' }}
                      >
                        {action.icon}
                        <span className="small mt-2">{action.title}</span>
                      </Button>
                    </Col>
                  ))}
                </Row>
                
                {/* Bill Payment Quick Actions */}
                {showBillPayModal && (
                  <div className="mt-4">
                    <h6 className="mb-3">Common Bills</h6>
                    <Row className="g-2">
                      <Col xs={6} sm={4} md={3}>
                        <Button 
                          variant="outline-danger" 
                          className="w-100 d-flex align-items-center justify-content-start p-2"
                          onClick={() => handleQuickBillPayment('electricity')}
                        >
                          <FaBolt className="me-2" />
                          <span>Electricity</span>
                        </Button>
                      </Col>
                      <Col xs={6} sm={4} md={3}>
                        <Button 
                          variant="outline-primary" 
                          className="w-100 d-flex align-items-center justify-content-start p-2"
                          onClick={() => handleQuickBillPayment('mobile')}
                        >
                          <FaMobile className="me-2" />
                          <span>Mobile</span>
                        </Button>
                      </Col>
                      <Col xs={6} sm={4} md={3}>
                        <Button 
                          variant="outline-warning" 
                          className="w-100 d-flex align-items-center justify-content-start p-2"
                          onClick={() => handleQuickBillPayment('gas')}
                        >
                          <FaFire className="me-2" />
                          <span>Gas</span>
                        </Button>
                      </Col>
                      <Col xs={6} sm={4} md={3}>
                        <Button 
                          variant="outline-info" 
                          className="w-100 d-flex align-items-center justify-content-start p-2"
                          onClick={() => handleQuickBillPayment('water')}
                        >
                          <FaTint className="me-2" />
                          <span>Water</span>
                        </Button>
                      </Col>
                      <Col xs={6} sm={4} md={3}>
                        <Button 
                          variant="outline-success" 
                          className="w-100 d-flex align-items-center justify-content-start p-2"
                          onClick={() => handleQuickBillPayment('internet')}
                        >
                          <FaWifi className="me-2" />
                          <span>Internet</span>
                        </Button>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Cards Overview */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Your Cards</h5>
                <Button variant="link" size="sm" className="text-decoration-none">
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {cards.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {cards.slice(0, 2).map((card) => (
                      <div key={card.id} className="p-3 rounded-3" style={{ background: 'linear-gradient(45deg, #2c3e50, #3498db)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div>
                            <h6 className="text-white-50 mb-1">Balance</h6>
                            <h4 className="text-white mb-0">{formatCurrency(card.availableBalance || 0, 'INR')}</h4>
                          </div>
                          <div className="bg-white bg-opacity-25 p-2 rounded">
                            <FaCreditCard className="text-white" />
                          </div>
                        </div>
                        <div className="text-white mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-white-50">Card Number</span>
                            <span>•••• •••• •••• {card.cardNumber?.slice(-4)}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-white-50">Expires</span>
                            <span>{card.expiryDate || '••/••'}</span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-white">{card.cardHolder || 'Card Holder'}</span>
                          <Badge bg={card.isActive === true ? 'success' : 'secondary'}>
                            {card.isActive === true ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No cards found</p>
                    <Button variant="outline-primary" size="sm">Add a Card</Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Security Alerts */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaShieldAlt className="me-2 text-warning" /> Security Alerts
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {securityAlerts.map((alert) => (
                    <ListGroup.Item key={alert.id} className="px-0 py-2 border-0">
                      <div className="d-flex">
                        <div className={`me-3 text-${alert.type === 'warning' ? 'warning' : 'info'}`}>
                          <FaShieldAlt size={20} />
                        </div>
                        <div>
                          <p className="mb-0 small">{alert.message}</p>
                          <Button variant="link" size="sm" className="p-0">View details</Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Offers & Promotions */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaChartPie className="me-2 text-primary" /> Offers & Promotions
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {offers.map((offer) => (
                    <ListGroup.Item key={offer.id} className="px-0 py-2 border-0">
                      <div className="d-flex">
                        <div className="me-3 text-primary">
                          <FaChartPie size={20} />
                        </div>
                        <div>
                          <h6 className="mb-1">{offer.title}</h6>
                          <p className="text-muted small mb-0">{offer.description}</p>
                          <Button variant="link" size="sm" className="p-0">Claim Now</Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;