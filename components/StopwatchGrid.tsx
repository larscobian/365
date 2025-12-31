import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

const StopwatchItem: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (milliseconds: number) => {
    const mins = Math.floor((milliseconds / 60000) % 60);
    const secs = Math.floor((milliseconds / 1000) % 60);
    const ms = Math.floor((milliseconds / 10) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0f111a] p-3 rounded-xl border border-gray-800 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
         <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'animate-pulse ' + color : 'bg-gray-800'}`}></div>
      </div>
      
      <div className="text-xl lg:text-xl xl:text-2xl font-mono font-bold text-white tracking-tight mb-2 text-center">
        {formatTime(time)}
      </div>

      <div className="flex gap-2 mt-auto">
        <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-colors ${isRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
        >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button 
            onClick={() => { setIsRunning(false); setTime(0); }}
            className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
            <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
};

const StopwatchGrid: React.FC = () => {
  return (
    <div className="bg-[#1c1f2e] p-5 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[280px]">
      <h3 className="text-white font-bold text-lg mb-4">Active Timers</h3>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <StopwatchItem label="Work" color="bg-blue-500" />
        <StopwatchItem label="Study" color="bg-purple-500" />
        <StopwatchItem label="Exercise" color="bg-orange-500" />
        <StopwatchItem label="Meditation" color="bg-teal-500" />
      </div>
    </div>
  );
};

export default StopwatchGrid;