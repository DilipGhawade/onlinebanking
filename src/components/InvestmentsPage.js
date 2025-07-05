import React, { useState, useEffect } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form,
  Spinner,
  Alert
} from "react-bootstrap";
import { 
  FiTrendingUp, 
  FiPieChart, 
  FiDollarSign, 
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiHome,
  FiDollarSign as FiDollar,
  FiPieChart as FiChart,
  FiTrendingUp as FiStock,
  FiAward,
  FiCreditCard,
  FiGlobe,
  FiBriefcase
} from "react-icons/fi";
import { FaBitcoin } from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { userAPI } from "../services/api";
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

// Investment types with icons and colors
const investmentTypes = [
  { 
    id: 'stocks', 
    name: 'Stocks', 
    icon: <FiStock size={20} />, 
    color: '#4e73df' 
  },
  { 
    id: 'mutual_funds', 
    name: 'Mutual Funds', 
    icon: <FiPieChart size={20} />, 
    color: '#1cc88a' 
  },
  { 
    id: 'fixed_deposit', 
    name: 'Fixed Deposit', 
    icon: <FiDollar size={20} />, 
    color: '#36b9cc' 
  },
  { 
    id: 'gold', 
    name: 'Gold', 
    icon: <FiAward size={20} />, 
    color: '#f6c23e' 
  },
  { 
    id: 'real_estate', 
    name: 'Real Estate', 
    icon: <FiHome size={20} />, 
    color: '#e74a3b' 
  },
  { 
    id: 'crypto', 
    name: 'Crypto', 
    icon: <FaBitcoin size={20} />, 
    color: '#6f42c1' 
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: <FiBriefcase size={20} />, 
    color: '#858796' 
  },
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks',
    amount: '',
    currentValue: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Fetch investments data
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        // Assuming user ID 1 for now, replace with actual user ID from auth context
        const data = await userAPI.getInvestments(1);
        setInvestments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch investments:', err);
        setError('Failed to load investments. Please try again later.');
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestments();
  }, []);
  
  // Calculate total invested amount
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || inv.amount || 0), 0);
  const totalReturn = totalInvested > 0 
    ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 
    : 0;
    
  // Calculate pagination
  const totalPages = Math.ceil(investments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = investments.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'currentValue' 
        ? value.replace(/\D/g, '') // Allow only numbers
        : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Investment name is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const investmentData = {
        ...formData,
        userId: 1, // Replace with actual user ID from auth context
        amount: parseFloat(formData.amount),
        currentValue: formData.currentValue 
          ? parseFloat(formData.currentValue) 
          : parseFloat(formData.amount),
        return: formData.currentValue
          ? ((parseFloat(formData.currentValue) - parseFloat(formData.amount)) / parseFloat(formData.amount)) * 100
          : 0,
        icon: investmentTypes.find(t => t.id === formData.type)?.icon || <FiBriefcase size={20} />,
        color: investmentTypes.find(t => t.id === formData.type)?.color || '#858796',
        updatedAt: new Date().toISOString()
      };

      let response;
      
      if (formData.id) {
        // Update existing investment
        response = await fetch(`http://localhost:3001/investments/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...investmentData,
            id: formData.id,
            createdAt: investments.find(inv => inv.id === formData.id)?.createdAt || new Date().toISOString()
          }),
        });
      } else {
        // Create new investment
        response = await fetch('http://localhost:3001/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...investmentData,
            createdAt: new Date().toISOString()
          }),
        });
      }
      
      if (!response.ok) {
        throw new Error(formData.id ? 'Failed to update investment' : 'Failed to save investment');
      }
      
      const savedInvestment = await response.json();
      
      // Update local state
      if (formData.id) {
        setInvestments(prev => 
          prev.map(inv => inv.id === savedInvestment.id ? savedInvestment : inv)
        );
        toast.success('Investment updated successfully!');
      } else {
        setInvestments(prev => [...prev, savedInvestment]);
        toast.success('Investment added successfully!');
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        type: 'stocks',
        amount: '',
        currentValue: '',
        notes: ''
      });
      
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Error saving investment:', err);
      toast.error(`Failed to ${formData.id ? 'update' : 'add'} investment. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  // Summary cards data
  const summaryCards = [
    {
      title: "Total Invested Amount",
      value: `₹${totalInvested.toLocaleString('en-IN')}`,
      icon: <FiDollarSign size={24} />,
      color: "#10b759",
      bg: "bg-light-success"
    },
    {
      title: "Number of Investments",
      value: investments.length.toLocaleString(),
      icon: <FiPieChart size={24} />,
      color: "#4e73df",
      bg: "bg-light-primary"
    },
    {
      title: "Total Return",
      value: formatPercentage(totalReturn),
      icon: <FiTrendingUp size={24} />,
      color: totalReturn >= 0 ? "#1cc88a" : "#e74a3b",
      bg: totalReturn >= 0 ? "bg-light-success" : "bg-light-danger"
    }
  ];

  // Prepare chart data from investments
  const prepareChartData = () => {
    // Group investments by type
    const investmentsByType = investments.reduce((acc, investment) => {
      const type = investmentTypes.find(t => t.id === investment.type)?.name || 'Other';
      if (!acc[type]) {
        acc[type] = {
          amount: 0,
          currentValue: 0,
          count: 0
        };
      }
      acc[type].amount += parseFloat(investment.amount || 0);
      acc[type].currentValue += parseFloat(investment.currentValue || investment.amount || 0);
      acc[type].count += 1;
      return acc;
    }, {});

    // Prepare data for the first chart (Investments by Type)
    const investmentTypesData = {
      labels: Object.keys(investmentsByType),
      datasets: [
        {
          label: 'Invested Amount (₹)',
          data: Object.values(investmentsByType).map(i => i.amount),
          backgroundColor: Object.keys(investmentsByType).map((_, index) => 
            `hsl(${(index * 360) / Object.keys(investmentsByType).length}, 70%, 60%)`
          ),
          borderColor: '#fff',
          borderWidth: 1
        }
      ]
    };

    // Prepare data for the second chart (Performance)
    const performanceData = {
      labels: investments.map(inv => inv.name).slice(0, 6), // Show up to 6 investments
      datasets: [
        {
          label: 'Invested Amount (₹)',
          data: investments.slice(0, 6).map(inv => inv.amount),
          backgroundColor: 'rgba(78, 115, 223, 0.6)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 1
        },
        {
          label: 'Current Value (₹)',
          data: investments.slice(0, 6).map(inv => inv.currentValue || inv.amount),
          backgroundColor: 'rgba(28, 200, 138, 0.6)',
          borderColor: 'rgba(28, 200, 138, 1)',
          borderWidth: 1
        }
      ]
    };

    return { investmentTypesData, performanceData };
  };

  const { investmentTypesData, performanceData } = prepareChartData();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y).replace('₹', '₹');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Handle edit investment
  const handleEditInvestment = (investment) => {
    setFormData({
      id: investment.id,
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString(),
      currentValue: investment.currentValue ? investment.currentValue.toString() : '',
      notes: investment.notes || ''
    });
    setShowAddModal(true);
  };

  // Handle delete investment
  const handleDeleteInvestment = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await fetch(`http://localhost:3001/investments/${id}`, {
          method: 'DELETE',
        });
        
        // Update local state
        setInvestments(prev => prev.filter(inv => inv.id !== id));
        toast.success('Investment deleted successfully!');
      } catch (err) {
        console.error('Error deleting investment:', err);
        toast.error('Failed to delete investment. Please try again.');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container fluid className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Investment Dashboard</h4>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FiPlus className="me-1" /> Add Investment
        </Button>
      </div>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div 
                  className={`rounded-circle p-3 me-3 ${card.bg}`}
                  style={{ color: card.color }}
                >
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
              <h6 className="mb-3">Investments by Type</h6>
              <div style={{ height: '250px' }}>
                <Doughnut data={investmentTypesData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Investment Performance</h6>
              <div style={{ height: '250px' }}>
                <Bar data={performanceData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Investments Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">My Investments</h6>
                <span className="text-muted small">{investments.length} items</span>
              </div>
              
              {investments.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FiPieChart size={48} className="text-muted" />
                  </div>
                  <h5>No investments yet</h5>
                  <p className="text-muted">Start by adding your first investment</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                    className="mt-2"
                  >
                    <FiPlus className="me-1" /> Add Investment
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Investment</th>
                        <th className="text-end">Invested</th>
                        <th className="text-end">Current Value</th>
                        <th className="text-end">Return</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item) => {
                        const returnValue = item.return || 0;
                        const returnClass = returnValue >= 0 ? 'text-success' : 'text-danger';
                        
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                  style={{
                                    width: '40px', 
                                    height: '40px', 
                                    backgroundColor: `${item.color}20`,
                                    color: item.color
                                  }}
                                >
                                  {investmentTypes.find(t => t.id === item.type)?.icon || <FiBriefcase size={20} />}
                                </div>
                                <div>
                                  <h6 className="mb-0">{item.name}</h6>
                                  <small className="text-muted">
                                    {investmentTypes.find(t => t.id === item.type)?.name || 'Other'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="fw-medium">{formatCurrency(item.amount)}</div>
                            </td>
                            <td className="text-end">
                              <div className="fw-medium">
                                {formatCurrency(item.currentValue || item.amount)}
                              </div>
                            </td>
                            <td className={`text-end ${returnClass} fw-medium`}>
                              {formatPercentage(returnValue)}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="text-primary me-2"
                                  onClick={() => handleEditInvestment(item)}
                                  title="Edit"
                                >
                                  <FiEdit2 />
                                </Button>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="text-danger"
                                  onClick={() => handleDeleteInvestment(item.id)}
                                  title="Delete"
                                >
                                  <FiTrash2 />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav>
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          
                          {pageNumbers.map(number => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(number)}
                              >
                                {number}
                              </button>
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Add Investment Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Edit Investment' : 'Add New Investment'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Investment Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Apple Stocks, SBI Mutual Fund"
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Investment Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {investmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Invested Amount (₹)</Form.Label>
                  <Form.Control
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="E.g., 50000"
                    isInvalid={!!formErrors.amount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.amount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Value (₹) <small className="text-muted">Optional</small></Form.Label>
                  <Form.Control
                    type="text"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                    placeholder="Leave empty if same as invested"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes <small className="text-muted">Optional</small></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this investment"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
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
                  {formData.id ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                formData.id ? 'Update Investment' : 'Add Investment'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
