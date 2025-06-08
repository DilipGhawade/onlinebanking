// src/utils/PdfGenerator.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { pdfStyles } from './PdfStyles';

export const generatePdf = async (elementId, filename, onProgress) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    return false;
  }

  try {
    if (onProgress) onProgress(10);
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      onclone: (document) => {
        if (onProgress) onProgress(30);
      }
    });
    
    if (onProgress) onProgress(60);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    
    if (onProgress) onProgress(90);

    pdf.save(filename);
    if (onProgress) onProgress(100);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onProgress) onProgress(-1);
    return false;
  }
};

export const generateTransactionPdf = async (transaction, onProgress) => {
  const tempContainer = document.createElement('div');
  tempContainer.id = 'transaction-pdf-content';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.padding = '20px';
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.width = '210mm';
  
  // Format date and time separately
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const amountColor = transaction.type === 'credit' ? '#198754' : '#dc3545';
  const amountSign = transaction.type === 'credit' ? '+' : '-';
  const amountText = `${amountSign}${formatAmount(Math.abs(transaction.amount))}`;
  const transactionDate = new Date(transaction.date);
  const receiptNumber = `RCPT${transaction.id.replace(/[^0-9]/g, '')}`;

  // Sample user data - in a real app, this would come from your user context
  const userData = {
    name: 'John Doe',
    accountNumber: 'XXXXXX7890',
    accountType: 'Savings',
    branch: 'Mumbai Main',
    ifsc: 'HDFC0000123',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210'
  };

  tempContainer.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
      <!-- Bank Header -->
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-radius: 8px; 
                     display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <span style="color: white; font-size: 24px; font-weight: bold; font-family: 'Arial Black', Arial, sans-serif;">AB</span>
          </div>
          <div style="text-align: left;">
            <h1 style="margin: 0; color: #1e3c72; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">APNA BANK</h1>
            <p style="margin: 2px 0 0 0; color: #4a6da7; font-size: 12px; letter-spacing: 0.5px;">YOUR TRUSTED BANKING PARTNER</p>
          </div>
        </div>
      </div>

      <!-- Transaction Receipt Header -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        <div>
          <h2 style="margin: 0 0 5px 0; color: #333; font-size: 20px;">Transaction Receipt</h2>
          <p style="margin: 0; color: #666; font-size: 14px;">${formatDate(transaction.date)}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Receipt #: <strong>${receiptNumber}</strong></p>
          <p style="margin: 0; color: #666; font-size: 14px;">Status: <span style="color: #198754; font-weight: 500;">Completed</span></p>
        </div>
      </div>

      <!-- User & Account Details -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Account Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">Account Holder</p>
            <p style="margin: 0; font-weight: 500; font-size: 14px;">${userData.name}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">Account Number</p>
            <p style="margin: 0; font-weight: 500; font-size: 14px;">${userData.accountNumber}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">Account Type</p>
            <p style="margin: 0; font-weight: 500; font-size: 14px;">${userData.accountType}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">Branch</p>
            <p style="margin: 0; font-weight: 500; font-size: 14px;">${userData.branch}</p>
          </div>
        </div>
      </div>

      <!-- Transaction Details -->
      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; padding-bottom: 8px; border-bottom: 1px solid #eee;">
        Transaction Details
      </h3>
      
      <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 40%;">Transaction ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500;">${transaction.id}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Date & Time</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500;">
              ${formatDate(transaction.date)} at ${formatTime(transaction.date)}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Description</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; text-transform: capitalize;">
              ${transaction.description}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Category</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; text-transform: capitalize;">
              ${transaction.category || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">Transaction Type</td>
            <td style="padding: 10px 0; font-weight: 500; text-transform: capitalize;">
              <span style="color: ${amountColor};">${transaction.type === 'credit' ? 'Credit' : 'Debit'}</span>
            </td>
          </tr>
        </table>

        <!-- Amount Box -->
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 15px;">Transaction Amount</p>
          <p style="margin: 0; font-size: 28px; font-weight: 600; color: ${amountColor};">
            ${amountText}
          </p>
          <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">
            ${transaction.type === 'credit' ? 'Amount Credited to' : 'Amount Debited from'} your account
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
          Thank you for banking with us!
        </p>
        <p style="margin: 0; color: #6c757d; font-size: 12px;">
          For any queries, please contact our 24/7 customer care at 1800-123-4567
        </p>
        <p style="margin: 10px 0 0 0; color: #adb5bd; font-size: 11px;">
          This is a computer-generated receipt and does not require a signature.
        </p>
      </div>

      <!-- Bank Footer -->
      <div style="margin-top: 30px; text-align: center; padding-top: 15px; border-top: 2px solid #f0f0f0;">
        <p style="margin: 5px 0; color: #6c757d; font-size: 12px;">
          Apna Bank &copy; ${new Date().getFullYear()} | All Rights Reserved
        </p>
        <p style="margin: 5px 0; color: #6c757d; font-size: 11px;">
          A trusted banking partner, ensuring secure and seamless transactions
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(tempContainer);
  
  try {
    const success = await generatePdf(
      'transaction-pdf-content',
      `transaction-${transaction.id}.pdf`,
      onProgress
    );
    
    return success;
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};