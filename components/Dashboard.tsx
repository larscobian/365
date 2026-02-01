
import * as React from 'react';
import { useState } from 'react';
import { Rocket, Trophy, Calendar, Dumbbell, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Plus, Trash2, Link as LinkIcon, X, Save, Download } from 'lucide-react';
import StatCard from './StatCard';
import { JournalEntry } from '../data/journal';
import { HabitCategory, HabitHistory, calculateStreak } from './HabitTracker';
import { useUserData } from '../hooks/useFirestore';

interface DashboardProps {
  journalEntries: Record<string, JournalEntry>;
}

const DEFAULT_VISION_IMAGES = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80",
];

const getTodayStr = () => {
    const d = new Date();
    // Ensuring format matches YYYY-MM-DD
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Dashboard: React.FC<DashboardProps> = ({ journalEntries }) => {
  const today = new Date();
  
  // Logic updated for 2026 context
  const startOf2026 = new Date('2026-01-01');
  const endOf2026 = new Date('2026-12-31');
  
  // Calculate days passed in 2026
  let diffDays = 365;
  if (today.getFullYear() === 2026) {
      const diffTime = endOf2026.getTime() - today.getTime(); 
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  } else if (today.getFullYear() > 2026) {
      diffDays = 0;
  }
  
  const entriesCount = Object.keys(journalEntries).filter(date => date.startsWith('2026')).length;

  // --- Habit State ---
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [history, setHistory] = useUserData<HabitHistory>('habit_history_v2', {});

  // Calculate Exercise Progress (w1 = Weekly Exercise, target 104 sessions/year)
  const exerciseTotal = Object.keys(history)
      .filter(date => date.startsWith('2026'))
      .reduce((acc, date) => {
          const val = history[date]?.['w1'];
          return acc + (parseFloat(val as string) || 0);
      }, 0);

  // --- Vision Board State ---
  const [visionImages, setVisionImages] = useUserData<string[]>('vision_board_images', DEFAULT_VISION_IMAGES);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleNextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % visionImages.length);
  };

  const handlePrevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + visionImages.length) % visionImages.length);
  };

  const handleAddImage = () => {
      if (!newImageUrl.trim()) return;
      const newImages = [...visionImages, newImageUrl];
      setVisionImages(newImages);
      setCurrentImageIndex(newImages.length - 1); 
      setNewImageUrl('');
      setIsAddingImage(false);
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (visionImages.length <= 1) {
          alert("Debes tener al menos una imagen en tu visión.");
          return;
      }
      const newImages = visionImages.filter((_, i) => i !== currentImageIndex);
      setVisionImages(newImages);
      setCurrentImageIndex(0);
  };

  const handleExportData = () => {
      const exportData = {
          exportDate: new Date().toISOString(),
          appVersion: "Proyecto365-2026",
          journalEntries: journalEntries,
          habitHistory: history
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `proyecto365_backup_${getTodayStr()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-6rem)]">
      
      {/* COLUMN 1: Daily Habits & Date Selector (PRIMARY Mobile View) */}
      {/* ORDER: Mobile -> 1st, Desktop -> 3rd */}
      <div className="order-1 lg:order-3 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:custom-scrollbar lg:pr-1 min-h-[500px]">
        {/* Daily Habits List - Shown FIRST on mobile */}
        <HabitCategory 
            category="daily" 
            title="Hábitos Diarios" 
            icon={Calendar} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-blue-500" 
            className="h-auto shrink-0"
            disableScroll={true}
        />

        {/* Date Selector Header - Shown SECOND on mobile */}
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
      </div>

      {/* COLUMN 2: Monthly & Weekly Habits */}
      {/* ORDER: Mobile -> 2nd, Desktop -> 2nd */}
      <div className="order-2 lg:order-2 flex flex-col gap-6 lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
        <HabitCategory 
            category="weekly" 
            title="Hábitos Semanales" 
            icon={CalendarDays} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-purple-500"
            className="h-auto shrink-0"
            disableScroll={true}
        />
        <HabitCategory 
            category="monthly" 
            title="Hábitos Mensuales" 
            icon={CalendarRange} 
            history={history} 
            setHistory={setHistory} 
            selectedDate={selectedDate} 
            colorClass="bg-orange-500" 
            className="h-auto shrink-0"
            disableScroll={true}
        />
      </div>

      {/* COLUMN 3: Stats & Vision */}
      {/* ORDER: Mobile -> 3rd, Desktop -> 1st */}
      <div className="order-3 lg:order-1 flex flex-col gap-6 lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
                title="Progreso 2026" 
                value={`${entriesCount > 0 ? Math.round((entriesCount/365)*100) : 0}%`} 
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
                title="Días de Ejercicio" 
                value={`${exerciseTotal}/104`} 
                icon={Dumbbell} 
                iconColorClass="bg-emerald-500/10 text-emerald-500"
            />
          </div>

          {/* Explicit Export Button */}
          <button 
            onClick={handleExportData}
            className="bg-[#1c1f2e] border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex items-center justify-between text-gray-400 hover:text-white transition-all group"
          >
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <Download size={20} />
                  </div>
                  <div className="text-left">
                      <span className="block text-sm font-bold text-white">Descargar Historial</span>
                      <span className="text-xs">Hábitos y Journal</span>
                  </div>
              </div>
              <ChevronRight size={16} />
          </button>

          {/* Vision 2026 */}
          <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col gap-6 shadow-lg group/card">
             <div className="w-full aspect-video relative rounded-xl overflow-hidden group/image shadow-2xl">
                 <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/image:scale-105" 
                    style={{ backgroundImage: `url('${visionImages[currentImageIndex]}')` }} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                 
                 <div className="absolute bottom-3 left-3 z-10">
                     <h3 className="text-white font-bold text-lg drop-shadow-md flex items-center gap-2">
                        Visión 2026 
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/80 font-normal">
                            {currentImageIndex + 1}/{visionImages.length}
                        </span>
                     </h3>
                 </div>

                 <div className="absolute inset-0 flex items-center justify-between p-2 opacity-100 lg:opacity-0 lg:group-hover/image:opacity-100 transition-opacity z-20">
                     <button onClick={handlePrevImage} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition-all"><ChevronLeft size={20}/></button>
                     <button onClick={handleNextImage} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition-all"><ChevronRight size={20}/></button>
                 </div>

                 <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity z-30">
                     <button 
                        onClick={() => setIsAddingImage(true)} 
                        className="p-1.5 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 backdrop-blur-sm transition-all shadow-lg"
                        title="Agregar imagen"
                     >
                        <Plus size={14} />
                     </button>
                     <button 
                        onClick={handleDeleteImage} 
                        className="p-1.5 bg-red-600/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm transition-all shadow-lg"
                        title="Eliminar esta imagen"
                     >
                        <Trash2 size={14} />
                     </button>
                 </div>

                 {isAddingImage && (
                     <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                         <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <LinkIcon size={16} /> Nueva Imagen
                         </h4>
                         <input 
                            autoFocus
                            type="text" 
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') handleAddImage();
                                if(e.key === 'Escape') setIsAddingImage(false);
                            }}
                            placeholder="Pega la URL de la imagen aquí..."
                            className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-3"
                         />
                         <div className="flex gap-2 w-full">
                             <button 
                                onClick={() => setIsAddingImage(false)}
                                className="flex-1 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-700"
                             >
                                Cancelar
                             </button>
                             <button 
                                onClick={handleAddImage}
                                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 flex items-center justify-center gap-1"
                             >
                                <Save size={12} /> Guardar
                             </button>
                         </div>
                     </div>
                 )}
             </div>
             
             <div>
                <blockquote className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500 leading-snug italic">
                    "La disciplina es el puente entre las metas y los logros. Este panel no es solo números, es el mapa hacia la persona en la que te estás convirtiendo."
                </blockquote>
             </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;
