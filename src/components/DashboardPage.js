import React, { useState } from "react";
import WeeklyActivityChart from "./WeeklyActivityChart";

const cards = [
  {
    id: 1,
    bank: "BankDash Platinum",
    number: "**** **** **** 1234",
    holder: "Nidisha",
    expiry: "12/27",
    balance: "₹75,000",
    type: "Visa",
    bg: "#4e73df",
  },
  {
    id: 2,
    bank: "BankDash Gold",
    number: "**** **** **** 5678",
    holder: "Nidisha",
    expiry: "11/26",
    balance: "₹32,500",
    type: "Mastercard",
    bg: "#f39c12",
  },
];

const transactions = [
  { id: 1, date: "2025-06-01", desc: "Amazon Purchase", amount: "-₹2,500", type: "expense" },
  { id: 2, date: "2025-05-30", desc: "Salary Credit", amount: "+₹50,000", type: "income" },
  { id: 3, date: "2025-05-29", desc: "Coffee Shop", amount: "-₹250", type: "expense" },
  { id: 4, date: "2025-05-28", desc: "Electricity Bill", amount: "-₹1,800", type: "expense" },
];

export function DashboardPage() {
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const prevCard = () => setCurrent((c) => (c === 0 ? cards.length - 1 : c - 1));
  const nextCard = () => setCurrent((c) => (c === cards.length - 1 ? 0 : c + 1));

  const filteredTransactions = activeTab === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === activeTab);

  // Calculate totals
  const totalBalance = 107500;
  const totalIncome = 50000;
  const totalExpense = 4550;

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* <h4 className="mb-4 fw-bold">Dashboard</h4> */}
      
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-start-primary border-0 border-start-3 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <i className="fas fa-wallet text-primary"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                    Total Balance
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">₹{totalBalance.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-start-success border-0 border-start-3 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <i className="fas fa-arrow-down text-success"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-success text-uppercase mb-1">
                    Income
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">₹{totalIncome.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-start-danger border-0 border-start-3 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                  <i className="fas fa-arrow-up text-danger"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                    Expense
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">₹{totalExpense.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-12 col-lg-8">
          {/* My Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold">My Card</h5>
                {cards.length > 1 && (
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={prevCard}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={nextCard}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="card text-white" style={{ background: cards[current].bg, borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-4">Current Balance</h6>
                      <h3 className="mb-4">{cards[current].balance}</h3>
                      <div className="d-flex mb-3">
                        <div className="me-4">
                          <small className="d-block text-white-50">Card Holder</small>
                          <span>{cards[current].holder}</span>
                        </div>
                        <div>
                          <small className="d-block text-white-50">Expires</small>
                          <span>{cards[current].expiry}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="badge bg-white text-dark p-2 mb-4">{cards[current].type}</div>
                      <div className="text-white-50">
                        <div>•••• •••• •••• {cards[current].number.slice(-4)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <WeeklyActivityChart />
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Recent Transactions</h5>
                <div className="btn-group btn-group-sm">
                  <button 
                    className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveTab('income')}
                  >
                    Income
                  </button>
                  <button 
                    className={`btn ${activeTab === 'expense' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setActiveTab('expense')}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div className="transaction-list">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                      <div className={`rounded-circle p-2 me-3 ${tx.type === 'income' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                        <i className={`fas ${tx.type === 'income' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{tx.desc}</div>
                        <small className="text-muted">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </small>
                      </div>
                      <div className={`fw-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {tx.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    No transactions found
                  </div>
                )}
              </div>

              <div className="text-center mt-3">
                <button className="btn btn-link text-primary text-decoration-none p-0">
                  View all transactions <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}