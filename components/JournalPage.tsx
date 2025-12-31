
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Save, Trash2, Plus, Star, Smartphone } from 'lucide-react';
import { JournalEntry, JOURNAL_TAGS, getRatingColor } from '../data/journal';

// --- Helper Component: Auto Expanding Textarea ---
interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    minHeight?: string;
}

const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({ className, minHeight = "60px", value, onChange, ...props }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.max(scrollHeight, parseInt(minHeight) || 0)}px`;
        }
    }, [value, minHeight]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            className={`${className} overflow-hidden resize-none block`}
            style={{ minHeight }}
            rows={1}
            {...props}
        />
    );
};

interface JournalPageProps {
  entries: Record<string, JournalEntry>;
  setEntries: React.Dispatch<React.SetStateAction<Record<string, JournalEntry>>>;
}

const JournalPage: React.FC<JournalPageProps> = ({ entries, setEntries }) => {
  // --- Calendar State ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  // --- Modal / Editor State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [editForm, setEditForm] = useState<Partial<JournalEntry>>({});

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); 

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- Interaction Handlers ---
  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    
    if (entries[dateStr]) {
      setEditForm(entries[dateStr]);
    } else {
      setEditForm({
        rating: 5,
        tags: [],
        summary: '',
        learning: '',
        bestMoment: '',
        tomorrowGoals: '',
        screenTime: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedDateStr) return;
    const newEntry: JournalEntry = {
      date: selectedDateStr,
      rating: editForm.rating || 5,
      tags: editForm.tags || [],
      summary: editForm.summary || '',
      learning: editForm.learning || '',
      bestMoment: editForm.bestMoment || '',
      tomorrowGoals: editForm.tomorrowGoals || '',
      screenTime: editForm.screenTime || '',
    };
    setEntries(prev => ({ ...prev, [selectedDateStr]: newEntry }));
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedDateStr) return;
    const newEntries = { ...entries };
    delete newEntries[selectedDateStr];
    setEntries(newEntries);
    setIsModalOpen(false);
  };

  const toggleTag = (tagId: string) => {
    const currentTags = editForm.tags || [];
    if (currentTags.includes(tagId)) {
      setEditForm(prev => ({ ...prev, tags: currentTags.filter(t => t !== tagId) }));
    } else {
      setEditForm(prev => ({ ...prev, tags: [...currentTags, tagId] }));
    }
  };

  // Format date for modal header: "miércoles, 8 de octubre"
  const getFormattedDate = () => {
      if (!selectedDateStr) return '';
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-900/40 to-blue-600/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                <CalendarIcon className="text-blue-400" size={24} />
            </div>
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-white capitalize tracking-tight">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-400 font-medium">Registro diario y reflexión</p>
            </div>
        </div>

        <div className="flex items-center bg-[#1c1f2e]/80 backdrop-blur-md rounded-xl border border-gray-800 p-1 shadow-lg self-start md:self-auto">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <div className="h-4 w-[1px] bg-gray-700 mx-2"></div>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-sm font-medium text-gray-300 hover:text-white transition-colors">Hoy</button>
            <div className="h-4 w-[1px] bg-gray-700 mx-2"></div>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-[#1c1f2e]/50 backdrop-blur-xl rounded-3xl border border-gray-800 flex flex-col flex-1 min-h-[600px] shadow-2xl relative overflow-hidden">
        {/* Horizontal Scroll for Mobile */}
        <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col">
            <div className="min-w-[600px] flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-800/50 bg-[#1c1f2e]/50">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                        <div key={i} className="py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 flex-1 z-10">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-b border-r border-gray-800/30 bg-[#0f111a]/30" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const entry = entries[dateStr];
                        const isToday = new Date().toLocaleDateString() === new Date(year, month, day).toLocaleDateString();
                        return (
                            <div 
                                key={day} 
                                onClick={() => handleDayClick(day)}
                                className={`min-h-[100px] p-2 border-b border-r border-gray-800/30 cursor-pointer transition-all duration-200 group relative flex flex-col hover:bg-[#23273a]/80 ${isToday ? 'bg-blue-500/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-blue-500 text-white' : 'text-gray-400 group-hover:text-white'}`}>{day}</span>
                                    {entry && <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getRatingColor(entry.rating)}`}>{entry.rating} <Star size={8} /></div>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {entry ? (
                                        <div className="flex flex-wrap gap-1.5 content-start">
                                            {entry.tags.slice(0, 3).map(tagId => (
                                                <span key={tagId} className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${JOURNAL_TAGS.find(t => t.id === tagId)?.colorClass || ''}`}>
                                                    {JOURNAL_TAGS.find(t => t.id === tagId)?.label || ''}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100"><Plus size={16} /></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
            <div className="bg-[#13151b] w-full max-w-2xl rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[98vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0 bg-[#13151b] rounded-t-2xl z-10">
                    <div>
                        <h3 className="text-white font-bold text-lg capitalize">
                            {getFormattedDate()}
                        </h3>
                        <p className="text-gray-500 text-xs font-medium">Reflexión diaria</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Compacted Spacing & Auto Scroll */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    
                    {/* Top Row: Rating & Screen Time */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Puntuación (1-10)</label>
                            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
                                {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                                    <button 
                                        key={num} 
                                        onClick={() => setEditForm(prev => ({...prev, rating: num}))} 
                                        className={`flex-1 min-w-[32px] h-8 rounded-lg text-xs font-bold border transition-all duration-200
                                            ${editForm.rating === num 
                                                ? 'bg-yellow-600 border-yellow-600 text-white shadow-lg shadow-yellow-900/50 scale-105' 
                                                : 'bg-[#1c1f2e] border-gray-800 text-gray-400 hover:bg-[#252836] hover:text-white'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-1/4">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Smartphone size={10} /> Screen Time
                             </label>
                             <input 
                                type="text"
                                value={editForm.screenTime} 
                                onChange={e => setEditForm(prev => ({...prev, screenTime: e.target.value}))} 
                                placeholder="4h 30m"
                                className="w-full h-8 bg-[#0b0c15] border border-gray-800 rounded-lg px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors text-center"
                            />
                        </div>
                    </div>

                    {/* Tags - Compact 2 Rows (Grid cols 5) */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">¿Cómo te sentiste?</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {JOURNAL_TAGS.map(tag => {
                                const isSelected = (editForm.tags || []).includes(tag.id);
                                return (
                                    <button 
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-left transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-[#1c1f2e] border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                                                : 'bg-[#1c1f2e] border-gray-800 hover:border-gray-700 hover:bg-[#252836]'
                                            }
                                        `}
                                    >
                                        <span className="text-sm leading-none">{tag.label.split(' ')[0]}</span>
                                        <span className={`text-[10px] font-medium leading-none truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                            {tag.label.split(' ').slice(1).join(' ')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Resumen del día</label>
                        <AutoExpandingTextarea 
                            value={editForm.summary} 
                            onChange={e => setEditForm(prev => ({...prev, summary: e.target.value}))} 
                            placeholder="¿Qué pasó hoy?..."
                            className="w-full bg-[#0b0c15] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            minHeight="60px"
                        />
                    </div>

                    {/* Learning & Best Moment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Aprendizaje</label>
                            <AutoExpandingTextarea 
                                value={editForm.learning} 
                                onChange={e => setEditForm(prev => ({...prev, learning: e.target.value}))} 
                                placeholder="Una lección..."
                                className="w-full bg-[#0b0c15] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                minHeight="50px"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Mejor Momento</label>
                            <AutoExpandingTextarea 
                                value={editForm.bestMoment} 
                                onChange={e => setEditForm(prev => ({...prev, bestMoment: e.target.value}))} 
                                placeholder="Highlight..."
                                className="w-full bg-[#0b0c15] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                minHeight="50px"
                            />
                        </div>
                    </div>

                    {/* Tomorrow Goals */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Metas para mañana</label>
                        <AutoExpandingTextarea 
                            value={editForm.tomorrowGoals} 
                            onChange={e => setEditForm(prev => ({...prev, tomorrowGoals: e.target.value}))} 
                            placeholder="Prioridad principal..."
                            className="w-full bg-[#0b0c15] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            minHeight="40px"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#13151b] rounded-b-2xl z-10">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                    >
                        <Save size={14} />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
