
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Rocket, Trophy, Calendar, Dumbbell, CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from './StatCard';
import { JournalEntry } from '../data/journal';
import { HabitCategory, HabitHistory } from './HabitTracker';

interface DashboardProps {
  journalEntries: Record<string, JournalEntry>;
}

const VISION_IMAGES = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80",
];

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Dashboard: React.FC<DashboardProps> = ({ journalEntries }) => {
  const today = new Date();
  
  // Logic: "Days current days that 2026 carries". 
  const startOf2026 = new Date('2026-01-01');
  const diffTime = today.getTime() - startOf2026.getTime(); 
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  
  const entriesCount = Object.keys(journalEntries).length;

  // --- Habit State ---
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [history, setHistory] = useState<HabitHistory>(() => {
      try {
          const saved = localStorage.getItem('habit_history_v2');
          return saved ? JSON.parse(saved) : {};
      } catch (e) { return {}; }
  });

  useEffect(() => {
      localStorage.setItem('habit_history_v2', JSON.stringify(history));
  }, [history]);

  // --- Vision Board State ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-6rem)]">
      
      {/* COLUMN 1: Stats & Vision */}
      <div className="flex flex-col gap-6 lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
                title="Progreso General" 
                value="0%" 
                icon={Rocket} 
                iconColorClass="bg-blue-500/10 text-blue-500"
            />
            <StatCard 
                title="Días Restantes" 
                value={`${diffDays}`} 
                icon={Calendar} 
                iconColorClass="bg-pink-500/10 text-pink-500"
            />
            <StatCard 
                title="Días Registrados" 
                value={`${entriesCount}/365`} 
                icon={Trophy} 
                iconColorClass="bg-purple-500/10 text-purple-500"
            />
            <StatCard 
                title="Sesiones Ejercicio" 
                value="0/104" 
                icon={Dumbbell} 
                iconColorClass="bg-orange-500/10 text-orange-500"
            />
          </div>

          {/* Vision 2026 */}
          <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col gap-6 shadow-lg">
             {/* 16:9 Aspect Ratio Container */}
             <div className="w-full aspect-video relative rounded-xl overflow-hidden group">
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${VISION_IMAGES[currentImageIndex]}')` }} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-3 left-3">
                     <h3 className="text-white font-bold text-lg drop-shadow-md">Visión 2026</h3>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-between p-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + VISION_IMAGES.length) % VISION_IMAGES.length)} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"><ChevronLeft size={20}/></button>
                     <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % VISION_IMAGES.length)} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"><ChevronRight size={20}/></button>
                 </div>
             </div>
             
             <div>
                <blockquote className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500 leading-snug italic">
                    "La disciplina es el puente entre las metas y los logros. Este panel no es solo números, es el mapa hacia la persona en la que te estás convirtiendo."
                </blockquote>
             </div>
          </div>
      </div>

      {/* COLUMN 2: Monthly & Weekly Habits */}
      <div className="flex flex-col gap-6 lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
        <HabitCategory 
            category="monthly" 
            title="Hábitos Mensuales" 
            icon={CalendarRange} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-orange-500" 
            disableScroll={true}
        />
        <HabitCategory 
            category="weekly" 
            title="Hábitos Semanales" 
            icon={CalendarDays} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-purple-500"
            disableScroll={true}
        />
      </div>

      {/* COLUMN 3: Daily Habits (Long List) */}
      <div className="flex flex-col gap-6 h-full md:col-span-2 lg:col-span-1 overflow-hidden min-h-[500px]">
        {/* Date Selector Header */}
        <div className="bg-[#1c1f2e] p-4 rounded-2xl border border-gray-800/50 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="text-blue-500" size={20} />
                </div>
                <span className="font-bold text-white">Gestión de Hábitos</span>
            </div>
            <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#0f111a] border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>

        {/* Daily Habits List */}
        <HabitCategory 
            category="daily" 
            title="Hábitos Diarios" 
            icon={Calendar} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-blue-500" 
            className="flex-1 min-h-0"
            disableScroll={false}
        />
      </div>

    </div>
  );
};

export default Dashboard;
