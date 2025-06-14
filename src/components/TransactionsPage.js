import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Button, 
  Badge, 
  InputGroup, 
  Dropdown, 
  Pagination,
  Container,
  Table
} from 'react-bootstrap';
import { 
  FiFilter, 
  FiDownload, 
  FiSearch, 
  FiDollarSign, 
  FiArrowUp, 
  FiArrowDown,
  FiShoppingBag,
  FiCoffee,
  FiGift,
  FiTruck,
  FiCreditCard,
  FiDroplet,
  FiHome,
  FiWifi
} from 'react-icons/fi';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/TransactionsPage.css';
import { generatePdf } from '../utils/PdfGenerator';

const TransactionsPage = () => {
  // Sample transaction data
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: 'Grocery Store',
      category: 'Groceries',
      amount: 85.20,
      type: 'expense',
      date: '2023-05-15T10:30:00',
      status: 'completed',
      icon: <FiShoppingBag />,
      iconColor: '#4e73df'
    },
    {
      id: 2,
      description: 'Coffee Shop',
      category: 'Food & Drink',
      amount: 4.50,
      type: 'expense',
      date: '2023-05-14T08:15:00',
      status: 'completed',
      icon: <FiCoffee />,
      iconColor: '#1cc88a'
    },
    {
      id: 3,
      description: 'Salary Deposit',
      category: 'Income',
      amount: 3500.00,
      type: 'income',
      date: '2023-05-01T00:00:00',
      status: 'completed',
      icon: <FiDollarSign />,
      iconColor: '#36b9cc'
    },
    {
      id: 4,
      description: 'Gift Card',
      category: 'Gifts',
      amount: 50.00,
      type: 'income',
      date: '2023-05-10T14:20:00',
      status: 'pending',
      icon: <FiGift />,
      iconColor: '#f6c23e'
    },
    {
      id: 5,
      description: 'Online Shopping',
      category: 'Shopping',
      amount: 125.99,
      type: 'expense',
      date: '2023-05-12T16:45:00',
      status: 'completed',
      icon: <FiShoppingBag />,
      iconColor: '#e74a3b'
    },
    {
      id: 6,
      description: 'Electric Bill',
      category: 'Utilities',
      amount: 85.00,
      type: 'expense',
      date: '2023-05-05T09:00:00',
      status: 'completed',
      icon: <FiDroplet />,
      iconColor: '#6f42c1'
    },
    {
      id: 7,
      description: 'Internet Bill',
      category: 'Utilities',
      amount: 65.00,
      type: 'expense',
      date: '2023-05-03T11:20:00',
      status: 'completed',
      icon: <FiWifi />,
      iconColor: '#fd7e14'
    },
    {
      id: 8,
      description: 'Rent Payment',
      category: 'Housing',
      amount: 1200.00,
      type: 'expense',
      date: '2023-05-01T00:00:00',
      status: 'completed',
      icon: <FiHome />,
      iconColor: '#e83e8c'
    },
  ]);

  // Add state for export progress
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(''); // 'transactions' or 'expenses'

  // State for filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: ''
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Calculate summary data
  const totalBalance = transactions.reduce((sum, tx) => 
    tx.type === 'income' ? sum + tx.amount : sum - tx.amount, 0
  );

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Get unique categories for filter dropdown
  const categories = [...new Set(transactions.map(tx => tx.category))];

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter(tx => {
    return (
      (filters.type === '' || tx.type === filters.type) &&
      (filters.category === '' || tx.category === filters.category) &&
      (filters.status === '' || tx.status === filters.status) &&
      (filters.search === '' || 
        tx.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.category.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Export to PDF function with progress tracking
  const handleExportPDF = async (type = 'transactions') => {
    try {
      setIsExporting(true);
      setExportType(type);
      setExportProgress(0);
      
      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.id = 'export-pdf-content';
      tempContainer.className = 'pdf-export';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.padding = '20px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.width = '210mm';

      // Format date
      const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      };

      // Update progress
      setExportProgress(10);

      // Generate the HTML content for the PDF
      tempContainer.innerHTML = `
        <div class="pdf-header">
          <div class="pdf-logo">
            <h1 class="pdf-title">Apna Bank</h1>
          </div>
          <h2 class="pdf-subtitle">${type === 'transactions' ? 'Transaction' : 'Expense'} Report</h2>
          <p class="pdf-date">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        ${type === 'transactions' ? `
          <!-- Summary Section for Transactions -->
          <div class="pdf-stats">
            <div class="pdf-stat-card">
              <p class="pdf-stat-label">Total Balance</p>
              <p class="pdf-stat-value">${formatCurrency(totalBalance)}</p>
            </div>
            <div class="pdf-stat-card">
              <p class="pdf-stat-label">Total Income</p>
              <p class="pdf-stat-value">+${formatCurrency(totalIncome)}</p>
            </div>
            <div class="pdf-stat-card">
              <p class="pdf-stat-label">Total Expenses</p>
              <p class="pdf-stat-value">-${formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        ` : ''}
        
        <!-- Content Section -->
        <div>
          <h3 class="pdf-section-title">${type === 'transactions' ? 'Transaction Details' : 'Expense Categories'}</h3>
          
          ${type === 'transactions' ? `
            <!-- Transactions Table -->
            <table class="pdf-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(tx => `
                  <tr>
                    <td>${formatDate(tx.date)}</td>
                    <td>${tx.description}</td>
                    <td class="transaction-amount">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
                    <td>
                      <span class="status-badge ${tx.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                        ${tx.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <!-- Expense Categories -->
            <div class="expense-categories">
              ${Object.entries(expenseCategories).map(([category, amount]) => {
                const percentage = (amount / totalExpenses * 100).toFixed(1);
                return `
                  <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                      <span>${category}</span>
                      <span>${formatCurrency(amount)} (${percentage}%)</span>
                    </div>
                    <div class="progress" style="height: 8px; border-radius: 4px;">
                      <div 
                        class="progress-bar" 
                        role="progressbar" 
                        style="width: ${percentage}%; background-color: #4e73df; border-radius: 4px;"
                        aria-valuenow="${percentage}" 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
        
        <!-- Footer -->
        <div class="pdf-footer">
          <p>This is an auto-generated report. For any discrepancies, please contact support.</p>
        </div>
      `;

      // Append the container to the body
      document.body.appendChild(tempContainer);
      setExportProgress(30);

      // Generate the PDF using the existing utility
      const success = await generatePdf(
        'export-pdf-content',
        `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`,
        (progress) => {
          // Map the progress from 30-100% for the PDF generation
          const mappedProgress = 30 + (progress * 0.7);
          setExportProgress(Math.round(mappedProgress));
        }
      );

      if (!success) {
        console.error('Failed to generate PDF');
      }
      
      setExportProgress(100);
      
      // Reset states after a short delay to show completion
      setTimeout(() => {
        setIsExporting(false);
        setExportType('');
        setExportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsExporting(false);
      setExportType('');
      setExportProgress(0);
    } finally {
      // Clean up the temporary container
      const tempContainer = document.getElementById('export-pdf-content');
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  };

  // Calculate expense categories for the expense report
  const expenseCategories = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  return (
    <div className="transactions-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        {/* <h2 className="mb-3 mb-md-0">Transactions</h2> */}
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
          <Button 
            variant="outline-primary" 
            onClick={() => handleExportPDF('transactions')}
            disabled={isExporting && exportType === 'transactions'}
            className="d-flex align-items-center justify-content-center gap-1"
          >
            <FiDownload size={16} /> 
            {isExporting && exportType === 'transactions' ? 'Exporting...' : 'Export Transactions'}
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => handleExportPDF('expenses')}
            disabled={isExporting && exportType === 'expenses'}
            className="d-flex align-items-center justify-content-center gap-1"
          >
            <FiDownload size={16} /> 
            {isExporting && exportType === 'expenses' ? 'Exporting...' : 'Export Expenses'}
          </Button>
        </div>
      </div>

      {/* My Card Section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">My Card</h5>
            <Button variant="outline-primary" size="sm">View All</Button>
          </div>
          
          <Row className="g-3">
            {/* Balance Card */}
            <Col md={6} lg={4}>
              <div className="card-preview balance-card">
                <div className="d-flex justify-content-between align-items-start h-100">
                  <div className="d-flex flex-column justify-content-between h-100">
                    <div>
                      <p className="mb-1">Balance</p>
                      <h3 className="mb-0">{formatCurrency(totalBalance)}</h3>
                    </div>
                    <div className="d-flex justify-content-between align-items-end w-100">
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>Card Number</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>**** **** **** 1234</p>
                      </div>
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>Expires</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>12/25</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '44px', 
                      height: '44px',
                      minWidth: '44px',
                      color: '#4e73df'
                    }}
                  >
                    <FiCreditCard size={20} />
                  </div>
                </div>
                <div className="absolute-circle"></div>
              </div>
            </Col>

            {/* Income Card */}
            <Col md={6} lg={4}>
              <div className="card-preview income-card">
                <div className="d-flex justify-content-between align-items-start h-100">
                  <div className="d-flex flex-column justify-content-between h-100">
                    <div>
                      <p className="mb-1">Income</p>
                      <h3 className="mb-0">{formatCurrency(totalIncome)}</h3>
                    </div>
                    <div className="d-flex justify-content-between align-items-end w-100">
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>This Month</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>+12.5%</p>
                      </div>
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>Last Month</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>+8.2%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '44px', 
                      height: '44px',
                      minWidth: '44px',
                      color: '#1cc88a'
                    }}
                  >
                    <FiArrowUp size={20} />
                  </div>
                </div>
                <div className="absolute-circle"></div>
              </div>
            </Col>

            {/* Expenses Card */}
            <Col md={6} lg={4}>
              <div className="card-preview expenses-card">
                <div className="d-flex justify-content-between align-items-start h-100">
                  <div className="d-flex flex-column justify-content-between h-100">
                    <div>
                      <p className="mb-1">Expenses</p>
                      <h3 className="mb-0">{formatCurrency(totalExpenses)}</h3>
                    </div>
                    <div className="d-flex justify-content-between align-items-end w-100">
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>This Month</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>-8.3%</p>
                      </div>
                      <div>
                        <p className="mb-1" style={{ fontSize: '0.75rem' }}>Last Month</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>-5.7%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '44px', 
                      height: '44px',
                      minWidth: '44px',
                      color: '#e74a3b'
                    }}
                  >
                    <FiArrowDown size={20} />
                  </div>
                </div>
                <div className="absolute-circle"></div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recent Transactions Section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent Transactions</h5>
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
              <Button variant="outline-secondary" size="sm">View All</Button>
            </div>
          </div>
          
          {/* Transactions table remains the same */}
          <Table responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description}</td>
                  <td className={`amount ${transaction.type === 'income' ? 'credit' : 'debit'}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                  <td>
                    <Badge 
                      bg={transaction.status === 'completed' ? 'success' : 'warning'} 
                      className="status-badge"
                    >
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {filteredTransactions.length > transactionsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} entries
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev 
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  // Show first, current, and last pages
                  let pageNumber;
                  if (totalPages <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage === 1) {
                    pageNumber = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNumber = totalPages - 2 + i;
                  } else {
                    pageNumber = currentPage - 1 + i;
                  }
                  
                  return (
                    <Pagination.Item 
                      key={pageNumber} 
                      active={pageNumber === currentPage}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <Pagination.Ellipsis disabled />
                )}
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <Pagination.Item 
                    active={currentPage === totalPages}
                    onClick={() => paginate(totalPages)}
                  >
                    {totalPages}
                  </Pagination.Item>
                )}
                <Pagination.Next 
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* My Expense Section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">My Expense</h5>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => handleExportPDF('expenses')}
              disabled={isExporting && exportType === 'expenses'}
              className="d-flex align-items-center gap-1"
            >
              <FiDownload size={14} /> 
              {isExporting && exportType === 'expenses' ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          
          {/* Expense categories and chart remain the same */}
          <Row>
            <Col lg={5}>
              <div className="expense-categories mb-4 mb-lg-0">
                {transactions
                  .filter(tx => tx.type === 'expense')
                  .reduce((acc, tx) => {
                    const existing = acc.find(item => item.category === tx.category);
                    if (existing) {
                      existing.amount += tx.amount;
                    } else {
                      acc.push({
                        category: tx.category,
                        amount: tx.amount,
                        icon: tx.icon,
                        iconColor: tx.iconColor
                      });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.amount - a.amount)
                  .map((item, index) => {
                    const percentage = (item.amount / totalExpenses) * 100;
                    return (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-2 d-flex align-items-center justify-content-center" 
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: `${item.iconColor}15`,
                                color: item.iconColor
                              }}
                            >
                              {item.icon}
                            </div>
                            <span>{item.category}</span>
                          </div>
                          <div>
                            <strong>{formatCurrency(item.amount)}</strong>
                            <span className="text-muted ms-2">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.iconColor,
                              borderRadius: '4px'
                            }}
                            aria-valuenow={percentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Col>
            <Col lg={7}>
              <div className="expense-chart" style={{ height: '300px' }}>
                {/* Placeholder for chart */}
                <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '100%' }}>
                  <div className="text-center p-4">
                    <div className="mb-3">
                      <FiDollarSign size={48} className="text-muted" />
                    </div>
                    <h5>Expense Overview</h5>
                    <p className="text-muted mb-0">Visual representation of your spending</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Progress bar for exports */}
      {isExporting && (
        <div className="fixed-bottom p-2 p-sm-3 bg-white shadow-lg" style={{ zIndex: 1050, left: 0, right: 0, bottom: 0 }}>
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
  );
};

// Add responsive styles for mobile
document.addEventListener('DOMContentLoaded', function() {
  // Ensure tables are horizontally scrollable on mobile
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 767.98px) {
      .table-responsive {
        display: block;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .card-preview {
        height: auto !important;
        min-height: 180px;
      }
      
      .expense-categories {
        margin-bottom: 1.5rem !important;
      }
      
      .fixed-bottom {
        padding: 0.5rem !important;
      }
      
      .progress {
        height: 3px !important;
      }
      
      .transaction-amount {
        white-space: nowrap;
      }
    }
    
    @media (max-width: 575.98px) {
      .d-flex.justify-content-between.align-items-center {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 10px;
      }
      
      .d-flex.justify-content-between.align-items-center .btn-group {
        width: 100%;
      }
      
      .btn {
        width: 100%;
        margin-bottom: 5px;
      }
      
      .gap-2 {
        gap: 0.5rem !important;
      }
    }
  `;
  document.head.appendChild(style);
});

export default TransactionsPage;