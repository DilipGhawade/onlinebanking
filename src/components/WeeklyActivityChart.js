import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyActivityChart = ({ isMobile }) => {
  // Chart data
  const data = [
    { name: 'Sat', deposit: 480, withdraw: 240 },
    { name: 'Sun', deposit: 350, withdraw: 130 },
    { name: 'Mon', deposit: 330, withdraw: 260 },
    { name: 'Tue', deposit: 480, withdraw: 370 },
    { name: 'Wed', deposit: 150, withdraw: 250 },
    { name: 'Thu', deposit: 390, withdraw: 250 },
    { name: 'Fri', deposit: 400, withdraw: 340 },
  ];

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm" style={{ fontSize: '12px' }}>
          <p className="mb-1 fw-medium">{label}</p>
          <p className="mb-0" style={{ color: '#4e73df' }}>
            Deposit: {formatCurrency(payload[0].value)}
          </p>
          <p className="mb-0" style={{ color: '#1cc88a' }}>
            Withdraw: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <h5 className="mb-2 mb-md-0 fw-bold">Weekly Activity</h5>
          <div className="d-flex">
            <div className="d-flex align-items-center me-3">
              <div className="bg-primary rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
              <small className="text-muted">Deposit</small>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-success rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
              <small className="text-muted">Withdraw</small>
            </div>
          </div>
        </div>
        <div style={{ height: isMobile ? '220px' : '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: isMobile ? 5 : 10,
                left: isMobile ? -15 : -20,
                bottom: 5,
              }}
              barGap={isMobile ? 2 : 4}
              barCategoryGap={isMobile ? '10%' : '15%'}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                formatter={(value) => [`₹${value}`, '']}
              />
              <Bar 
                dataKey="deposit" 
                fill="#4e73df" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
              <Bar 
                dataKey="withdraw" 
                fill="#1cc88a" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityChart;
