
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Trophy, TrendingUp, Briefcase, Palette, Heart
} from 'lucide-react';
import { HABIT_DEFINITIONS, isHabitCompleted } from '../data/habits';
import AnnualGoals from './AnnualGoals';

// --- Types ---
interface GoalItem {
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    frequency?: string; 
    habitBindingId?: string; // Linked habit ID
}

interface GoalCategory {
    id: string;
    title: string;
    iconKey: string; 
    colorFrom: string;
    colorTo: string;
    accentColor: string;
    items: GoalItem[];
}

const ICON_MAP: Record<string, React.ElementType> = {
    'trending-up': TrendingUp,
    'briefcase': Briefcase,
    'palette': Palette,
    'heart': Heart,
    'trophy': Trophy
};

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

const INITIAL_CATEGORIES: GoalCategory[] = [
    {
        id: 'wealth',
        title: '💸 Dinero',
        iconKey: 'trending-up',
        colorFrom: 'from-emerald-600',
        colorTo: 'to-emerald-900',
        accentColor: 'text-emerald-400',
        items: [
            { id: 'w1', label: 'Ahorros Totales', current: 0, target: 10000, unit: '$' },
            { id: 'w2', label: 'Portafolio Inversión', current: 0, target: 1000, unit: '$' },
            { id: 'w3', label: 'Hacer 2k en 1 Mes', current: 0, target: 2000, unit: '$' },
        ]
    },
    {
        id: 'career',
        title: '💻 Trabajo',
        iconKey: 'briefcase',
        colorFrom: 'from-blue-600',
        colorTo: 'to-blue-900',
        accentColor: 'text-blue-400',
        items: [
            { id: 'c1', label: 'Horas Agencia (Deepwork)', current: 0, target: 365, unit: 'h', habitBindingId: 'd5' },
            { id: 'c2', label: 'Libros Leídos', current: 0, target: 5, unit: 'libros' },
            { id: 'c3', label: 'Videos YouTube', current: 0, target: 12, unit: 'vids', frequency: '1/mes' },
            { id: 'c4', label: 'Reels Instagram', current: 0, target: 53, unit: 'reels', frequency: '1/sem' },
        ]
    },
    {
        id: 'creativity',
        title: '🎨 Creatividad',
        iconKey: 'palette',
        colorFrom: 'from-purple-600',
        colorTo: 'to-purple-900',
        accentColor: 'text-purple-400',
        items: [
            { id: 'cr1', label: 'Canciones Escritas/Grabadas', current: 0, target: 3, unit: 'songs' },
            { id: 'cr2', label: 'Murales Calligraffiti', current: 0, target: 2, unit: 'art' },
            { id: 'cr3', label: 'Escribir Libro', current: 0, target: 100, unit: '%' },
        ]
    },
    {
        id: 'vitality',
        title: '❤️ Salud',
        iconKey: 'heart',
        colorFrom: 'from-rose-600',
        colorTo: 'to-rose-900',
        accentColor: 'text-rose-400',
        items: [
            { id: 'v1', label: 'Días Sin Weed', current: 0, target: 365, unit: 'días', habitBindingId: 'd10' },
            { id: 'v2', label: 'Checkeo Médico', current: 0, target: 1, unit: 'check' },
            { id: 'v3', label: 'Litros de Agua', current: 0, target: 700, unit: 'L', frequency: '2L/día', habitBindingId: 'd2' },
        ]
    }
];

const GoalsPage: React.FC = () => {
    const [categories, setCategories] = usePersistentState<GoalCategory[]>('rpg_goals_2026_v5', INITIAL_CATEGORIES);

    // Load habit history for syncing
    const habitHistory = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('habit_history_v2') || '{}');
        } catch { return {}; }
    }, []);

    // Sync binding logic
    const syncedCategories = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            items: cat.items.map(item => {
                if (!item.habitBindingId) return item;
                
                const habitDef = HABIT_DEFINITIONS.find(h => h.id === item.habitBindingId);
                if (!habitDef) return item;

                let syncedVal = 0;
                Object.values(habitHistory).forEach((dayData: any) => {
                    const val = dayData[item.habitBindingId!];
                    if (isHabitCompleted(habitDef, val)) {
                        if (item.unit === 'h' && habitDef.unit === 'min') {
                            syncedVal += (parseFloat(val as string) || 0) / 60;
                        } else if (item.unit === 'L' && habitDef.unit === 'L') {
                            syncedVal += (parseFloat(val as string) || 0);
                        } else {
                            syncedVal += 1;
                        }
                    }
                });

                return { ...item, current: Number(syncedVal.toFixed(1)) };
            })
        }));
    }, [categories, habitHistory]);

    const calculateCategoryProgress = (category: GoalCategory) => {
        if (category.items.length === 0) return 0;
        const totalProgress = category.items.reduce((acc, item) => {
            return acc + Math.min(1, item.current / item.target);
        }, 0);
        return Math.round((totalProgress / category.items.length) * 100);
    };

    return (
        <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} />
                        Life Command Center
                    </h1>
                    <p className="text-gray-400">Objetivos 2026 vinculados a tus hábitos</p>
                </div>
                <div className="bg-[#1c1f2e] border border-gray-800 rounded-xl px-6 py-3 flex items-center gap-4">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nivel General</span>
                    <div className="text-2xl font-bold text-white">
                        {Math.round(syncedCategories.reduce((acc, cat) => acc + calculateCategoryProgress(cat), 0) / syncedCategories.length)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {syncedCategories.map(cat => {
                    const progress = calculateCategoryProgress(cat);
                    const Icon = ICON_MAP[cat.iconKey] || Trophy;

                    return (
                        <div key={cat.id} className="bg-[#1c1f2e] rounded-3xl border border-gray-800 flex flex-col overflow-hidden relative group hover:border-gray-700 transition-all">
                            <div className={`h-24 bg-gradient-to-br ${cat.colorFrom} ${cat.colorTo} relative p-6 flex justify-between items-start`}>
                                <div className="bg-black/20 backdrop-blur-md p-3 rounded-xl text-white shadow-lg"><Icon size={24} /></div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-white drop-shadow-md">{progress}%</span>
                                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-wide">Nivel</p>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col gap-6">
                                <div>
                                    <h3 className={`text-xl font-bold text-white mb-1`}>{cat.title}</h3>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-current ${cat.accentColor} transition-all duration-1000`} style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {cat.items.map(item => {
                                        const itemProgress = Math.min(100, (item.current / item.target) * 100);
                                        return (
                                            <div key={item.id} className="group/item">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-sm text-gray-300 font-medium truncate pr-2" title={item.label}>{item.label}</span>
                                                    <span className={`text-xs font-mono ${itemProgress >= 100 ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {item.current}/{item.target}{item.unit}
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-gray-800/50 rounded-full overflow-hidden">
                                                    <div className={`h-full ${cat.accentColor.replace('text-', 'bg-')} transition-all duration-500 opacity-60`} style={{ width: `${itemProgress}%` }} />
                                                </div>
                                                {item.habitBindingId && (
                                                    <p className="text-[8px] text-blue-400 uppercase font-bold mt-1">Sincronizado con hábito</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnnualGoals />
        </div>
    );
};

export default GoalsPage;
