import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { accountsAPI } from '../services/api';
import { toast } from 'react-toastify';

const BillPayModal = ({ show, onHide, accounts, cards = [], onPaymentSuccess, defaultBillType = 'electricity' }) => {
  const [paymentSource, setPaymentSource] = useState('account'); // 'account' or 'card'
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [billType, setBillType] = useState(defaultBillType);
  const [billNumber, setBillNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const billTypes = [
    { value: 'electricity', label: 'Electricity Bill' },
    { value: 'mobile', label: 'Mobile Recharge' },
    { value: 'gas', label: 'Gas Bill' },
    { value: 'water', label: 'Water Bill' },
    { value: 'internet', label: 'Internet Bill' },
  ];

  // Function to generate a bill/reference number based on bill type
  const generateBillNumber = (type) => {
    const prefixMap = {
      electricity: 'ELEC',
      mobile: 'MOB',
      gas: 'GAS',
      water: 'WTR',
      internet: 'NET'
    };
    
    const prefix = prefixMap[type] || 'BILL';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
    return `${prefix}${randomNum}`;
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (show) {
      // Set default account/card selection
      setSelectedAccount(accounts[0]?.id || '');
      setSelectedCard(cards[0]?.id || '');
      // Reset form fields
      setBillType(defaultBillType);
      setBillNumber(generateBillNumber(defaultBillType));
      setAmount('');
      setBillDate(new Date().toISOString().split('T')[0]);
      setError('');
      
      // Log available cards for debugging
      console.log('Available cards:', cards);
    }
  }, [show, defaultBillType, accounts, cards]);

  // Update bill number when bill type changes
  useEffect(() => {
    if (show) {
      setBillNumber(generateBillNumber(billType));
    }
  }, [billType, show]);

  const validateForm = () => {
    // Clear previous errors
    setError('');
    
    // Validate payment source
    if (paymentSource === 'card') {
      if (!selectedCard) {
        setError('Please select a card for payment');
        return false;
      }
    } else {
      if (!selectedAccount) {
        setError('Please select an account');
        return false;
      }
    }
    
    // Validate bill number
    if (!billNumber || billNumber.trim() === '') {
      setError('Please enter a valid bill/reference number');
      return false;
    }
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    
    // Additional validation for bill number based on bill type
    if (billType === 'mobile' && !/^\d{10}$/.test(billNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    if (billType === 'electricity' && !/^[A-Za-z0-9]{10,15}$/.test(billNumber)) {
      setError('Please enter a valid electricity bill number (10-15 alphanumeric characters)');
      return false;
    }
    
    // Check if selected card has sufficient limit
    if (paymentSource === 'card' && selectedCard) {
      const card = cards.find(c => c.id === selectedCard);
      if (card) {
        // For debit cards, use availableBalance or spendingLimit
        // For credit cards, use availableCredit or creditLimit
        let availableBalance = 0;
        
        if (card.isCreditCard) {
          availableBalance = parseFloat(
            card.availableCredit || 
            card.creditLimit || 
            0
          );
        } else {
          // For debit cards, use availableBalance or spendingLimit
          availableBalance = parseFloat(
            card.availableBalance !== undefined ? card.availableBalance :
            card.spendingLimit !== undefined ? card.spendingLimit :
            0
          );
        }
        
        console.log('Card balance check:', {
          cardId: card.id,
          cardType: card.cardType,
          isCreditCard: card.isCreditCard,
          availableBalance,
          amountValue,
          cardData: card
        });
        
        if (availableBalance < amountValue) {
          setError(`Insufficient balance. Available: ₹${availableBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let accountId = selectedAccount;
      let selectedCardData = null;
      let paymentSourceValue = 'account';
      
      if (paymentSource === 'card') {
        // Find the selected card to get its associated account ID
        selectedCardData = cards.find(card => card.id === selectedCard);
        if (!selectedCardData) {
          throw new Error('Selected card not found');
        }
        if (!selectedCardData.accountId) {
          throw new Error('Selected card is not associated with any account');
        }
        accountId = selectedCardData.accountId;
        paymentSourceValue = 'card';
      }

      // Ensure accountId is a number
      const numericAccountId = Number(accountId);
      if (isNaN(numericAccountId)) {
        throw new Error('Invalid account ID format');
      }

      // Prepare payment data according to API expectations
      const paymentData = {
        accountId: numericAccountId,
        billType,
        billNumber: billNumber.trim(),
        amount: parseFloat(amount),
        date: billDate || new Date().toISOString().split('T')[0],
        description: `${billType.charAt(0).toUpperCase() + billType.slice(1)} Bill Payment`,
        metadata: {
          paymentSource: paymentSourceValue,
          cardId: paymentSource === 'card' ? selectedCard : undefined,
          cardLastFour: paymentSource === 'card' && selectedCardData?.lastFourDigits 
            ? selectedCardData.lastFourDigits 
            : undefined,
          billerName: billType.charAt(0).toUpperCase() + billType.slice(1) + ' Biller'
        }
      };
      
      console.log('Sending payment data:', paymentData);
      
      // Call the API to process the bill payment
      const result = await accountsAPI.payBill(paymentData);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      if (result.success && result.updatedAccount) {
        // Add payment source info to the updated account
        const updatedAccount = {
          ...result.updatedAccount,
          id: numericAccountId.toString(),
          metadata: {
            ...(result.updatedAccount.metadata || {}),
            paymentSource: paymentSourceValue,
            cardId: paymentSource === 'card' ? selectedCard : undefined,
            cardLastFour: paymentSource === 'card' && selectedCardData?.lastFourDigits 
              ? selectedCardData.lastFourDigits 
              : undefined
          }
        };
        
        // Notify parent component of successful payment
        onPaymentSuccess(updatedAccount);
        
        // Show success message
        toast.success(`Successfully paid ₹${amount} for ${billType} bill`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        
        // Reset form
        setBillNumber(generateBillNumber(billType));
        setAmount('');
        onHide();
      } else {
        throw new Error(result.message || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing bill payment:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBillNumberPlaceholder = () => {
    switch (billType) {
      case 'mobile':
        return 'Enter 10-digit mobile number';
      case 'electricity':
        return 'Enter electricity bill number';
      case 'gas':
        return 'Enter gas connection number';
      case 'water':
        return 'Enter water connection number';
      case 'internet':
        return 'Enter customer ID or account number';
      default:
        return 'Enter bill/reference number';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Pay Bills</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-0">
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          
          <Tabs
            activeKey={paymentSource}
            onSelect={(k) => setPaymentSource(k)}
            className="mb-4"
          >
            <Tab eventKey="account" title="Pay from Account">
              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Select Account</Form.Label>
                  <Form.Select 
                    value={selectedAccount} 
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    required={paymentSource === 'account'}
                  >
                    <option value="">Select an account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber} (₹{account.balance?.toLocaleString('en-IN') || '0'})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </Tab>
            
            <Tab eventKey="card" title="Pay by Card" disabled={!cards.length}>
              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Select Card</Form.Label>
                  <Form.Select 
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    disabled={isSubmitting || cards.length === 0}
                    isInvalid={!selectedCard && paymentSource === 'card'}
                  >
                    <option value="">Select a card</option>
                    {cards.length === 0 ? (
                      <option disabled>No cards available</option>
                    ) : (
                      cards.map(card => {
                        // Extract last 4 digits from cardNumber
                        const lastFour = card.cardNumber ? 
                          (card.cardNumber.length > 4 ? card.cardNumber.slice(-4) : card.cardNumber) : 
                          '••••';
                        return (
                          <option key={card.id} value={card.id}>
                            {card.cardType} •••• {lastFour} - Expires {card.expiryDate}
                          </option>
                        );
                      })
                    )}
                  </Form.Select>
                  {!selectedCard && paymentSource === 'card' && (
                    <Form.Control.Feedback type="invalid">
                      Please select a card
                    </Form.Control.Feedback>
                  )}
                  {!cards.length && (
                    <Form.Text className="text-muted">
                      No active cards available. Please add a card or use bank account.
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
            </Tab>
          </Tabs>
          
          <div className="row g-3">

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Bill Type</Form.Label>
                <Form.Select 
                  value={billType} 
                  onChange={(e) => {
                    setBillType(e.target.value);
                    setBillNumber(''); // Reset bill number when type changes
                  }}
                  disabled={isSubmitting}
                  className="py-2"
                >
                  {billTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">
                  {billType === 'mobile' ? 'Mobile Number' : 'Bill/Reference Number'}
                </Form.Label>
                <Form.Control 
                  type={billType === 'mobile' ? 'tel' : 'text'}
                  value={billNumber}
                  onChange={(e) => {
                    // Only allow numbers for mobile
                    if (billType === 'mobile') {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setBillNumber(value);
                    } else {
                      setBillNumber(e.target.value);
                    }
                  }}
                  placeholder={getBillNumberPlaceholder()}
                  disabled={isSubmitting}
                  isInvalid={error.includes('number') || error.includes('mobile') || error.includes('electricity')}
                  maxLength={billType === 'mobile' ? 10 : undefined}
                  className="py-2"
                />
                <Form.Text className="text-muted">
                  {billType === 'mobile' && 'Enter 10-digit mobile number'}
                  {billType === 'electricity' && 'Enter your electricity bill number'}
                </Form.Text>
                {(error.includes('number') || error.includes('mobile') || error.includes('electricity')) && (
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Amount (₹)</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <Form.Control 
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      // Allow only numbers and one decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                        .replace(/(\..*)\./g, '$1') // Remove extra decimal points
                        .replace(/^(\d*\.\d{0,2}).*$/, '$1'); // Limit to 2 decimal places
                      setAmount(value);
                    }}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    isInvalid={error.includes('amount')}
                    className="py-2"
                  />
                </div>
                {error.includes('amount') && (
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Payment Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  disabled={isSubmitting}
                  className="py-2"
                />
                <Form.Text className="text-muted">
                  Select a date within the next 30 days
                </Form.Text>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={onHide} 
            disabled={isSubmitting}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 d-flex align-items-center justify-content-center"
            style={{ minWidth: '120px' }}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-money-bill-wave me-2"></i>
                Pay Now
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BillPayModal;
