import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('monthly');
  
  const monthlyData = [
    { name: 'Jan', revenue: 0, bookings: 0 },
    { name: 'Feb', revenue: 0, bookings: 0 },
    { name: 'Mar', revenue: 0, bookings: 0 },
    { name: 'Apr', revenue: 0, bookings: 0 },
    { name: 'May', revenue: 0, bookings: 0 },
    { name: 'Jun', revenue: 0, bookings: 0 },
  ];

  const yearlyData = [
    { name: '2019', revenue: 0, bookings: 0 },
    { name: '2020', revenue: 0, bookings: 0 },
    { name: '2021', revenue: 0, bookings: 0 },
    { name: '2022', revenue: 0, bookings: 0 },
    { name: '2023', revenue: 0, bookings: 0 },
  ];

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Downloading report...');
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Analytics Reports</h1>
        </div>
        <p className="text-neutral-300 text-lg">View and download detailed performance reports</p>
      </div>

      <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Performance Analytics</h2>
            <p className="text-neutral-300 mt-1">Track revenue and booking trends over time</p>
          </div>
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input-field"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-hover p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedReport === 'monthly' ? monthlyData : yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="revenue" fill="url(#gradientRevenue)" />
                  <defs>
                    <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-hover p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Bookings</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedReport === 'monthly' ? monthlyData : yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                  />
                  <Line type="monotone" dataKey="bookings" stroke="#d946ef" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Reports;