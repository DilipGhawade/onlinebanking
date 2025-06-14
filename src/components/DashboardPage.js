import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import WeeklyActivityChart from "./WeeklyActivityChart";
import { userAPI, accountsAPI, transactionsAPI } from "../services/api";

export function DashboardPage() {
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user data
        const userResponse = await userAPI.getUserById(user.id);
        setUserData(userResponse.data);
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const prevCard = () => setCurrent((c) => (c === 0 ? (userData?.accounts?.length - 1 || 0) : c - 1));
  const nextCard = () => setCurrent((c) => (c === (userData?.accounts?.length - 1 || 0) ? 0 : c + 1));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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

  if (!userData) {
    return <div>No user data found</div>;
  }

  // Ensure transactions is an array and has the expected structure
  const transactions = Array.isArray(userData.transactions) 
    ? userData.transactions 
    : [];

  // Filter transactions based on active tab
  const filteredTransactions = activeTab === 'all' 
    ? transactions 
    : transactions.filter(tx => tx && tx.type && tx.type.toLowerCase() === activeTab.toLowerCase());

  // Calculate totals
  const accounts = Array.isArray(userData.accounts) ? userData.accounts : [];
  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc?.balance) || 0), 0);
  
  const totalIncome = transactions
    .filter(tx => tx && tx.type && tx.type.toLowerCase() === 'credit')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);
    
  const totalExpense = transactions
    .filter(tx => tx && tx.type && tx.type.toLowerCase() === 'debit')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Balance
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(totalBalance)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-wallet fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Income
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    +{formatCurrency(totalIncome)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-arrow-down fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Total Expenses
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    -{formatCurrency(totalExpense)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-arrow-up fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Cards Carousel */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">My Cards</h6>
              <div>
                <button 
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={prevCard}
                  disabled={!userData.accounts || userData.accounts.length <= 1}
                >
                  &lt;
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={nextCard}
                  disabled={!userData.accounts || userData.accounts.length <= 1}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="position-relative">
                {userData.accounts?.length > 0 ? (
                  <div className="d-flex overflow-hidden">
                    {userData.accounts.map((card, index) => (
                      <div 
                        key={card.id}
                        className={`card mb-4 ${index === current ? 'd-block' : 'd-none'}`}
                        style={{
                          minWidth: '100%',
                          borderLeft: `4px solid ${card.bg}`,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">{card.bank}</h5>
                            <span className="badge bg-primary">{card.type}</span>
                          </div>
                          <p className="card-text text-muted mb-1">**** **** **** {card.number.slice(-4)}</p>
                          <p className="card-text mb-1">{card.holder}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Expires: {card.expiry}</span>
                            <h4 className="mb-0">{formatCurrency(card.balance)}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No accounts found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Transactions */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Transactions</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'income' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveTab('income')}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'expense' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setActiveTab('expense')}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{new Date(transaction.date).toLocaleDateString()}</td>
                          <td>{transaction.desc}</td>
                          <td 
                            className={`text-end ${transaction.amount >= 0 ? 'text-success' : 'text-danger'}`}
                          >
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="col-lg-6 mb-4">
          <WeeklyActivityChart transactions={userData.transactions || []} />
        </div>
      </div>
    </div>
  );
}