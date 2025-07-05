import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Container, Row, Col, Card, Button, ListGroup, Spinner, Alert, 
  Modal, Form, Accordion, Badge 
} from 'react-bootstrap';
import { 
  Plus as PlusIcon, 
  CreditCard as CreditCardIcon, 
  Wallet as WalletIcon, 
  Landmark as BankIcon, 
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownLeft as ArrowDownLeftIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ArrowRight as ArrowRightIcon,
  FileText as FileEarmarkText,
} from 'lucide-react';
import { ArrowRepeat } from 'react-bootstrap-icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ToastContainer as ToastifyContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API services
import { accountsAPI, transactionsAPI } from '../services/api';
import api from '../services/api';
import '../styles/addbankaccount.css';

const AccountsPage = () => {
  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);
  console.log('AccountsPage - User from Redux:', user);
  
  // State for UI
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountForCard, setSelectedBankAccountForCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);

  // Fetch data when component mounts or user changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('[AccountsPage] Starting data fetch...');
      
      // Get user ID from Redux store
      const currentUser = user || {};
      const currentUserId = currentUser?.id || currentUser?._id;
      
      console.log('[AccountsPage] Current user from Redux:', currentUser);
      console.log('[AccountsPage] Extracted user ID:', currentUserId);
      
      if (!currentUserId) {
        const errorMsg = 'User ID not available in Redux store, skipping data fetch';
        console.error(errorMsg);
        if (isMounted) {
          setError(errorMsg);
          setLoading(false);
        }
        return;
      }
      
      console.log(`[AccountsPage] Fetching data for user ID: ${currentUserId}`);
      setLoading(true);
      setError('');
      
      try {
        console.log('[AccountsPage] Fetching bank accounts...');
        // Fetch bank accounts with cards
        const accounts = await accountsAPI.fetchBankAccounts(currentUserId);
        console.log('[AccountsPage] Raw accounts data:', accounts);
        
        if (!isMounted) return;
        
        // Format accounts data with proper error handling
        let formattedAccounts = [];
        
        if (Array.isArray(accounts)) {
          formattedAccounts = accounts.map(account => {
            try {
              if (!account) return null;
              
              return {
                ...account,
                id: String(account.id || `acc_${Date.now()}`),
                balance: Number(account.balance) || 0,
                accountNumber: account.accountNumber || '****' + (account.id ? String(account.id).slice(-4) : '0000'),
                accountType: account.accountType || 'Savings',
                bankName: account.bankName || 'Unknown Bank',
                holderName: account.accountName || account.holderName || (currentUser?.name || 'Account Holder'),
                ifsc: account.ifscCode || account.ifsc || 'N/A',
                branch: account.branch || 'N/A',
                openingDate: account.openingDate || new Date().toISOString().split('T')[0],
                color: account.color || '#4e73df',
                currency: account.currency || 'INR',
                isActive: account.isActive !== false,
                cards: Array.isArray(account.cards) ? account.cards.map(card => ({
                  ...card,
                  id: String(card.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
                  cardType: String(card.cardType || 'debit').toLowerCase(),
                  cardNetwork: card.cardNetwork || 'VISA',
                  cardHolder: card.cardHolder || currentUser?.name || 'Card Holder',
                  expiryDate: card.expiryDate || 'MM/YY',
                  isActive: card.isActive !== false
                })) : []
              };
            } catch (e) {
              console.error('Error formatting account:', e);
              return null;
            }
          }).filter(Boolean); // Remove any null entries
        }
        
        console.log('[AccountsPage] Formatted accounts:', formattedAccounts);
        
        if (isMounted) {
          setBankAccounts(formattedAccounts);
          setSelectedBankAccount(formattedAccounts[0] || null);
        }

        // Fetch bank options, card types, and recent transactions in parallel
        console.log('[AccountsPage] Fetching bank options, card types, and recent transactions...');
        try {
          const [bankOptionsRes, cardTypesRes, transactionsRes] = await Promise.all([
            api.get('/bankOptions').catch(e => {
              console.warn('Failed to fetch bank options:', e);
              return { data: [] };
            }),
            api.get('/cardTypes').catch(e => {
              console.warn('Failed to fetch card types:', e);
              return { data: [] };
            }),
            transactionsAPI.getUserTransactions(currentUserId).catch(e => {
              console.warn('Failed to fetch transactions:', e);
              return [];
            })
          ]);
          
          if (isMounted) {
            setBankOptions(Array.isArray(bankOptionsRes?.data) ? bankOptionsRes.data : []);
            setCardTypes(Array.isArray(cardTypesRes?.data) ? cardTypesRes.data : []);
            
            // Sort transactions by date (newest first) and get the 5 most recent
            const sortedTransactions = Array.isArray(transactionsRes) 
              ? [...transactionsRes].sort((a, b) => new Date(b.date) - new Date(a.date))
              : [];
            setRecentTransactions(sortedTransactions.slice(0, 5));
          }
        } catch (e) {
          console.error('Error fetching options:', e);
          // Continue even if these fail
        }
        
      } catch (error) {
        console.error('[AccountsPage] Error fetching data:', error);
        if (isMounted) {
          setError(error.message || 'Failed to load accounts. Please try again later.');
          // Set empty arrays to clear any previous data
          setBankAccounts([]);
          setSelectedBankAccount(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[AccountsPage] Data fetch completed');
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle adding a new bank account
  const handleAddAccount = async (accountData) => {
    try {
      const newAccount = await accountsAPI.addAccount({
        ...accountData,
        userId: user?.id
      });
      
      setBankAccounts(prev => [...prev, newAccount]);
      setShowAddAccountModal(false);
      toast.success('Bank account added successfully!');
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error(error.message || 'Failed to add bank account');
    }
  };

  // Handle adding a new card
  const handleAddCard = async (cardData) => {
    if (!selectedBankAccountForCard) return;
    
    try {
      const newCard = await accountsAPI.addCard({
        ...cardData,
        accountId: selectedBankAccountForCard.id
      });
      const formattedCard = {
        ...newCard,
        id: String(newCard.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
        cardType: String(newCard.cardType || 'debit').toLowerCase(),
        cardNetwork: newCard.cardNetwork || 'VISA',
        cardHolder: newCard.cardHolder || user?.name || 'Card Holder',
        expiryDate: newCard.expiryDate || 'MM/YY',
        isActive: newCard.isActive !== false
      };
      // Update the selected account's cards if it's the one we just added to
      if (selectedBankAccount && selectedBankAccount.id === selectedBankAccountForCard.id) {
        setSelectedBankAccount(prev => ({
          ...prev,
          cards: [...(prev.cards || []), formattedCard]
        }));
      }
      
      // Also update the selectedBankAccountForCard if it's still the same account
      setSelectedBankAccountForCard(prev => {
        if (prev && prev.id === selectedBankAccountForCard.id) {
          return {
            ...prev,
            cards: [...(prev.cards || []), formattedCard]
          };
        }
        return prev;
      });
      
      setShowAddCardModal(false);
      toast.success('Card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error(error.message || 'Failed to add card');
    } finally {
      // Reset the selected account for card addition
      setSelectedBankAccountForCard(null);
    }
  };

  // Log the current state for debugging
  console.log('[AccountsPage] Render state:', {
    loading,
    error,
    bankAccountsCount: bankAccounts?.length || 0,
    user: user ? 'User exists' : 'No user',
    userId: user?.id || user?._id || 'No user ID'
  });

  return (
    <Container className="py-4">
      <ToastifyContainer position="top-right" autoClose={5000} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <h2>My Accounts</h2> */}
        <Button 
          variant="primary"
          onClick={() => setShowAddAccountModal(true)}
          disabled={loading}
        >
          <PlusIcon size={16} className="me-1" /> Add Account
        </Button>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading your accounts...</p>
          <small className="text-muted">Please wait while we fetch your data</small>
        </div>
      )}
      
      {/* Error State */}
      {!loading && error && (
        <Alert variant="danger" className="mt-3">
          <Alert.Heading className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error Loading Accounts
          </Alert.Heading>
          <p className="mb-3">{error}</p>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              <ArrowRepeat size={14} className="me-1" /> Refresh Page
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                setError('');
                setLoading(true);
                // Retry fetching data
                const fetchData = async () => {
                  try {
                    const accounts = await accountsAPI.fetchBankAccounts(user?.id || user?._id);
                    setBankAccounts(accounts || []);
                    setError('');
                  } catch (err) {
                    console.error('Retry failed:', err);
                    setError(err.message || 'Failed to load accounts. Please try again later.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchData();
              }}
            >
              <i className="fas fa-sync me-1"></i> Retry
            </Button>
          </div>
        </Alert>
      )}
      
      {/* Empty State - No Bank Accounts */}
      {!loading && !error && (!bankAccounts || bankAccounts.length === 0) && (
        <div className="text-center py-5">
          <div className="position-relative d-inline-block mb-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center" 
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                margin: '0 auto 1rem'
              }}
            >
              <WalletIcon size={48} className="text-primary" />
            </div>
          </div>
          <h4 className="mb-3">No Bank Accounts Found</h4>
          <p className="text-muted mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            You haven't added any bank accounts yet. Get started by linking your first bank account to view your transactions and manage your finances in one place.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              variant="primary" 
              onClick={() => setShowAddAccountModal(true)}
              className="px-4 py-2 d-flex align-items-center"
              size="lg"
            >
              <PlusIcon size={18} className="me-2" /> Add Bank Account
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => window.location.reload()}
              className="py-2 d-flex align-items-center"
              size="lg"
            >
              <ArrowRepeat size={18} className="me-2" /> Refresh
            </Button>
          </div>
          
          <div className="mt-5">
            <h6 className="text-muted mb-3">Why add a bank account?</h6>
            <Row className="justify-content-center g-4">
              <Col md={4} className="text-center">
                <div className="p-3 rounded-3 bg-light h-100">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <h6 className="mb-2">Easy Transfers</h6>
                  <p className="small text-muted mb-0">Transfer money between your accounts instantly</p>
                </div>
              </Col>
              <Col md={4} className="text-center">
                <div className="p-3 rounded-3 bg-light h-100">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h6 className="mb-2">Track Spending</h6>
                  <p className="small text-muted mb-0">Monitor your expenses and income in one place</p>
                </div>
              </Col>
              <Col md={4} className="text-center">
                <div className="p-3 rounded-3 bg-light h-100">
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-bell"></i>
                  </div>
                  <h6 className="mb-2">Stay Updated</h6>
                  <p className="small text-muted mb-0">Get real-time notifications for all transactions</p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}
      
      {/* Success State */}
      {!loading && !error && bankAccounts && bankAccounts.length > 0 && (
        <Row className="g-4">
          {/* Bank Accounts List */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">My Bank Accounts</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowAddAccountModal(true)}
                >
                  <PlusIcon size={14} className="me-1" /> Add Account
                </Button>
              </Card.Header>
              <Card.Body>
                <Accordion defaultActiveKey="0" className="accounts-accordion">
                  {bankAccounts
                    .filter(account => account) // Filter out any null/undefined accounts
                    .map((account, index) => {
                      if (!account) return null;
                      
                      const accountId = account.id || `acc-${index}`;
                      const bankName = account.bankName || 'Bank Account';
                      const accountNumber = account.accountNumber ? 
                        String(account.accountNumber).slice(-4) : '••••';
                      const balance = Number(account.balance) || 0;
                      const currency = account.currency || 'INR';
                      const accountType = account.accountType ? 
                        account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1) : 
                        'Account';
                      const color = account.color || '#4e73df';
                      
                      return (
                        <Accordion.Item 
                          eventKey={String(index)} 
                          key={accountId}
                          className="mb-3 border-0 rounded-3 overflow-hidden"
                        >
                          <Accordion.Header className="bg-white">
                            <div className="d-flex align-items-center w-100">
                              <div className="me-3 d-flex align-items-center" style={{ width: '44px' }}>
                                <div 
                                  className="d-flex align-items-center justify-content-center rounded-circle" 
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    backgroundColor: `${color}15`, // Add opacity to the color
                                    color: color
                                  }}
                                >
                                  <i className={`fas fa-university fa-lg`}></i>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-0 d-flex align-items-center">
                                  {bankName}
                                  {account.isActive === false && (
                                    <Badge bg="secondary" className="ms-2" pill>Inactive</Badge>
                                  )}
                                </h6>
                                <small className="text-muted d-flex align-items-center">
                                  <span className="me-2">•••• {accountNumber}</span>
                                  <span className="text-uppercase">{accountType}</span>
                                </small>
                              </div>
                              <div className="text-end">
                                <h6 className="mb-0">{formatCurrency(balance, currency)}</h6>
                                <small className="text-muted">
                                  {account.updatedAt 
                                    ? `Updated ${formatDate(account.updatedAt, 'MMM d, yyyy')}` 
                                    : 'No recent updates'}
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <ListGroup variant="flush">
                          {/* Account Details */}
                          <ListGroup.Item>
                            <div className="p-3">
                              <h6 className="d-flex align-items-center">
                                <i className="fas fa-info-circle me-2" style={{ color: color }}></i>
                                Account Details
                              </h6>
                              <div className="row mt-3">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Account Holder</p>
                                    <p className="mb-0">{account.holderName || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Account Number</p>
                                    <p className="mb-0">
                                      {account.accountNumber || '•••• •••• •••• ••••'}
                                    </p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">IFSC Code</p>
                                    <p className="mb-0">{account.ifsc || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Account Status</p>
                                    <div>
                                      <Badge 
                                        bg={account.isActive !== false ? 'success' : 'secondary'}
                                        className="text-capitalize"
                                      >
                                        {account.isActive !== false ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Account Type</p>
                                    <p className="mb-0 text-capitalize">
                                      {accountType}
                                    </p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Branch</p>
                                    <p className="mb-0">{account.branch || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Opened On</p>
                                    <p className="mb-0">
                                      {account.openingDate 
                                        ? formatDate(account.openingDate, 'MMM d, yyyy') 
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className="text-muted small mb-1">Current Balance</p>
                                    <h5 className="mb-0" style={{ color: color }}>
                                      {formatCurrency(balance, currency)}
                                    </h5>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 d-flex justify-content-end">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="me-2"
                                  onClick={() => {
                                    // Handle view transactions
                                    console.log('View transactions for account:', accountId);
                                  }}
                                >
                                  <i className="fas fa-exchange-alt me-1"></i> View Transactions
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => {
                                    // Handle view statements
                                    console.log('View statements for account:', accountId);
                                  }}
                                >
                                  <i className="fas fa-file-invoice me-1"></i> Statements
                                </Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                          
                          {/* Cards */}
                          <ListGroup.Item className="border-top">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0">Cards</h6>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => {
                                  setSelectedBankAccountForCard(account);
                                  setShowAddCardModal(true);
                                }}
                              >
                                <PlusIcon size={14} className="me-1" /> Add Card
                              </Button>
                            </div>
                            
                            {Array.isArray(account.cards) && account.cards.length > 0 ? (
                              <Row className="g-3">
                                {account.cards
                                  .filter(card => card) // Filter out any null/undefined cards
                                  .map((card, idx) => {
                                    if (!card) return null;
                                    
                                    const cardId = card.id || `card-${idx}`;
                                    const cardType = card.cardType || 'debit';
                                    const cardNetwork = card.cardNetwork || 'visa';
                                    const lastFour = card.cardNumber ? String(card.cardNumber).slice(-4) : '••••';
                                    const isActive = card.isActive !== false;
                                    
                                    return (
                                      <Col md={6} key={cardId}>
                                        <Card className="border-0 shadow-sm h-100">
                                          <Card.Body className="d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                              <div>
                                                <h6 className="mb-1 d-flex align-items-center">
                                                  <span className="text-capitalize">{cardType}</span> Card
                                                  <Badge 
                                                    bg={isActive ? 'success' : 'secondary'} 
                                                    className="ms-2"
                                                  >
                                                    {isActive ? 'Active' : 'Inactive'}
                                                  </Badge>
                                                </h6>
                                                <p className="text-muted mb-0">
                                                  •••• •••• •••• {lastFour}
                                                </p>
                                              </div>
                                              <i 
                                                className={`fab fa-${cardNetwork.toLowerCase() === 'mastercard' ? 'cc-mastercard' : 'cc-visa'} fa-2x`}
                                                style={{ 
                                                  color: cardNetwork.toLowerCase() === 'mastercard' ? '#eb001b' : '#1a1f71' 
                                                }}
                                                aria-label={`${cardNetwork} card`}
                                              ></i>
                                            </div>
                                            <div className="mt-auto">
                                              <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                  <p className="text-muted small mb-1">Card Holder</p>
                                                  <p className="mb-0 text-truncate" style={{ maxWidth: '120px' }} 
                                                     title={card.cardHolder || 'Card Holder'}>
                                                    {card.cardHolder || 'N/A'}
                                                  </p>
                                                </div>
                                                <div className="text-end">
                                                  <p className="text-muted small mb-1">Expires</p>
                                                  <p className="mb-0">
                                                    {card.expiryDate || '••/••'}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    );
                                  })}
                              </Row>
                            ) : (
                              <div className="text-center py-5 px-3">
                                <div className="position-relative d-inline-block mb-3">
                                  <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center" 
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                      margin: '0 auto 1rem'
                                    }}
                                  >
                                    <CreditCardIcon size={36} className="text-primary" />
                                  </div>
                                </div>
                                <h6 className="mb-2">No Cards Found</h6>
                                <p className="text-muted mb-4" style={{ maxWidth: '300px', margin: '0 auto' }}>
                                  You haven't added any cards to this account. Add a card to make payments and online transactions.
                                </p>
                                <Button 
                                  variant="primary" 
                                  size="md"
                                  className="px-4 d-inline-flex align-items-center"
                                  onClick={() => {
                                    setSelectedBankAccountForCard(account);
                                    setShowAddCardModal(true);
                                  }}
                                >
                                  <PlusIcon size={16} className="me-2" /> Add New Card
                                </Button>
                                
                                <div className="mt-4 pt-3 border-top">
                                  <p className="small text-muted mb-2">Need help with cards?</p>
                                  <div className="d-flex justify-content-center gap-2">
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="p-0 text-decoration-none"
                                      onClick={() => {
                                        // Handle card benefits click
                                        console.log('View card benefits');
                                      }}
                                    >
                                      <i className="fas fa-gift me-1"></i> Benefits
                                    </Button>
                                    <span className="text-muted">•</span>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="p-0 text-decoration-none"
                                      onClick={() => {
                                        // Handle card security click
                                        console.log('View card security info');
                                      }}
                                    >
                                      <i className="fas fa-shield-alt me-1"></i> Security
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </ListGroup.Item>
                          
                          {/* Quick Actions */}
                          <ListGroup.Item className="border-top">
                            <div className="d-flex justify-content-between">
                              <Button variant="outline-secondary" size="sm">
                                <ArrowUpRightIcon size={14} className="me-1" /> Transfer
                              </Button>
                              <Button variant="outline-secondary" size="sm">
                                <ArrowDownLeftIcon size={14} className="me-1" /> Request
                              </Button>
                              <Button variant="outline-secondary" size="sm">
                                <ArrowRepeat size={14} className="me-1" /> Statement
                              </Button>
                              <Button variant="outline-secondary" size="sm">
                                <MoreHorizontalIcon size={14} />
                              </Button>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Accordion.Body>
                    </Accordion.Item>
                      );
                    })}
                </Accordion>
              </Card.Body>
            </Card>

            {/* Recent Transactions */}
            {/* <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Recent Transactions</h5>
                  <Button variant="link" className="text-decoration-none p-0">
                    View All <ArrowRightIcon size={16} className="ms-1" />
                  </Button>
                </div>
                
                {transactions.length > 0 ? (
                  <ListGroup variant="flush">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <ListGroup.Item key={index} className="px-0">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            {transaction.amount > 0 ? (
                              <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                                <ArrowDownLeftIcon size={20} className="text-success" />
                              </div>
                            ) : (
                              <div className="bg-danger bg-opacity-10 p-2 rounded-circle">
                                <ArrowUpRightIcon size={20} className="text-danger" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0">{transaction.description || 'Transaction'}</h6>
                            <small className="text-muted">
                              {transaction.date ? formatDate(transaction.date) : 'N/A'}
                              {transaction.category && ` • ${transaction.category}`}
                            </small>
                          </div>
                          <div className="text-end">
                            <h6 className={`mb-0 ${transaction.amount > 0 ? 'text-success' : 'text-dark'}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount || 0, transaction.currency)}
                            </h6>
                            <small className="text-muted">
                              {transaction.cardNumber ? `•••• ${transaction.cardNumber.slice(-4)}` : 'Bank Transfer'}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4">
                    <FileEarmarkText size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No recent transactions</p>
                  </div>
                )}
              </Card.Body>
            </Card> */}
          </Col>
          
          {/* Right Column */}
          <Col lg={4}>
            {/* Recent Transactions */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Transactions</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-decoration-none p-0"
                  onClick={() => window.location.href = '/dashboard/transactions'}
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {recentTransactions.length > 0 ? (
                  <ListGroup variant="flush">
                    {recentTransactions.map((txn) => (
                      <ListGroup.Item key={txn.id} className="px-3 py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className={`p-2 rounded-circle ${txn.type === 'credit' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                              {txn.type === 'credit' ? (
                                <i className="fas fa-arrow-down text-success"></i>
                              ) : (
                                <i className="fas fa-arrow-up text-danger"></i>
                              )}
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>{txn.description || 'Transaction'}</h6>
                              <small className="text-muted">
                                {txn.date ? formatDate(txn.date, 'MMM d, yyyy') : 'N/A'}
                              </small>
                            </div>
                          </div>
                          <div className={`text-end ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                            <strong>{txn.type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency || 'INR')}</strong>
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
                    <p className="text-muted">No recent transactions</p>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            {/* Quick Transfer */}
            {/* <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Quick Transfer</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>From Account</Form.Label>
                    <Form.Select>
                      <option>Select account</option>
                      {bankAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} •••• {account.accountNumber?.slice(-4) || '••••'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>To Account</Form.Label>
                    <Form.Control type="text" placeholder="Enter account number" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control type="number" placeholder="0.00" />
                  </Form.Group>
                  
                  <Button variant="primary" className="w-100">
                    Transfer Now
                  </Button>
                </Form>
              </Card.Body>
            </Card> */}
            
            {/* Account Summary */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Account Summary</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span>Total Balance</span>
                    <span className="fw-bold">
                      {formatCurrency(
                        bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
                        bankAccounts[0]?.currency || 'INR'
                      )}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span>Total Accounts</span>
                    <span className="fw-bold">{bankAccounts.length}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span>Total Cards</span>
                    <span className="fw-bold">
                      {bankAccounts.reduce((sum, acc) => sum + (acc.cards?.length || 0), 0)}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Add Account Modal */}
      <Modal show={showAddAccountModal} onHide={() => setShowAddAccountModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Bank Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleAddAccount({
              bankName: formData.get('bankName'),
              accountNumber: formData.get('accountNumber'),
              accountType: formData.get('accountType'),
              holderName: formData.get('holderName'),
              ifsc: formData.get('ifsc'),
              branch: formData.get('branch'),
              openingDate: formData.get('openingDate'),
              balance: parseFloat(formData.get('balance')) || 0,
              currency: formData.get('currency') || 'INR'
            });
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control 
                type="text" 
                name="bankName" 
                placeholder="e.g., State Bank of India" 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control 
                type="text" 
                name="accountNumber" 
                placeholder="Enter account number" 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Account Type</Form.Label>
              <Form.Select name="accountType" required>
                <option value="">Select account type</option>
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
                <option value="salary">Salary Account</option>
                <option value="nri">NRI Account</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control 
                type="text" 
                name="holderName" 
                placeholder="Enter account holder name" 
                defaultValue={user?.name || ''}
                required 
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="ifsc" 
                    placeholder="e.g., SBIN0001234" 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="branch" 
                    placeholder="Branch name" 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Opening Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="openingDate" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Initial Balance</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="balance" 
                    placeholder="0.00" 
                    step="0.01"
                    min="0"
                    defaultValue="0.00"
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select name="currency" defaultValue="INR">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-grid gap-2 mt-4">
              <Button variant="primary" type="submit">
                Add Account
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Add Card Modal */}
      <Modal show={showAddCardModal} onHide={() => setShowAddCardModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBankAccountForCard && (
            <Form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddCard({
                cardNumber: formData.get('cardNumber'),
                cardType: formData.get('cardType'),
                cardNetwork: formData.get('cardNetwork'),
                cardHolder: formData.get('cardHolder'),
                expiryDate: formData.get('expiryDate'),
                cvv: formData.get('cvv'),
                isActive: formData.get('isActive') === 'true',
                isCreditCard: formData.get('cardType') === 'credit',
                creditLimit: formData.get('creditLimit') ? parseFloat(formData.get('creditLimit')) : undefined
              });
            }}>
              <Form.Group className="mb-3">
                <Form.Label>Card Number</Form.Label>
                <Form.Control 
                  type="text" 
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  required 
                  maxLength="19"
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Card Type</Form.Label>
                    <Form.Select name="cardType" required>
                      <option value="debit">Debit Card</option>
                      <option value="credit">Credit Card</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Card Network</Form.Label>
                    <Form.Select name="cardNetwork" required>
                      <option value="VISA">VISA</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="RuPay">RuPay</option>
                      <option value="American Express">American Express</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Card Holder Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="cardHolder" 
                  placeholder="Card Holder Name" 
                  defaultValue={user?.name || ''}
                  required 
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control 
                      type="month" 
                      name="expiryDate" 
                      placeholder="MM/YY" 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CVV</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="cvv" 
                      placeholder="•••" 
                      maxLength="4"
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox" 
                  name="isActive" 
                  label="Activate this card" 
                  defaultChecked 
                  value="true"
                />
              </Form.Group>
              
              <div id="creditLimitField" className="mb-3" style={{ display: 'none' }}>
                <Form.Group>
                  <Form.Label>Credit Limit</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="creditLimit" 
                    placeholder="Enter credit limit" 
                    min="0"
                    step="1000"
                  />
                </Form.Group>
              </div>
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" type="submit">
                  Add Card
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AccountsPage;
