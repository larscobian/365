
import * as React from 'react';
import { useState, useMemo } from 'react';
import { Target } from 'lucide-react';
import { HABIT_DEFINITIONS, isHabitCompleted } from '../data/habits';
import { useUserData } from '../hooks/useFirestore';

interface AnnualGoal {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  type: 'number' | 'currency' | 'percent' | 'boolean';
  icon: string;
  habitBindingId?: string;
}

const INITIAL_GOALS: AnnualGoal[] = [
  { id: 'g1', label: 'Juntar Ahorros', target: 10000, current: 0, unit: '$', type: 'currency', icon: '💸' },
  { id: 'g2', label: 'Invertir', target: 1000, current: 0, unit: '$', type: 'currency', icon: '📈' },
  { id: 'g3', label: 'Horas Agencia', target: 365, current: 0, unit: 'h', type: 'number', icon: '💻', habitBindingId: 'd5' },
  { id: 'g4', label: 'Videos Youtube', target: 12, current: 0, unit: '', type: 'number', icon: '🎬', habitBindingId: 'm2' },
  { id: 'g5', label: 'Videos Instagram', target: 53, current: 0, unit: '', type: 'number', icon: '🤳🏼', habitBindingId: 'w6' },
  { id: 'g6', label: 'Leer Libros', target: 5, current: 0, unit: '', type: 'number', icon: '📚' },
  { id: 'g7', label: 'Escribir/Grabar Canciones', target: 3, current: 0, unit: '', type: 'number', icon: '🎙️' },
  { id: 'g8', label: 'Murales Calligraffiti', target: 2, current: 0, unit: '', type: 'number', icon: '🎨' },
  { id: 'g9', label: 'Escribir Libro', target: 100, current: 0, unit: '%', type: 'percent', icon: '✍🏼', habitBindingId: 'w3' },
  { id: 'g10', label: 'No fumar weed', target: 365, current: 0, unit: 'días', type: 'number', icon: '❌', habitBindingId: 'd10' },
  { id: 'g11', label: 'Checkeo Médico', target: 1, current: 0, unit: '', type: 'boolean', icon: '➕' },
];

const AnnualGoals: React.FC = () => {
  const [goals, setGoals] = useUserData<AnnualGoal[]>('annual_goals_v1', INITIAL_GOALS);
  
  // Also fetch habit history from Firestore for live sync
  const [habitHistory] = useUserData('habit_history_v2', {});

  const syncedGoals = useMemo(() => {
    return goals.map(goal => {
        if (!goal.habitBindingId) return goal;
        const def = HABIT_DEFINITIONS.find(h => h.id === goal.habitBindingId);
        if (!def) return goal;

        let total = 0;
        Object.values(habitHistory as any).forEach((dayData: any) => {
            const val = dayData[goal.habitBindingId!];
            if (isHabitCompleted(def, val)) {
                if (goal.unit === 'h' && def.unit === 'min') {
                    total += (parseFloat(val) || 0) / 60;
                } else if (goal.unit === 'días' || goal.unit === '' || goal.unit === 'vids') {
                    total += 1;
                } else if (goal.type === 'percent') {
                    total = Math.max(total, parseFloat(val) || 0);
                }
            }
        });
        return { ...goal, current: Number(total.toFixed(1)) };
    });
  }, [goals, habitHistory]);

  return (
    <div className="bg-[#1c1f2e] p-5 rounded-2xl border border-gray-800/50 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-blue-500" size={20} />
        <h2 className="text-lg font-bold text-white">Metas Finales 2026</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {syncedGoals.map(goal => {
            const isCompleted = goal.current >= goal.target;
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            return (
                <div key={goal.id} className={`relative group bg-[#0f111a] rounded-xl p-3 border transition-all flex items-center gap-3 ${isCompleted ? 'border-green-500/30' : 'border-gray-800'}`}>
                    <div className="w-9 h-9 rounded-lg bg-gray-800/50 flex items-center justify-center text-lg shrink-0">{goal.icon}</div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-gray-200 truncate pr-2" title={goal.label}>{goal.label}</span>
                            <span className={`text-xs font-bold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                                {goal.current}/{goal.target}{goal.unit}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        {goal.habitBindingId && <span className="text-[7px] text-blue-500 uppercase font-bold mt-1">Sincronizado</span>}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default AnnualGoals;
