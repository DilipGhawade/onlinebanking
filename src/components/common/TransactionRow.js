// src/components/common/TransactionRow.js
import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FiDownload } from 'react-icons/fi';
import DownloadButton from './DownloadButton';
import { generateTransactionPdf } from '../../utils/PdfGenerator';

const TransactionRow = ({ transaction, onDownload }) => {
  const handleDownloadReceipt = async (onProgress) => {
    return generateTransactionPdf(transaction, onProgress);
  };

  return (
    <tr>
      <td>{transaction.id}</td>
      <td>{transaction.description}</td>
      <td>
        <Badge bg={transaction.type === 'credit' ? 'success' : 'danger'}>
          {transaction.type}
        </Badge>
      </td>
      <td>{new Date(transaction.date).toLocaleDateString()}</td>
      <td className={transaction.type === 'credit' ? 'text-success' : 'text-danger'}>
        {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
      </td>
      <td>
        <DownloadButton 
          onDownload={handleDownloadReceipt}
          buttonText="Receipt"
          buttonVariant="outline-primary"
          size="sm"
        />
      </td>
    </tr>
  );
};

export default TransactionRow;