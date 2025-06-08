// src/components/ServicesPage.js
import React, { useState } from "react";
import { Container, Row, Col, Button, ProgressBar, Alert } from "react-bootstrap";
import { FiDownload, FiCheck } from "react-icons/fi";
import ServiceCard from "./common/ServiceCard";
import BankServiceCard from "./common/BankServiceCard";
import { generatePdf } from "../utils/PdfGenerator";
import { ServiceCards as serviceCards, bankServices } from "../utils/ServiceData";

function ServicesPage() {
  const [downloadProgress, setDownloadProgress] = useState(-1);
  const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle' | 'downloading' | 'success' | 'error'

  const handleDownloadPdf = async () => {
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.id = 'pdf-content';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.padding = '20px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.width = '210mm';
    
    // Format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Generate random transaction-like data for services
    const generateServiceTransactions = (services) => {
      const statuses = ['Active', 'Active', 'Active', 'Active', 'Pending', 'Expired'];
      const actions = ['Renewal', 'Activation', 'Upgrade', 'Maintenance', 'Review'];
      const now = new Date();
      
      return services.map(service => ({
        ...service,
        id: `SVC-${Math.floor(1000 + Math.random() * 9000)}`,
        lastUpdated: new Date(now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        actionRequired: Math.random() > 0.7 ? actions[Math.floor(Math.random() * actions.length)] : null,
        amount: service.features?.length ? `$${Math.floor(50 + Math.random() * 500)}` : 'Included'
      }));
    };

    const serviceTransactions = generateServiceTransactions([...serviceCards, ...bankServices]);
    
    // Add content to the container
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
              <img src="/images/banklogo.svg" alt="Bank Logo" style="height: 40px;">
              <h2 style="margin: 0; color: #1e3c72; font-size: 24px; font-weight: 600;">Apna Bank</h2>
            </div>
            <h3 style="margin: 0 0 5px 0; color: #1e3c72; font-size: 18px; font-weight: 500;">Bank Services Report</h3>
            <p style="margin: 0; color: #666;">Generated on: ${formatDate(new Date())}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #666;">Customer ID: CUST-${Math.floor(10000 + Math.random() * 90000)}</div>
            <div style="font-size: 12px; color: #666;">Report ID: RPT-${Date.now().toString().slice(-6)}</div>
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
          <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72;">
            <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Total Services</div>
            <div style="font-size: 24px; font-weight: bold; color: #1e3c72;">${serviceTransactions.length}</div>
          </div>
          <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
            <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Active Services</div>
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${serviceTransactions.filter(s => s.status === 'Active').length}</div>
          </div>
          <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <div style="font-size: 12px; color: #555; margin-bottom: 5px;">Action Required</div>
            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${serviceTransactions.filter(s => s.actionRequired).length}</div>
          </div>
        </div>
        
        <!-- Services Table -->
        <h3 style="color: #1e3c72; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #1e3c72;">Service Transactions</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
          <thead>
            <tr style="background-color: #f8f9fa; color: #555; text-align: left;">
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Service ID</th>
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Service Name</th>
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">Amount</th>
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Status</th>
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Last Updated</th>
              <th style="padding: 10px; border-bottom: 1px solid #dee2e6;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${serviceTransactions.map(service => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 10px;">${service.id}</td>
                <td style="padding: 12px 10px;">
                  <div style="font-weight: 500;">${service.title}</div>
                  <div style="font-size: 11px; color: #666; margin-top: 3px;">${service.description}</div>
                </td>
                <td style="padding: 12px 10px; text-align: right; font-weight: 500;">${service.amount}</td>
                <td style="padding: 12px 10px;">
                  <span style="
                    background: ${service.status === 'Active' ? '#e8f5e9' : service.status === 'Pending' ? '#fff8e1' : '#ffebee'};
                    color: ${service.status === 'Active' ? '#2e7d32' : service.status === 'Pending' ? '#ff8f00' : '#c62828'};
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                    display: inline-block;
                    min-width: 70px;
                    text-align: center;
                  ">
                    ${service.status}
                  </span>
                </td>
                <td style="padding: 12px 10px; font-size: 11px; color: #666;">${formatDate(service.lastUpdated)}</td>
                <td style="padding: 12px 10px;">
                  ${service.actionRequired ? `
                    <span style="
                      background: #fff3e0;
                      color: #e65100;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-weight: 500;
                      display: inline-block;
                    ">
                      ${service.actionRequired}
                    </span>
                  ` : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 11px; color: #888; text-align: center;">
          <p>This is an auto-generated report. For any discrepancies, please contact our customer support.</p>
          <p> ${new Date().getFullYear()} Apna Bank. All rights reserved.</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempContainer);
    
    try {
      const success = await generatePdf(
        'pdf-content',
        `bank-services-report-${new Date().toISOString().split('T')[0]}.pdf`,
        (progress) => {
          setDownloadProgress(progress);
        }
      );
      
      if (success) {
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      } else {
        setDownloadStatus('error');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      setDownloadStatus('error');
    } finally {
      // Clean up
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Services</h4>
      
      {/* Service Cards */}
      <Row className="g-3 mb-5">
        {serviceCards.map((service) => (
          <Col key={service.id} xs={12} md={6} lg={4}>
            <ServiceCard 
              title={service.title}
              description={service.description}
              icon={service.icon}
              bg={service.bg}
              textColor={service.textColor}
              features={service.features || []}
            />
          </Col>
        ))}
      </Row>

      {/* Bank Services List */}
      <h5 className="mb-4">Bank Services List</h5>
      <div className="d-flex flex-column gap-3">
        {bankServices.map((service) => (
          <BankServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Download Section */}
      <div className="mt-4 p-3 border rounded">
        <h5>Download Services Report</h5>
        <p className="text-muted">Generate a PDF report of all available services</p>
        
        {downloadStatus === 'downloading' && (
          <div className="mb-3">
            <ProgressBar 
              now={downloadProgress} 
              label={`${downloadProgress}%`} 
              animated 
              className="mb-2" 
            />
            <small className="text-muted">Generating PDF... Please wait</small>
          </div>
        )}
        
        {downloadStatus === 'success' && (
          <Alert variant="success" className="d-flex align-items-center">
            <FiCheck className="me-2" /> Report downloaded successfully!
          </Alert>
        )}
        
        {downloadStatus === 'error' && (
          <Alert variant="danger">
            Failed to generate PDF. Please try again.
          </Alert>
        )}
        
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleDownloadPdf}
          disabled={downloadStatus === 'downloading'}
        >
          <FiDownload className="me-2" />
          {downloadStatus === 'downloading' ? 'Generating...' : 'Download PDF Report'}
        </Button>
      </div>
    </Container>
  );
}

export default ServicesPage;