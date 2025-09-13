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
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Analytics Reports</h2>
            <p className="text-gray-500 mt-1">View and download detailed reports</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
            <button
              onClick={handleDownload}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-semibold mb-4">Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedReport === 'monthly' ? monthlyData : yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-semibold mb-4">Bookings</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedReport === 'monthly' ? monthlyData : yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;