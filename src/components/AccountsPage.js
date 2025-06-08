import React, { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  ListGroup, 
  Badge,
  Button,
  ProgressBar,
  Tab,
  Tabs,
  Form,
  Container
} from "react-bootstrap";
import { 
  Wallet as WalletIcon, 
  ArrowDownCircle as IncomeIcon, 
  ArrowUpCircle as ExpenseIcon, 
  PiggyBank as SavingsIcon,
  CreditCard as CreditCardIcon,
  Spotify,
  Phone,
  PersonPlus,
  Playstation,
  Apple,
  ThreeDotsVertical
} from "react-bootstrap-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Weekly Activity Chart Component
const WeeklyActivityChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            });
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const labels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Debit',
        data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
        backgroundColor: '#4e73df',
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 12,
      },
      {
        label: 'Credit',
        data: [800, 1200, 1000, 1800, 1500, 2000, 2200],
        backgroundColor: '#1cc88a',
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState('week');
  
  // Summary cards data
  const summaryCards = [
    {
      id: 1,
      title: "My Balance",
      amount: "$12,750",
      icon: <WalletIcon size={24} className="text-warning" />,
      bg: "bg-warning bg-opacity-10"
    },
    {
      id: 2,
      title: "Income",
      amount: "$5,600",
      icon: <IncomeIcon size={24} className="text-success" />,
      bg: "bg-success bg-opacity-10"
    },
    {
      id: 3,
      title: "Expense",
      amount: "$3,460",
      icon: <ExpenseIcon size={24} className="text-danger" />,
      bg: "bg-danger bg-opacity-10"
    },
    {
      id: 4,
      title: "Total Saving",
      amount: "$7,920",
      icon: <SavingsIcon size={24} className="text-primary" />,
      bg: "bg-primary bg-opacity-10"
    }
  ];

  // Recent transactions data
  const recentTransactions = [
    {
      id: 1,
      icon: <Spotify size={24} className="text-success" />,
      name: "Spotify Subscription",
      date: "25 Jan 2021",
      category: "Shopping",
      card: "1234 ****",
      status: "Pending",
      amount: "-$150"
    },
    {
      id: 2,
      icon: <Phone size={24} className="text-primary" />,
      name: "Mobile Service",
      date: "24 Jan 2021",
      category: "Service",
      card: "5678 ****",
      status: "Completed",
      amount: "-$340"
    },
    {
      id: 3,
      icon: <PersonPlus size={24} className="text-info" />,
      name: "Emilly Wilson",
      date: "23 Jan 2021",
      category: "Transfer",
      card: "9012 ****",
      status: "Completed",
      amount: "+$780"
    }
  ];

  // Invoices data
  const invoices = [
    {
      id: 1,
      icon: <Apple size={24} />,
      recipient: "Apple Store",
      time: "5h ago",
      amount: "$450"
    },
    {
      id: 2,
      icon: <PersonPlus size={24} className="text-primary" />,
      recipient: "Michael",
      time: "2 days ago",
      amount: "$160"
    },
    {
      id: 3,
      icon: <Playstation size={24} className="text-primary" />,
      recipient: "Playstation",
      time: "5 days ago",
      amount: "$1,085"
    },
    {
      id: 4,
      icon: <PersonPlus size={24} className="text-primary" />,
      recipient: "William",
      time: "10 days ago",
      amount: "$90"
    }
  ];

  return (
    <Container fluid className="px-3 px-md-4 py-4">
      {/* Summary Cards */}
      <Row className="g-3 g-md-4 mb-4">
        {summaryCards.map(card => (
          <Col xs={12} sm={6} lg={3} key={card.id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle p-3 me-3 ${card.bg}`}>
                  {card.icon}
                </div>
                <div>
                  <h6 className="mb-1 text-muted">{card.title}</h6>
                  <h5 className="mb-0 fw-bold">{card.amount}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Last Transaction */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Last Transaction</h5>
                <a href="#" className="text-decoration-none text-primary">See All</a>
              </div>
              <ListGroup variant="flush">
                {recentTransactions.map(tx => (
                  <ListGroup.Item key={tx.id} className="px-0 py-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">{tx.icon}</div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{tx.name}</h6>
                        <div className="d-flex align-items-center">
                          <small className="text-muted me-2">{tx.date}</small>
                          <small className="text-muted">{tx.category}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">{tx.card}</div>
                        <div className={`fw-medium ${tx.amount.startsWith('+') ? 'text-success' : 'text-dark'}`}>
                          {tx.amount}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Debit & Credit Overview */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Debit & Credit Overview</h5>
                <div className="btn-group">
                  {['week', 'month', 'year'].map(period => (
                    <Button
                      key={period}
                      variant={activeTab === period ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab(period)}
                      className="px-3"
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-1">$7,560 Debited & $5,420 Credited in this Week</h5>
                <p className="text-muted mb-0">You had 2% more debited than last week</p>
              </div>
              
              <div style={{ height: '250px' }}>
                <WeeklyActivityChart />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          {/* My Card */}
          <Card className="mb-4 border-0 text-white" style={{ background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">My Card</h5>
                <a href="#" className="text-white-50 text-decoration-none">See All</a>
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <small className="d-block text-white-50">Balance</small>
                    <h4 className="mb-0">$5,756</h4>
                  </div>
                  <img src="/images/chip.png" alt="Card Chip" style={{ height: '30px' }} />
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-white-50">CARD HOLDER</small>
                    <small className="text-white-50">VALID THRU</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Eddy Cusuma</h6>
                    <h6 className="mb-0">12/22</h6>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">3778 **** **** 1234</h5>
                  <img src="/images/visa.png" alt="Visa" style={{ height: '24px' }} />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Invoices Sent */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Invoices Sent</h5>
                <a href="#" className="text-primary text-decoration-none">See All</a>
              </div>
              
              <ListGroup variant="flush">
                {invoices.map(invoice => (
                  <ListGroup.Item key={invoice.id} className="px-0 py-3">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle p-2 me-3 bg-light`}>
                        {invoice.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{invoice.recipient}</h6>
                        <small className="text-muted">{invoice.time}</small>
                      </div>
                      <div className="fw-bold">{invoice.amount}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountsPage;
