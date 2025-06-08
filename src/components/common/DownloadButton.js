// src/components/common/DownloadButton.js
import React, { useState } from 'react';
import { Button, ProgressBar, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiDownload, FiCheck } from 'react-icons/fi';

const DownloadButton = ({ 
  onDownload, 
  buttonText = 'Download',
  buttonVariant = 'outline-secondary',
  size = 'sm',
  disabled = false
}) => {
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleClick = async () => {
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    
    try {
      const success = await onDownload((progress) => {
        setDownloadProgress(progress);
      });
      
      if (success) {
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      } else {
        setDownloadStatus('error');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('error');
    }
  };

  if (downloadStatus === 'downloading') {
    return (
      <div style={{ minWidth: '120px' }}>
        <ProgressBar 
          now={downloadProgress} 
          label={`${downloadProgress}%`} 
          animated 
          style={{ height: '24px', width: '120px' }}
        />
      </div>
    );
  }

  if (downloadStatus === 'success') {
    return (
      <Button variant="success" size={size} disabled>
        <FiCheck className="me-1" /> Done
      </Button>
    );
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip>Download transaction receipt</Tooltip>}
    >
      <Button
        variant={buttonVariant}
        size={size}
        onClick={handleClick}
        disabled={downloadStatus === 'downloading' || disabled}
      >
        <FiDownload className="me-1" />
        {buttonText}
      </Button>
    </OverlayTrigger>
  );
};

export default DownloadButton;