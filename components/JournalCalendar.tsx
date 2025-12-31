
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { JournalEntry, JOURNAL_TAGS, getRatingColor } from '../data/journal';

const days = Array.from({ length: 31 }, (_, i) => i + 1);

interface JournalCalendarProps {
  entries: Record<string, JournalEntry>;
}

const JournalCalendar: React.FC<JournalCalendarProps> = ({ entries }) => {
  // Use Oct 2025 for consistency with the design mock/Journal Page
  const year = 2025;
  const month = 9; // October (0-indexed)

  // Calculate offset for Monday start
  // Oct 1 2025 is Wednesday.
  // Mon=0, Tue=1, Wed=2. So we need 2 empty slots.
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="bg-[#1c1f2e] p-5 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[280px]">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="text-white font-bold text-lg">Journal Overview</h3>
            <p className="text-xs text-gray-400">Octubre 2025</p>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Spanish Mon-Sun Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={i} className="text-[10px] uppercase text-gray-500 font-bold">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 lg:gap-2 flex-1 content-start">
        {/* Dynamic Empty slots based on Monday Start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
        ))}
        
        {days.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = entries[dateStr];
            
            return (
                <div 
                    key={day} 
                    className={`min-h-[40px] sm:min-h-[50px] rounded-lg border flex flex-col items-center justify-between p-1 relative group cursor-default transition-colors ${entry ? 'bg-[#0f111a] border-gray-700' : 'border-transparent hover:bg-[#0f111a]/50'}`}
                >
                    <span className={`text-[10px] font-medium ${entry ? 'text-gray-300' : 'text-gray-600'}`}>{day}</span>
                    
                    {entry ? (
                      <>
                        {/* Dots for Tags */}
                        <div className="flex gap-0.5 justify-center w-full px-1">
                          {entry.tags.slice(0, 3).map(tagId => {
                              const tag = JOURNAL_TAGS.find(t => t.id === tagId);
                              if(!tag) return null;
                              return (
                                <div key={tagId} className={`w-1 h-1 rounded-full ${tag.dotClass}`} />
                              );
                          })}
                          {entry.tags.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-500" />}
                        </div>

                        {/* Rating Badge */}
                        <div className={`w-full text-center mt-1 text-[9px] font-bold rounded px-0.5 ${getRatingColor(entry.rating)}`}>
                          {entry.rating}
                        </div>
                      </>
                    ) : (
                      // Placeholder empty state
                      <div className="w-full h-full" />
                    )}

                    {/* Tooltip for Summary */}
                    {entry?.summary && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-black/90 backdrop-blur p-2 rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none z-20 border border-gray-700 shadow-xl transition-opacity z-50">
                            <span className="font-bold text-blue-400 block mb-1">Rating: {entry.rating}/10</span>
                            {entry.summary.substring(0, 50)}...
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default JournalCalendar;
