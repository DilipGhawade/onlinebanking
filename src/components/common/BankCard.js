import React from 'react';
import PropTypes from 'prop-types';

const BankCard = ({
  cardNumber = '•••• •••• •••• 7890',
  cardHolder = 'Card Holder',
  expiry = '12/26',
  type = 'debit',
  bankLogo = '/images/banklogo.svg',
  cardNetworks = ['visa', 'mastercard', 'rupay'],
  className = '',
  style = {}
}) => {
  const networkIcons = {
    visa: '/images/cards/visa.svg',
    mastercard: '/images/cards/mastercard.svg',
    rupay: '/images/cards/rupay.svg'
  };

  return (
    <div 
      className={`bank-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        borderRadius: '12px',
        padding: '20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '300px',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            width: '40px',
            height: '30px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px'
          }}>
            <img src="/images/cards/chip.svg" alt="Card Chip" style={{ height: '24px' }} />
          </div>
          <img 
            src={bankLogo} 
            alt="Bank Logo" 
            style={{ 
              height: '24px', 
              filter: 'brightness(0) invert(1)' 
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {cardNetworks.map(network => (
            <img 
              key={network} 
              src={networkIcons[network]} 
              alt={network} 
              style={{ height: '20px' }} 
            />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: '0.8' }}>Card Number</p>
        <p style={{ margin: 0, fontSize: '18px', letterSpacing: '1px', fontFamily: 'monospace' }}>{cardNumber}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: '0.8' }}>Card Holder</p>
          <p style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase' }}>{cardHolder}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: '0.8' }}>Expires</p>
          <p style={{ margin: 0, fontSize: '14px' }}>{expiry}</p>
        </div>
      </div>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        fontSize: '10px', 
        opacity: '0.7',
        textTransform: 'uppercase'
      }}>
        {type}
      </div>
    </div>
  );
};

BankCard.propTypes = {
  cardNumber: PropTypes.string,
  cardHolder: PropTypes.string,
  expiry: PropTypes.string,
  type: PropTypes.oneOf(['debit', 'credit']),
  bankLogo: PropTypes.string,
  cardNetworks: PropTypes.arrayOf(PropTypes.oneOf(['visa', 'mastercard', 'rupay'])),
  className: PropTypes.string,
  style: PropTypes.object
};

export default BankCard;
