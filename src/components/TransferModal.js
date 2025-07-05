import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { accountsAPI, transactionsAPI } from '../services/api';

const TransferModal = ({ show, onHide, userId, onTransferComplete }) => {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    transferType: 'within_bank', // within_bank, imps, neft, upi
    upiId: ''
  });
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountsAPI.fetchBankAccounts(userId);
        setAccounts(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            fromAccount: data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to load accounts');
      }
    };

    if (show && userId) {
      fetchAccounts();
    }
  }, [show, userId]);

  const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  // Update selected account balance when fromAccount changes
  useEffect(() => {
    if (formData.fromAccount) {
      // Find the account by ID in the accounts array
      const account = accounts.find(acc => acc.id === formData.fromAccount);
      if (account) {
        setSelectedAccountBalance(account.balance || 0);
      }
    }
  }, [formData.fromAccount, accounts]);

  // Check balance when amount or selected account changes
  useEffect(() => {
    if (formData.amount && formData.fromAccount) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0 && selectedAccountBalance < amount) {
        setShowInsufficientBalance(true);
        showBalanceError(selectedAccountBalance);
      } else {
        setShowInsufficientBalance(false);
      }
    }
  }, [formData.amount, formData.fromAccount, selectedAccountBalance]);

  const showBalanceError = (balance) => {
    toast.error(`Insufficient balance. Available: ₹${balance.toLocaleString('en-IN')}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fromAccount) newErrors.fromAccount = 'Please select source account';
    
    // Validate recipient based on transfer type
    if (formData.transferType === 'upi') {
      if (!formData.upiId) {
        newErrors.upiId = 'Please enter UPI ID';
      } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g., username@bankname)';
      }
    } else {
      if (!formData.toAccount) {
        newErrors.toAccount = 'Please enter recipient account';
      }
    }
    
    // Validate amount
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) > 100000) {
      newErrors.amount = 'Maximum transfer amount is ₹1,00,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const reference = `TRF-${Date.now()}`;
      const amount = parseFloat(formData.amount);
      const description = formData.description || `Fund Transfer ${formData.transferType.toUpperCase()}`;
      
      // Find the fromAccount in the accounts array
      const fromAccount = accounts.find(acc => acc.id === formData.fromAccount);
      
      if (!fromAccount) {
        toast.error('Source account not found');
        setLoading(false);
        return;
      }
      
      // Check if sufficient balance exists
      if (fromAccount.balance < amount) {
        showBalanceError(fromAccount.balance);
        setLoading(false);
        return;
      }

      // Create transaction object based on transfer type
      const transactionData = {
        accountId: formData.fromAccount,
        toAccount: formData.transferType === 'upi' ? formData.upiId : formData.toAccount,
        amount: amount,
        type: 'debit',
        description: formData.transferType === 'upi' 
          ? `UPI Payment to ${formData.upiId}` 
          : description,
        category: 'transfer_out',
        status: 'completed',
        transferType: formData.transferType,
        reference: reference,
        date: new Date().toISOString(),
        ...(formData.transferType === 'upi' && { upiId: formData.upiId })
      };
      
      // Execute the transaction
      await transactionsAPI.addTransaction(userId, transactionData);
      
      // Update the sender's account balance
      await accountsAPI.updateAccountBalance(fromAccount.id, {
        amount: amount,
        type: 'debit',
        transactionId: reference
      });

      // For within-bank transfers, create a corresponding credit transaction
      if (formData.transferType === 'within_bank') {
        const toAccount = accounts.find(acc => acc.accountNumber === formData.toAccount);
        
        if (toAccount) {
          try {
            const creditTransaction = {
              accountId: toAccount.id,
              fromAccount: fromAccount.accountNumber,
              amount: amount,
              type: 'credit',
              description: `Received via ${formData.transferType.toUpperCase()}: ${fromAccount.accountNumber}`,
              category: 'transfer_in',
              status: 'completed',
              transferType: formData.transferType,
              reference: reference,
              date: new Date().toISOString()
            };
            
            await transactionsAPI.addTransaction(userId, creditTransaction);
            
            // Update the recipient's account balance
            await accountsAPI.updateAccountBalance(toAccount.id, {
              amount: amount,
              type: 'credit',
              transactionId: reference
            });
            
          } catch (error) {
            console.error('Error processing credit transaction:', error);
            throw new Error('Transfer initiated but could not credit recipient. Please contact support.');
          }
        } else {
          throw new Error('Recipient account not found');
        }
      }
      
      toast.success('Transfer completed successfully!');
      onTransferComplete();
      onHide();
      
    } catch (error) {
      console.error('Transfer failed:', error);
      if (!error.message.includes('Insufficient balance')) {
        toast.error(`Transfer failed: ${error.message || 'Please try again'}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FaExchangeAlt className="me-2" /> Transfer Money
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.general && <Alert variant="danger">{errors.general}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>From Account</Form.Label>
            <Form.Select 
              name="fromAccount" 
              value={formData.fromAccount}
              onChange={handleChange}
              isInvalid={!!errors.fromAccount || showInsufficientBalance}
              disabled={loading}
              className={showInsufficientBalance ? 'border-danger' : ''}
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.bankName} (₹{account.balance.toLocaleString()})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.fromAccount}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Amount (₹) {formData.fromAccount && `(Available: ₹${selectedAccountBalance.toLocaleString('en-IN')})`}</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              isInvalid={!!errors.amount || showInsufficientBalance}
              disabled={loading || !formData.fromAccount}
              className={showInsufficientBalance ? 'border-danger' : ''}
            />
            {showInsufficientBalance && (
              <Form.Text className="text-danger">
                Insufficient balance for this transfer
              </Form.Text>
            )}
            <Form.Control.Feedback type="invalid">
              {errors.amount}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Transfer Type</Form.Label>
            <Form.Select 
              name="transferType" 
              value={formData.transferType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="within_bank">Within Bank</option>
              <option value="imps">IMPS</option>
              <option value="neft">NEFT</option>
              <option value="upi">UPI</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>
              {formData.transferType === 'upi' ? 'UPI ID' : 'To Account'}
            </Form.Label>
            {formData.transferType === 'upi' ? (
              <>
                <Form.Control
                  type="text"
                  name="upiId"
                  placeholder="e.g., username@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                  isInvalid={!!errors.upiId}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.upiId}
                </Form.Control.Feedback>
              </>
            ) : (
              <>
                <Form.Control
                  type="text"
                  name="toAccount"
                  placeholder={formData.transferType === 'within_bank' ? 'Account Number' : 'IFSC + Account Number'}
                  value={formData.toAccount}
                  onChange={handleChange}
                  isInvalid={!!errors.toAccount}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.toAccount}
                </Form.Control.Feedback>
              </>
            )}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              placeholder="Add a note"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                Processing...
              </>
            ) : (
              'Transfer Now'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TransferModal;
