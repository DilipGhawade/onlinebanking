import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
import { FiUser, FiBriefcase, FiTrendingUp, FiPlus } from "react-icons/fi";

const loanTypes = [
  {
    id: 1,
    title: "Personal Loans",
    amount: "₹50,000",
    icon: <FiUser className="text-primary" size={24} />,
    bg: "#e3f2fd"
  },
  {
    id: 2,
    title: "Corporate Loans",
    amount: "₹1,00,000",
    icon: <FiBriefcase className="text-warning" size={24} />,
    bg: "#fff8e1"
  },
  {
    id: 3,
    title: "Business Loans",
    amount: "₹5,00,000",
    icon: <FiTrendingUp className="text-danger" size={24} />,
    bg: "#fce4ec"
  },
  {
    id: 4,
    title: "Custom Loans",
    amount: "Choose Money",
    icon: <FiPlus className="text-success" size={24} />,
    bg: "#e8f5e9"
  }
];

const activeLoans = [
  {
    id: 1,
    loanMoney: "₹10,000",
    leftToRepay: "₹8,500",
    duration: "12 months",
    interestRate: "10.5%",
    installment: "₹875"
  },
  {
    id: 2,
    loanMoney: "₹25,000",
    leftToRepay: "₹18,200",
    duration: "24 months",
    interestRate: "9.75%",
    installment: "₹1,150"
  },
  {
    id: 3,
    loanMoney: "₹50,000",
    leftToRepay: "₹42,300",
    duration: "36 months",
    interestRate: "8.9%",
    installment: "₹1,550"
  },
  {
    id: 4,
    loanMoney: "₹15,000",
    leftToRepay: "₹12,100",
    duration: "12 months",
    interestRate: "11.2%",
    installment: "₹1,300"
  },
  {
    id: 5,
    loanMoney: "₹30,000",
    leftToRepay: "₹22,400",
    duration: "24 months",
    interestRate: "9.25%",
    installment: "₹1,375"
  }
];

// Calculate totals for the summary row
const totalLoanMoney = activeLoans.reduce((sum, loan) => sum + parseInt(loan.loanMoney.replace(/[^0-9]/g, '')), 0);
const totalLeftToRepay = activeLoans.reduce((sum, loan) => sum + parseInt(loan.leftToRepay.replace(/[^0-9]/g, '')), 0);
const totalInstallment = activeLoans.reduce((sum, loan) => sum + parseFloat(loan.installment.replace(/[^0-9.]/g, '')), 0);

export function LoansPage() {
  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Loans</h4>
        <Button variant="primary" size="sm">
          <FiPlus className="me-1" /> Apply for Loan
        </Button>
      </div>

      {/* Loan Type Cards */}
      <Row className="mb-4 g-3">
        {loanTypes.map((loan) => (
          <Col key={loan.id} xs={12} sm={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: loan.bg
                  }}
                >
                  {loan.icon}
                </div>
                <div>
                  <h6 className="mb-0">{loan.title}</h6>
                  <h5 className="mb-0">{loan.amount}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Active Loans Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Active Loans Overview</h6>
            <Button variant="outline-primary" size="sm">View All</Button>
          </div>
          
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Loan Money</th>
                  <th>Left to repay</th>
                  <th>Duration</th>
                  <th>Interest rate</th>
                  <th>Installment</th>
                  <th>Repay</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan, index) => (
                  <tr key={loan.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{loan.loanMoney}</td>
                    <td>{loan.leftToRepay}</td>
                    <td>{loan.duration}</td>
                    <td>{loan.interestRate}</td>
                    <td>₹{loan.installment}</td>
                    <td>
                      <Button variant="outline-primary" size="sm">Repay</Button>
                    </td>
                  </tr>
                ))}
                {/* Summary Row */}
                <tr className="fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                  <td colSpan="1">Total</td>
                  <td>₹{totalLoanMoney.toLocaleString()}</td>
                  <td>₹{totalLeftToRepay.toLocaleString()}</td>
                  <td colSpan="2"></td>
                  <td>₹{totalInstallment.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Loan Information Section */}
      <Row className="mt-4 g-3">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Loan Application Status</h6>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="mb-1">Personal Loan</h6>
                  <small className="text-muted">Application #L-12345</small>
                </div>
                <span className="badge bg-warning text-dark">In Review</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1">Business Loan</h6>
                  <small className="text-muted">Application #L-12346</small>
                </div>
                <span className="badge bg-success">Approved</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Upcoming EMI</h6>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="mb-1">Personal Loan EMI</h6>
                  <small className="text-muted">Due on 15th Jun 2024</small>
                </div>
                <div className="text-end">
                  <h6 className="mb-0">₹8,750</h6>
                  <Button variant="outline-primary" size="sm" className="mt-1">Pay Now</Button>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1">Business Loan EMI</h6>
                  <small className="text-muted">Due on 20th Jun 2024</small>
                </div>
                <div className="text-end">
                  <h6 className="mb-0">₹12,500</h6>
                  <Button variant="outline-primary" size="sm" className="mt-1">Pay Now</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
