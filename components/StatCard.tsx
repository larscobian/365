
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  subtextHighlight?: string;
  icon: LucideIcon;
  iconColorClass: string; // e.g. 'bg-blue-500'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, subtextHighlight, icon: Icon, iconColorClass }) => {
  return (
    <div className="bg-[#1c1f2e] p-5 rounded-2xl border border-gray-800/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0 flex-1 pr-2">
        <h3 className="text-gray-400 text-xs font-medium mb-1 whitespace-nowrap truncate" title={title}>{title}</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{value}</span>
            {(subtext || subtextHighlight) && (
                <span className="text-xs text-gray-500 truncate">
                    {subtext} <span className={`${subtextHighlight ? 'text-blue-400' : ''}`}>{subtextHighlight}</span>
                </span>
            )}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorClass} shrink-0`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatCard;
