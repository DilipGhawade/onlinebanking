import React from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { 
  FiArrowUp, 
  FiArrowDown,
  FiMoreVertical
} from 'react-icons/fi';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const TransactionIcon = ({ iconName, color }) => {
  const IconComponent = {
    'arrow-up': FiArrowUp,
    'arrow-down': FiArrowDown,
    'more-vertical': FiMoreVertical
  }[iconName] || FiMoreVertical;
  
  return <IconComponent style={{ color }} />;
};

const RecentTransactions = ({ 
  transactions = [], 
  isLoading = false, 
  maxItems = 5,
  showViewAll = true,
  onViewAll = () => {}
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No transactions found
      </div>
    );
  }

  const displayedTransactions = maxItems ? transactions.slice(0, maxItems) : transactions;

  return (
    <div className="recent-transactions">
      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-end">Amount</th>
              <th className="text-end">Date</th>
              <th className="text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center justify-content-center bg-light rounded-circle me-2" style={{ width: 36, height: 36 }}>
                      <TransactionIcon 
                        iconName={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                        color={transaction.type === 'income' ? '#10b759' : '#f23c49'} 
                      />
                    </div>
                    <div>
                      <div className="fw-medium">{transaction.description}</div>
                      <small className="text-muted">{transaction.category}</small>
                    </div>
                  </div>
                </td>
                <td className={`text-end fw-medium ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </td>
                <td className="text-end text-muted">
                  <small>{formatDate(transaction.date)}</small>
                </td>
                <td className="text-end">
                  <Badge bg={transaction.status === 'completed' ? 'success' : 'warning'} className="text-uppercase">
                    {transaction.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {showViewAll && transactions.length > maxItems && (
        <div className="text-end mt-3">
          <button 
            className="btn btn-link p-0 text-decoration-none"
            onClick={onViewAll}
          >
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
