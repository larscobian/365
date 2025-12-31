import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 200, revenue: 500 },
  { name: 'Feb', sales: 220, revenue: 250 },
  { name: 'Mar', sales: 280, revenue: 280 },
  { name: 'Apr', sales: 350, revenue: 200 },
  { name: 'May', sales: 360, revenue: 480 },
  { name: 'Jun', sales: 420, revenue: 250 },
  { name: 'Jul', sales: 440, revenue: 280 },
  { name: 'Aug', sales: 360, revenue: 520 },
  { name: 'Sep', sales: 410, revenue: 350 },
  { name: 'Oct', sales: 500, revenue: 300 },
  { name: 'Nov', sales: 400, revenue: 250 },
  { name: 'Dec', sales: 550, revenue: 400 },
];

const SalesChart: React.FC = () => {
  return (
    <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[350px]">
      <div className="mb-6">
        <h3 className="text-white font-bold text-lg">Sales Overview</h3>
        <p className="text-sm text-gray-400">
            <span className="text-green-400 font-bold">(+5%) more</span> in 2021
        </p>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#2d3748" strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1a202c', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '12px' }}
            />
            <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#0ea5e9" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSales)" 
            />
            <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2dd4bf" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;