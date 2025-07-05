import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Pagination,
  Container,
  Table,
  ProgressBar,
  Spinner
} from 'react-bootstrap';
import { 
  FiDownload, 
  FiDollarSign, 
  FiArrowUp, 
  FiArrowDown,
  FiShoppingBag,
  FiCoffee,
  FiGift,
  FiZap,
  FiSearch,
} from 'react-icons/fi';

import '../styles/TransactionsPage.css';
import { generatePdf } from '../utils/PdfGenerator';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';

const iconMap = {
  'shopping-bag': FiShoppingBag,
  'coffee': FiCoffee,
  'dollar-sign': FiDollarSign,
  'gift': FiGift,
  'zap': FiZap
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount) => {
  // Force Indian locale and currency symbol
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// const TransactionIcon = ({ iconName, color }) => {
//   const IconComponent = iconMap[iconName] || FiDollarSign;
//   return <IconComponent style={{ color }} />;
// };

const TransactionIcon = ({ iconName, color }) => {
  return <span style={{ color, fontWeight: 'bold' }}>₹</span>;
};
// Helper function to get random variant for progress bars
const getRandomVariant = () => {
  const variants = ['primary', 'success', 'info', 'warning', 'danger'];
  return variants[Math.floor(Math.random() * variants.length)];
};

const TransactionsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [billCount, setBillCount] = useState(0);
  const transactionsPerPage = 5;

  // Get accountId from URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const accountId = searchParams.get('accountId');
  
  // Log the current URL and search params for debugging
  console.log('Current URL:', window.location.href);
  console.log('Search params:', Object.fromEntries(searchParams.entries()));

  // Function to calculate bill count from transactions
  const calculateBillCount = (txns) => {
    if (!txns || !txns.length) return 0;
    
    return txns.filter(tx => {
      // Check if it's a bill payment transaction
      const isBillPayment = (
        // Check if it's an expense and has bill in description/category
        (tx.type === 'expense' && 
          (tx.description?.toLowerCase().includes('bill') || 
           tx.category?.toLowerCase().includes('bill'))) ||
        
        // Or has a bill reference ID
        (tx.referenceId && 
          (tx.referenceId.toString().toLowerCase().includes('bill') || 
           tx.referenceId.toString().startsWith('BILL'))) ||
        
        // Or has bill in metadata
        (tx.metadata && 
          JSON.stringify(tx.metadata).toLowerCase().includes('bill'))
      );
      
      // Debug log for bill transactions
      if (isBillPayment) {
        console.log('Found bill payment:', {
          id: tx.id,
          description: tx.description,
          category: tx.category,
          referenceId: tx.referenceId,
          metadata: tx.metadata
        });
      }
      
      return isBillPayment;
    }).length;
  };
  
  // Update bill count when transactions or filters change
  useEffect(() => {
    // Apply filters to transactions
    const filtered = transactions.filter(tx => {
      if (!tx) return false;
      
      const searchTerm = (filters.search || '').toLowerCase();
      const description = (tx.description || '').toLowerCase();
      const category = (tx.category || '').toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        description.includes(searchTerm) ||
        category.includes(searchTerm);
        
      return (
        (filters.type === '' || tx.type === filters.type) &&
        (filters.category === '' || tx.category === filters.category) &&
        (filters.status === '' || tx.status === filters.status) &&
        matchesSearch
      );
    });
    
    const count = calculateBillCount(filtered);
    console.log('Updating bill count. Total transactions:', transactions.length, 'Filtered:', filtered.length, 'Bill count:', count);
    setBillCount(count);
  }, [transactions, filters]);

  // Fetch user transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        let transactions = await transactionsAPI.getUserTransactions(user.id);
        
        // Filter transactions by accountId if provided in URL
        if (accountId) {
          transactions = transactions.filter(txn => txn.accountId === accountId);
        }
        
        const validTransactions = Array.isArray(transactions) ? transactions : [];
        console.log('Fetched transactions:', validTransactions);
        setTransactions(validTransactions);
        
        // Update bill count immediately after setting transactions
        const count = calculateBillCount(validTransactions);
        console.log('Initial bill count:', count);
        setBillCount(count);
      } catch (err) {
        setError("Failed to load transactions.");
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.id, accountId]);

  // Calculate totals
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
    
  const totalBalance = totalIncome - totalExpense;

  // Get unique categories for filter dropdown
  const categories = [...new Set(transactions.map(tx => tx.category))];
  const statuses = [...new Set(transactions.map(tx => tx.status))];

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (!tx) return false;
    
    const searchTerm = (filters.search || '').toLowerCase();
    const description = (tx.description || '').toLowerCase();
    const category = (tx.category || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      description.includes(searchTerm) ||
      category.includes(searchTerm);
      
    return (
      (filters.type === '' || tx.type === filters.type) &&
      (filters.category === '' || tx.category === filters.category) &&
      (filters.status === '' || tx.status === filters.status) &&
      matchesSearch
    );
  });

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Export to PDF
  const handleExportPDF = async (type = 'transactions') => {
    try {
      setIsExporting(true);
      setExportType(type);
      setExportProgress(0);
      
      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.id = 'transactions-pdf-content';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.padding = '20px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.width = '210mm';
      
      // Format date for display
      const formatDateForPdf = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      };
      
      // Format currency for display
      const formatCurrencyForPdf = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(amount || 0);
      };
      
      // Get current date for the report
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Calculate summary
      const totalTransactions = filteredTransactions.length;
      const totalCredit = filteredTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      const totalDebit = filteredTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      // Generate HTML for the PDF
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
          <!-- Bank Header -->
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-radius: 8px; 
                        display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <span style="color: white; font-size: 24px; font-weight: bold; font-family: 'Arial Black', Arial, sans-serif;">AB</span>
              </div>
              <div style="text-align: left;">
                <h1 style="margin: 0; color: #1e3c72; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">APNA BANK</h1>
                <p style="margin: 2px 0 0 0; color: #4a6da7; font-size: 12px; letter-spacing: 0.5px;">YOUR TRUSTED BANKING PARTNER</p>
              </div>
            </div>
          </div>

          <!-- Report Header -->
          <div style="margin-bottom: 25px;">
            <h1 style="margin: 0 0 5px 0; color: #333; font-size: 22px; text-align: center;">Transaction Report</h1>
            <p style="margin: 0 0 10px 0; color: #666; text-align: center; font-size: 14px;">
              Generated on: ${currentDate}
            </p>
            
            <!-- Summary Cards -->
            <div style="display: flex; justify-content: space-between; margin: 20px 0; gap: 15px;">
              <div style="flex: 1; background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 14px;">Total Transactions</p>
                <p style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">${totalTransactions}</p>
              </div>
              <div style="flex: 1; background: #e8f5e9; border-radius: 8px; padding: 15px; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #2e7d32; font-size: 14px;">Total Credits</p>
                <p style="margin: 0; font-size: 24px; font-weight: 600; color: #2e7d32;">+${formatCurrencyForPdf(totalCredit)}</p>
              </div>
              <div style="flex: 1; background: #ffebee; border-radius: 8px; padding: 15px; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #c62828; font-size: 14px;">Total Debits</p>
                <p style="margin: 0; font-size: 24px; font-weight: 600; color: #c62828;">-${formatCurrencyForPdf(totalDebit)}</p>
              </div>
            </div>
            
            <!-- Filters Applied -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 10px 15px; margin-bottom: 15px;">
              <p style="margin: 0 0 8px 0; font-weight: 500; color: #495057; font-size: 14px;">Filters Applied:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${filters.type ? `<span style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #495057;">Type: ${filters.type}</span>` : ''}
                ${filters.category ? `<span style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #495057;">Category: ${filters.category}</span>` : ''}
                ${filters.status ? `<span style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #495057;">Status: ${filters.status}</span>` : ''}
                ${filters.search ? `<span style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #495057;">Search: "${filters.search}"</span>` : ''}
                ${!filters.type && !filters.category && !filters.status && !filters.search ? 
                  '<span style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #495057;">No filters applied</span>' : ''}
              </div>
            </div>
          </div>
          
          <!-- Transactions Table -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; padding-bottom: 8px; border-bottom: 1px solid #eee;">
              Transaction History
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 10px; text-align: left; font-weight: 600; color: #495057;">Date</th>
                  <th style="padding: 10px; text-align: left; font-weight: 600; color: #495057;">Description</th>
                  <th style="padding: 10px; text-align: left; font-weight: 600; color: #495057;">Category</th>
                  <th style="padding: 10px; text-align: right; font-weight: 600; color: #495057;">Amount</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600; color: #495057;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.length > 0 ? 
                  filteredTransactions.map(tx => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 10px; vertical-align: middle; color: #495057;">
                        ${formatDateForPdf(tx.date)}
                      </td>
                      <td style="padding: 12px 10px; vertical-align: middle; color: #212529;">
                        ${tx.description || 'N/A'}
                      </td>
                      <td style="padding: 12px 10px; vertical-align: middle; color: #6c757d; text-transform: capitalize;">
                        ${tx.category || 'N/A'}
                      </td>
                      <td style="padding: 12px 10px; vertical-align: middle; text-align: right; font-weight: 500; color: ${tx.type === 'income' ? '#2e7d32' : '#c62828'};">
                        ${tx.type === 'income' ? '+' : '-'} ${formatCurrencyForPdf(tx.amount)}
                      </td>
                      <td style="padding: 12px 10px; vertical-align: middle; text-align: center;">
                        <span style="
                          display: inline-block;
                          padding: 4px 8px;
                          border-radius: 12px;
                          font-size: 12px;
                          font-weight: 500;
                          background-color: ${tx.status === 'completed' ? '#e8f5e9' : '#fff3e0'};
                          color: ${tx.status === 'completed' ? '#2e7d32' : '#e65100'};
                        ">
                          ${tx.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="5" style="padding: 20px; text-align: center; color: #6c757d;">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  `}
              </tbody>
            </table>
            
            ${filteredTransactions.length > 0 && filteredTransactions.length > transactionsPerPage ? `
              <div style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 15px;">
                Showing ${Math.min(filteredTransactions.length, transactionsPerPage)} of ${filteredTransactions.length} transactions
              </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
              This is a computer-generated report and does not require a signature.
            </p>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              For any queries, please contact our 24/7 customer care at 1800-123-4567
            </p>
          </div>
          
          <!-- Bank Footer -->
          <div style="margin-top: 30px; text-align: center; padding-top: 15px; border-top: 2px solid #f0f0f0;">
            <p style="margin: 5px 0; color: #6c757d; font-size: 12px;">
              Apna Bank &copy; ${new Date().getFullYear()} | All Rights Reserved
            </p>
          </div>
        </div>
      `;
      
      // Add the container to the document
      document.body.appendChild(tempContainer);
      
      // Generate the PDF
      const success = await generatePdf(
        'transactions-pdf-content',
        `transactions-report-${new Date().toISOString().split('T')[0]}.pdf`,
        (progress) => {
          setExportProgress(progress);
        }
      );
      
      if (!success) {
        throw new Error('Failed to generate PDF');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      // Clean up
      if (document.body.contains(document.getElementById('transactions-pdf-content'))) {
        document.body.removeChild(document.getElementById('transactions-pdf-content'));
      }
      
      setIsExporting(false);
      setExportType('');
      setExportProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Container fluid className="px-3 px-md-4 py-4">
      <div className="transactions-page">
        {/* Header with filters and export */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          {/* <h2 className="h4 mb-3 mb-md-0">Transaction History</h2> */}
          
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <div className="input-group input-group-sm" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-white">
                <FiSearch size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search transactions..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            
            <select 
              className="form-select form-select-sm" 
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              style={{ maxWidth: '300px' }}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            
            <select 
              className="form-select form-select-sm" 
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={{ maxWidth: '300px' }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <Button 
              variant="outline-primary" 
              onClick={() => handleExportPDF('transactions')}
              disabled={isExporting && exportType === 'transactions'}
              className="d-flex align-items-center gap-1"
            >
              <FiDownload size={16} /> 
              {isExporting && exportType === 'transactions' ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Transactions</h6>
                    <h3 className="mb-0">{transactions.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FiDollarSign size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Bill Payments</h6>
                    <h3 className="mb-0">
                      {billCount}
                    </h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FiDollarSign size={24} className="text-warning" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Income</h6>
                    <h3 className="mb-0 text-success">+{formatCurrency(totalIncome)}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FiArrowUp size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Expenses</h6>
                    <h3 className="mb-0 text-danger">-{formatCurrency(totalExpense)}</h3>
                  </div>
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <FiArrowDown size={24} className="text-danger" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col> */}
        </Row>
        
        {/* Expense Categories */}
        {/* <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Expense Categories</h5>
                <div className="row g-4">
                  {Object.entries(
                    transactions
                      .filter(tx => tx.type === 'expense')
                      .reduce((acc, tx) => {
                        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                        return acc;
                      }, {})
                  )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([category, amount]) => {
                    const percentage = Math.round((amount / totalExpense) * 100) || 0;
                    return (
                      <div key={category} className="col-md-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">{category}</span>
                          <span className="fw-medium">{percentage}%</span>
                        </div>
                        <ProgressBar 
                          now={percentage} 
                          className="mb-3" 
                          style={{ height: '8px' }}
                          variant={getRandomVariant()}
                        />
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Spent</span>
                          <span className="fw-medium">-{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row> */}

        {/* Transactions Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">All Transactions</h5>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleExportPDF('transactions')}
                  disabled={isExporting && exportType === 'transactions'}
                  className="d-flex align-items-center gap-1"
                >
                  <FiDownload size={14} /> 
                  {isExporting && exportType === 'transactions' ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
            
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <TransactionIcon iconName={transaction.icon} />
                          </div>
                          {transaction.description}
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="text-uppercase">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className={`text-end fw-medium ${
                        transaction.type === 'income' || transaction.category?.toLowerCase() === 'transfer_in' 
                          ? 'text-success' 
                          : 'text-danger'
                      }`}>
                        {transaction.type === 'income' || transaction.category?.toLowerCase() === 'transfer_in' 
                          ? '' 
                          : '-'} {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <Badge 
                          bg={transaction.status === 'completed' ? 'success' : 'warning'} 
                          className="text-uppercase"
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {currentTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredTransactions.length > transactionsPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted small">
                  Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} entries
                </div>
                <Pagination className="mb-0">
                  <Pagination.Prev 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Pagination.Item 
                        key={pageNumber} 
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Export Progress */}
        {isExporting && (
          <div className="fixed-bottom p-3 bg-white shadow-lg" style={{ zIndex: 1050, left: 0, right: 0, bottom: 0 }}>
            <div className="container px-0">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-truncate me-2">
                  Exporting {exportType} report...
                </span>
                <span className="small text-nowrap">{exportProgress}%</span>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  style={{ width: `${exportProgress}%` }}
                  aria-valuenow={exportProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TransactionsPage;
