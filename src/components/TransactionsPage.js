// src/components/TransactionsPage.js
import React, { useState } from 'react';
import { Container, Table, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import TransactionRow from './common/TransactionRow';
import { generatePdf } from '../utils/PdfGenerator';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([
    // Sample data - replace with your actual data
    {
      id: 'TXN12345',
      description: 'Grocery Shopping',
      type: 'debit',
      amount: 1250.50,
      date: '2023-06-01T14:30:00',
      category: 'shopping'
    },
    {
      id: 'TXN12346',
      description: 'Salary Credit',
      type: 'credit',
      amount: 50000.00,
      date: '2023-06-01T09:15:00',
      category: 'salary'
    },
    {
      id: 'TXN12347',
      description: 'Electricity Bill',
      type: 'debit',
      amount: 2500.00,
      date: '2023-06-02T10:30:00',
      category: 'bills'
    },
    {
      id: 'TXN12348',
      description: 'Dinner',
      type: 'debit',
      amount: 1200.00,
      date: '2023-06-02T20:15:00',
      category: 'food'
    }
  ]);

  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filters.type === 'all' || tx.type === filters.type;
    const matchesCategory = filters.category === 'all' || tx.category === filters.category;
    const matchesDate = (!filters.startDate || new Date(tx.date) >= new Date(filters.startDate)) &&
                      (!filters.endDate || new Date(tx.date) <= new Date(filters.endDate + 'T23:59:59'));
    return matchesType && matchesCategory && matchesDate;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportAll = async () => {
    if (filteredTransactions.length === 0) {
      setExportError('No transactions to export');
      setTimeout(() => setExportError(null), 3000);
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.id = 'transactions-pdf-content';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.padding = '20px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.width = '210mm';

      // Calculate totals
      const totalCredit = filteredTransactions
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const totalDebit = filteredTransactions
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Generate HTML for the PDF
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 100%;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <img src="/images/ab-logo.svg" alt="Bank Logo" style="height: 40px;">
                <h2 style="margin: 0; color: #1e3c72; font-size: 24px; font-weight: 600;">Apna Bank</h2>
              </div>
              <h3 style="margin: 0 0 5px 0; color: #1e3c72; font-size: 18px; font-weight: 500;">Transaction History Report</h3>
              <p style="margin: 0; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #666;">Customer ID: CUST-${Math.floor(10000 + Math.random() * 90000)}</div>
              <div style="font-size: 12px; color: #666;">Report ID: TXN-RPT-${Date.now().toString().slice(-6)}</div>
            </div>
          </div>
          
          <!-- Summary Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72;">
              <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Total Transactions</div>
              <div style="font-size: 24px; font-weight: bold; color: #1e3c72;">${filteredTransactions.length}</div>
            </div>
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Total Credit</div>
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${formatCurrency(totalCredit)}</div>
            </div>
            <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
              <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Total Debit</div>
              <div style="font-size: 24px; font-weight: bold; color: #c62828;">${formatCurrency(totalDebit)}</div>
            </div>
          </div>
          
          <!-- Transactions Table -->
          <h3 style="color: #1e3c72; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #1e3c72;">
            Transaction Details
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f8f9fa; color: #555; text-align: left;">
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">ID</th>
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Description</th>
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">Amount</th>
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Type</th>
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Date</th>
                <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Category</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(tx => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${tx.id}</td>
                  <td style="padding: 10px;">${tx.description}</td>
                  <td style="padding: 10px; text-align: right; font-weight: 500; color: ${tx.type === 'credit' ? '#2e7d32' : '#c62828'};">
                    ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount).replace('₹', '')}
                  </td>
                  <td style="padding: 10px;">
                    <span style="
                      background: ${tx.type === 'credit' ? '#e8f5e9' : '#ffebee'};
                      color: ${tx.type === 'credit' ? '#2e7d32' : '#c62828'};
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: 500;
                      display: inline-block;
                      min-width: 60px;
                      text-align: center;
                      text-transform: capitalize;
                    ">
                      ${tx.type}
                    </span>
                  </td>
                  <td style="padding: 10px; font-size: 11px; color: #666;">
                    ${formatDate(tx.date)}
                  </td>
                  <td style="padding: 10px; text-transform: capitalize;">
                    ${tx.category}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 10px; color: #888; text-align: center;">
            <p>This is an auto-generated report. For any discrepancies, please contact our customer support.</p>
            <p> ${new Date().getFullYear()} Apna Bank. All rights reserved.</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempContainer);

      // Generate PDF
      const success = await generatePdf(
        'transactions-pdf-content',
        `transactions-report-${new Date().toISOString().split('T')[0]}.pdf`,
        (progress) => {
          console.log(`PDF Generation Progress: ${progress}%`);
        }
      );

      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setExportError('Failed to export transactions. Please try again.');
    } finally {
      // Clean up
      const tempContainer = document.getElementById('transactions-pdf-content');
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      setIsExporting(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Transaction History</h4>
        <div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleExportAll}
            disabled={isExporting || filteredTransactions.length === 0}
          >
            {isExporting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="me-1" /> Export All
              </>
            )}
          </Button>
        </div>
      </div>

      {exportError && (
        <Alert variant="danger" onClose={() => setExportError(null)} dismissible className="mb-3">
          {exportError}
        </Alert>
      )}

      <div className="bg-white p-3 rounded-3 shadow-sm mb-4">
        <h5 className="mb-3">
          <FiFilter className="me-2" /> Filters
        </h5>
        <Row>
          <Col md={3} className="mb-3">
            <Form.Label>Transaction Type</Form.Label>
            <Form.Select 
              name="type" 
              value={filters.type}
              onChange={handleFilterChange}
              size="sm"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </Form.Select>
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              name="category" 
              value={filters.category}
              onChange={handleFilterChange}
              size="sm"
            >
              <option value="all">All Categories</option>
              <option value="shopping">Shopping</option>
              <option value="salary">Salary</option>
              <option value="transfer">Transfer</option>
              <option value="bills">Bills</option>
              <option value="food">Food & Dining</option>
            </Form.Select>
          </Col>
          <Col md={2} className="mb-3">
            <Form.Label>From Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              size="sm"
            />
          </Col>
          <Col md={2} className="mb-3">
            <Form.Label>To Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              size="sm"
            />
          </Col>
          <Col md={2} className="d-flex align-items-end mb-3">
            <Button 
              variant="primary" 
              size="sm" 
              className="w-100"
              onClick={() => {
                // Trigger a re-render to apply filters
                setFilters({...filters});
              }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </div>

      <div className="bg-white rounded-3 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <TransactionRow 
                    key={transaction.id} 
                    transaction={transaction} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No transactions found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
};

export default TransactionsPage;