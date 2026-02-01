
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Calendar, CalendarDays, CalendarRange, Flame, History as HistoryIcon, X, Edit3, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { HABIT_DEFINITIONS, HabitDefinition, isHabitCompleted, getHabitColor } from '../data/habits';

export type HabitValue = string | number | boolean;
export type HabitHistory = Record<string, Record<string, HabitValue>>;

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const calculateStreak = (history: HabitHistory, habitId: string): number => {
    let streak = 0;
    const def = HABIT_DEFINITIONS.find(h => h.id === habitId);
    if (!def) return 0;
    for (let i = 0; i < 365; i++) {
        const dateStr = getPastDateStr(i);
        const val = history[dateStr]?.[habitId];
        if (isHabitCompleted(def, val)) {
            streak++;
        } else if (i === 0) {
            continue; 
        } else {
            break;
        }
    }
    return streak;
};

export const HabitItemRow: React.FC<{ 
    def: HabitDefinition, 
    value: HabitValue, 
    onUpdate: (val: HabitValue) => void,
    streak: number
}> = ({ def, value, onUpdate, streak }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value?.toString() || '');
    const isDone = isHabitCompleted(def, value);
    const colorClass = getHabitColor(def, value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus when editing
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        let finalVal: HabitValue = tempValue;
        if (def.type === 'count' || def.type === 'unit') {
            finalVal = parseFloat(tempValue) || 0;
        }
        // If type is 'text' or 'time', finalVal remains string
        onUpdate(finalVal);
        setIsEditing(false);
    };

    const handleInteraction = () => {
        if (def.type === 'boolean') {
            onUpdate(!value);
        } else {
            setTempValue(value?.toString() || '');
            setIsEditing(true);
        }
    };

    const adjustValue = (delta: number) => {
        let current = parseFloat(tempValue) || 0;
        // For time types (unit='hora' or type='time'), adjust by smaller increments if needed
        
        if (def.type === 'time') return; // Skip numeric adjustment for time inputs for now
        
        const newValue = Math.max(0, current + delta);
        // Round to 1 decimal if needed
        const rounded = Math.round(newValue * 10) / 10;
        setTempValue(rounded.toString());
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isEditing || def.type === 'text' || def.type === 'time') return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        adjustValue(delta);
    };

    return (
        <div className={`flex items-center justify-between p-2 rounded-xl transition-all group ${isDone ? 'bg-green-500/5' : 'hover:bg-[#23273a]'}`}>
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div 
                    onClick={handleInteraction}
                    className={`shrink-0 transition-colors ${colorClass} cursor-pointer hover:opacity-80`}
                >
                    {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-xs md:text-sm truncate transition-colors ${isDone ? 'text-gray-400' : 'text-gray-200'}`} title={def.label}>
                        {def.icon} {def.label}
                    </span>
                    {!isEditing && value !== undefined && value !== null && value !== '' && (
                        <span className={`text-[10px] font-bold truncate ${colorClass}`}>
                            {def.type === 'text' ? `${value}` : `Valor: ${value} ${def.unit}`}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
                {isEditing ? (
                    <div className="flex items-center gap-2 bg-[#0f111a] border border-blue-500 rounded px-1 py-0.5">
                        <div className="relative flex items-center">
                            <input 
                                ref={inputRef}
                                type={def.type === 'time' ? 'time' : 'text'}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                onWheel={handleWheel}
                                className={`${def.type === 'text' ? 'w-32' : 'w-12'} bg-transparent text-[10px] text-white outline-none text-center`}
                                placeholder={def.type === 'text' ? 'Escribe...' : def.unit}
                            />
                            
                            {/* Arrows for numeric inputs */}
                            {(def.type === 'count' || def.type === 'unit') && (
                                <div className="flex flex-col ml-1 border-l border-gray-700 pl-1">
                                    <button onClick={() => adjustValue(1)} className="text-gray-400 hover:text-white leading-none">
                                        <ChevronUp size={8} />
                                    </button>
                                    <button onClick={() => adjustValue(-1)} className="text-gray-400 hover:text-white leading-none mt-0.5">
                                        <ChevronDown size={8} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={handleSave} className="text-blue-400 hover:text-white pl-1 border-l border-gray-700"><Save size={14}/></button>
                    </div>
                ) : (
                    <>
                        {streak > 0 && (
                            <div className="flex items-center gap-1 bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px] text-orange-400 border border-orange-500/20 whitespace-nowrap">
                                <Flame size={10} className="fill-orange-500" />
                                <span className="font-bold">{streak}</span>
                            </div>
                        )}
                        <button 
                            onClick={handleInteraction}
                            className="p-1.5 text-gray-600 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                            <Edit3 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export const HabitCategory: React.FC<{ 
    category: 'daily' | 'weekly' | 'monthly', 
    title: string, 
    icon: React.ElementType,
    history: HabitHistory,
    setHistory: any, 
    selectedDate: string,
    colorClass: string,
    className?: string,
    disableScroll?: boolean
}> = ({ category, title, icon: Icon, history, setHistory, selectedDate, colorClass, className = "", disableScroll = false }) => {
    const items = HABIT_DEFINITIONS.filter(h => h.category === category);
    const dayData = history[selectedDate] || {};
    const completedCount = items.filter(i => isHabitCompleted(i, dayData[i.id])).length;
    const progress = (completedCount / items.length) * 100;

    const [showFullHistory, setShowFullHistory] = useState(false);

    // Generate date range from Jan 1, 2026 to Today for the history view
    const historyDates = React.useMemo(() => {
        const dates: Date[] = [];
        const start = new Date('2026-01-01T00:00:00');
        const end = new Date(); // Today
        
        let current = new Date(start);
        // Ensure we show at least Jan 1 if today is before
        if (end < start) {
            dates.push(start);
        } else {
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        }
        return dates;
    }, []);

    return (
        <div className={`bg-[#1c1f2e] rounded-2xl border border-gray-800/50 flex flex-col overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-800/50 bg-[#161822] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
                        <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{title}</h3>
                        <p className="text-[10px] text-gray-500">{completedCount}/{items.length} completados</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowFullHistory(true)}
                    className="text-gray-500 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <HistoryIcon size={16} />
                </button>
            </div>
            
            <div className="h-1 w-full bg-gray-800 shrink-0">
                <div className={`h-full transition-all duration-500 ${colorClass.replace('bg-', 'bg-').replace('/10', '')}`} style={{ width: `${progress}%` }} />
            </div>

            <div className={`p-2 flex-1 ${disableScroll ? 'overflow-visible' : 'overflow-y-auto'} custom-scrollbar min-h-0`}>
                {items.map((item) => (
                    <HabitItemRow 
                        key={item.id} 
                        def={item} 
                        value={dayData[item.id]} 
                        streak={calculateStreak(history, item.id)}
                        onUpdate={(val) => {
                            setHistory((prev: HabitHistory) => ({
                                ...prev,
                                [selectedDate]: { ...prev[selectedDate], [item.id]: val }
                            }));
                        }}
                    />
                ))}
            </div>

            {showFullHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c1f2e] w-full max-w-5xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-white font-bold">Historial 2026: {title}</h3>
                            <button onClick={() => setShowFullHistory(false)}><X className="text-gray-400" /></button>
                        </div>
                        <div className="p-4 overflow-auto custom-scrollbar">
                            <table className="w-full text-[10px] text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 sticky left-0 bg-[#1c1f2e] z-10 border-b border-gray-800">Hábito</th>
                                        {historyDates.map((d, i) => (
                                            <th key={i} className="p-1 text-center min-w-[30px] border-b border-gray-800 text-gray-500">
                                                {d.getDate()}/{d.getMonth()+1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                            <td className="p-2 sticky left-0 bg-[#1c1f2e] z-10 font-bold text-gray-300 whitespace-nowrap border-r border-gray-800">{item.icon} {item.label}</td>
                                            {historyDates.map((d, i) => {
                                                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                const val = history[dStr]?.[item.id];
                                                const done = isHabitCompleted(item, val);
                                                const color = getHabitColor(item, val);
                                                return (
                                                    <td key={i} className="p-1 text-center border-r border-gray-800/30">
                                                        <div className={`w-3 h-3 mx-auto rounded-sm ${done ? color.replace('text-', 'bg-') : 'bg-gray-800'}`} title={val?.toString() || ''} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default HabitCategory;
