import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, MousePointer, ShoppingCart, Archive } from 'lucide-react';

const data = [
  { name: 'Page A', uv: 320 },
  { name: 'Page B', uv: 250 },
  { name: 'Page C', uv: 100 },
  { name: 'Page D', uv: 300 },
  { name: 'Page E', uv: 500 },
  { name: 'Page F', uv: 350 },
  { name: 'Page G', uv: 270 },
  { name: 'Page H', uv: 120 },
  { name: 'Page I', uv: 430 },
];

const ActiveUsersChart: React.FC = () => {
  return (
    <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[350px]">
      
      {/* Chart Section */}
      <div className="flex-1 w-full h-full min-h-[180px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={8}>
            <Bar dataKey="uv" radius={[10, 10, 10, 10]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#ffffff" fillOpacity={index % 3 === 0 ? 1 : 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Header/Stats moved to bottom based on layout flow or keep separate */}
      <div className="mb-6">
        <h3 className="text-white font-bold text-lg">Active Users</h3>
        <p className="text-sm text-gray-400">
            <span className="text-green-400 font-bold">(+23)</span> than last week
        </p>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem icon={Wallet} label="Users" value="32,984" color="bg-blue-500" />
          <StatItem icon={MousePointer} label="Clicks" value="2.42M" color="bg-blue-500" />
          <StatItem icon={ShoppingCart} label="Sales" value="2,400$" color="bg-blue-500" />
          <StatItem icon={Archive} label="Items" value="320" color="bg-blue-500" />
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
    <div>
        <div className="flex items-center gap-2 mb-1">
            <div className={`p-1 rounded ${color}`}>
                <Icon size={12} className="text-white" />
            </div>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
        <p className="text-white font-bold text-sm lg:text-base">{value}</p>
        {/* Simple progress bar under each stat */}
        <div className="w-full h-0.5 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-blue-500"></div>
        </div>
    </div>
);

export default ActiveUsersChart;