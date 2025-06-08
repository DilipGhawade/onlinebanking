import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyActivityChart = () => {
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

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-bold">Weekly Activity</h5>
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
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: -20,
                bottom: 5,
              }}
              barGap={4}
              barCategoryGap="15%"
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
