import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const data = [
    { name: 'Score', value: 93 },
    { name: 'Remaining', value: 7 },
  ];
const COLORS = ['#10b981', '#1e293b']; // Green and dark gray

const ReferralCard: React.FC = () => {
  return (
    <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col">
      <div className="flex justify-between items-start mb-6">
          <h3 className="text-white font-bold text-lg">Referral Tracking</h3>
          <button className="bg-[#2d3748] p-1 rounded text-gray-400 hover:text-white"><MoreHorizontal size={16}/></button>
      </div>

      <div className="flex gap-4 h-full">
          {/* Text Stats */}
          <div className="flex flex-col justify-between flex-1 gap-4">
              <div className="bg-[#0f111a] p-4 rounded-xl border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Invited</p>
                  <p className="text-white font-bold text-lg">145 people</p>
              </div>
              <div className="bg-[#0f111a] p-4 rounded-xl border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Bonus</p>
                  <p className="text-white font-bold text-lg">1,465</p>
              </div>
          </div>

          {/* Gauge */}
          <div className="flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                    <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-[10px] uppercase tracking-wider">Safety</span>
                <span className="text-white text-2xl font-bold">9.3</span>
                <span className="text-gray-500 text-[10px]">Total Score</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ReferralCard;