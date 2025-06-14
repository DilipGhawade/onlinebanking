import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyActivityChart = ({ transactions = [] }) => {
  const chartRef = useRef(null);
  
  // Get dates for the last 7 days
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  };

  // Process transaction data
  const processData = () => {
    const days = getLast7Days();
    const incomeData = new Array(7).fill(0);
    const expenseData = new Array(7).fill(0);

    transactions.forEach(tx => {
      const txDate = new Date(tx.date).toISOString().split('T')[0];
      const dayIndex = days.indexOf(txDate);
      
      if (dayIndex !== -1) {
        const amount = Math.abs(parseFloat(tx.amount) || 0);
        if (tx.type === 'income') {
          incomeData[dayIndex] += amount;
        } else if (tx.type === 'expense') {
          expenseData[dayIndex] += amount;
        }
      }
    });

    return {
      labels: days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      incomeData,
      expenseData,
    };
  };

  const { labels, incomeData, expenseData } = processData();

  const options = {
    responsive: true,
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
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: expenseData,
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="card shadow h-100">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Weekly Activity</h6>
      </div>
      <div className="card-body">
        <div style={{ height: '300px' }}>
          <Bar options={options} data={data} ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityChart;
