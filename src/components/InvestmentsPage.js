import React from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { FiTrendingUp, FiPieChart, FiDollarSign } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function InvestmentsPage() {
  // Data for summary cards
  const summaryCards = [
    {
      title: "Total Invested Amount",
      value: "₹15,00,000",
      icon: <FiDollarSign className="text-success" size={24} />,
      bg: "bg-light-success"
    },
    {
      title: "Number of Investments",
      value: "1,250",
      icon: <FiPieChart className="text-danger" size={24} />,
      bg: "bg-light-danger"
    },
    {
      title: "Rate of Return",
      value: "+5.80%",
      icon: <FiTrendingUp className="text-primary" size={24} />,
      bg: "bg-light-primary"
    }
  ];

  // Chart data for Yearly Total Investment
  const yearlyData = {
    labels: ['2016', '2017', '2018', '2019', '2020', '2021'],
    datasets: [
      {
        label: 'Yearly Investment',
        data: [10000, 15000, 20000, 25000, 30000, 40000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for Monthly Revenue
  const monthlyData = {
    labels: ['2016', '2017', '2018', '2019', '2020', '2021'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [15000, 18000, 22000, 28000, 32000, 40000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  // My Investments data
  const myInvestments = [
    {
      id: 1,
      name: 'Apple Store',
      category: 'Technology',
      value: '54,000',
      return: '+16%',
      returnClass: 'text-success',
      logo: '🍎'
    },
    {
      id: 2,
      name: 'Samsung Mobile',
      category: 'Electronics',
      value: '32,500',
      return: '+8%',
      returnClass: 'text-success',
      logo: '📱'
    },
    {
      id: 3,
      name: 'Tesla Motors',
      category: 'Automobile',
      value: '45,200',
      return: '+12%',
      returnClass: 'text-success',
      logo: '🚗'
    }
  ];

  // Trending stocks data
  const trendingStocks = [
    { id: 1, name: 'Trivago', price: '₹520', return: '+5%', returnClass: 'text-success' },
    { id: 2, name: 'Canon', price: '₹480', return: '+10%', returnClass: 'text-success' },
    { id: 3, name: 'Uber Food', price: '₹350', return: '-3%', returnClass: 'text-danger' },
    { id: 4, name: 'Nokia', price: '₹940', return: '+2%', returnClass: 'text-success' },
    { id: 5, name: 'Tiktok', price: '₹670', return: '-12%', returnClass: 'text-danger' }
  ];

  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Investment Dashboard</h4>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle p-3 me-3 ${card.bg}`}>
                  {card.icon}
                </div>
                <div>
                  <h6 className="mb-1 text-muted">{card.title}</h6>
                  <h4 className="mb-0">{card.value}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Yearly Total Investment</h6>
              <div style={{ height: '250px' }}>
                <Line data={yearlyData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Monthly Revenue</h6>
              <div style={{ height: '250px' }}>
                <Line data={monthlyData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Investments and Trending Stocks */}
      <Row>
        <Col lg={6} className="mb-3 mb-lg-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">My Investment</h6>
                <a href="#" className="text-primary small">View All</a>
              </div>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <tbody>
                    {myInvestments.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-0">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light p-2 me-3">
                              <span className="fs-5">{item.logo}</span>
                            </div>
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              <small className="text-muted">{item.category}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-end">
                          <h6 className="mb-0">₹{item.value}</h6>
                          <small className={item.returnClass}>
                            {item.return}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Trending Stock</h6>
                <a href="#" className="text-primary small">View All</a>
              </div>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>SL No</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendingStocks.map((stock) => (
                      <tr key={stock.id}>
                        <td>{stock.id}</td>
                        <td>{stock.name}</td>
                        <td>{stock.price}</td>
                        <td className={stock.returnClass}>{stock.return}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
