import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';

const data = [
  { name: 'Satisfaction', value: 95 },
  { name: 'Remaining', value: 5 },
];
const COLORS = ['#3b82f6', '#1e293b']; // Blue and dark gray

const SatisfactionCard: React.FC = () => {
  return (
    <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col relative">
      <h3 className="text-white font-bold text-lg mb-1">Satisfaction Rate</h3>
      <p className="text-gray-400 text-xs mb-4">From all projects</p>

      <div className="flex-1 min-h-[150px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Icon */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 p-3 rounded-full shadow-lg shadow-blue-500/30">
            <Smile className="text-white" size={24} />
        </div>

        {/* Labels */}
        <span className="absolute bottom-[15%] left-[10%] text-xs text-gray-500">0%</span>
        <span className="absolute bottom-[15%] right-[10%] text-xs text-gray-500">100%</span>
      </div>

      <div className="text-center mt-[-20px]">
          <h2 className="text-3xl font-bold text-white">95%</h2>
          <p className="text-xs text-gray-400">Based on likes</p>
      </div>
    </div>
  );
};

export default SatisfactionCard;