
export type HabitType = 'time' | 'count' | 'boolean' | 'unit' | 'text';

export interface HabitDefinition {
  id: string;
  label: string;
  type: HabitType;
  target: number;
  unit: string;
  category: 'daily' | 'weekly' | 'monthly';
  icon: string;
}

export const HABIT_DEFINITIONS: HabitDefinition[] = [
  // DAILY
  { id: 'd1', label: 'Levantarme a las 10:00 max', type: 'time', target: 10, unit: 'hora', category: 'daily', icon: '☀️' },
  { id: 'd_bed', label: 'Hacer la Cama', type: 'boolean', target: 1, unit: 'vez', category: 'daily', icon: '🛏️' },
  { id: 'd2', label: 'Tomar 2L de Agua', type: 'unit', target: 2, unit: 'L', category: 'daily', icon: '💧' },
  { id: 'd_mily', label: 'Paseo Mily', type: 'count', target: 2, unit: 'veces', category: 'daily', icon: '🐶' },
  { id: 'd3', label: 'Leer', type: 'unit', target: 1, unit: 'min', category: 'daily', icon: '📖' },
  { id: 'd4', label: 'Push Ups', type: 'count', target: 1, unit: 'pushups', category: 'daily', icon: '💪🏼' },
  { id: 'd5', label: '1h Agencia (Deepwork)', type: 'unit', target: 60, unit: 'min', category: 'daily', icon: '💻' },
  { id: 'd6', label: 'Comer 3 Veces + Registro', type: 'count', target: 3, unit: 'comidas', category: 'daily', icon: '🥗' },
  { id: 'd7', label: 'Tomar Proteina + Creatina', type: 'boolean', target: 1, unit: 'dosis', category: 'daily', icon: '💊' },
  { id: 'd8', label: 'Registrar Día', type: 'boolean', target: 1, unit: 'vez', category: 'daily', icon: '🗒️' },
  { id: 'd9', label: 'Lavarme los Dientes 3 Veces', type: 'count', target: 3, unit: 'veces', category: 'daily', icon: '🪥' },
  { id: 'd10', label: 'Acostarme a las 23:59 max', type: 'time', target: 23.99, unit: 'hora', category: 'daily', icon: '🌙' },
  
  // WEEKLY
  { id: 'w1', label: 'Ejercicio x2 (Lun y Jue)', type: 'count', target: 2, unit: 'sesiones', category: 'weekly', icon: '🏋🏼' },
  { id: 'w2', label: 'Planificación Semanal (Dom)', type: 'boolean', target: 1, unit: 'vez', category: 'weekly', icon: '📅' },
  { id: 'w3', label: 'Escribir Libro 20m', type: 'unit', target: 20, unit: 'min', category: 'weekly', icon: '✍🏼' },
  { id: 'w4', label: 'Música 20m', type: 'unit', target: 20, unit: 'min', category: 'weekly', icon: '🎵' },
  { id: 'w5', label: 'Arte 20m', type: 'unit', target: 20, unit: 'min', category: 'weekly', icon: '🎨' },
  { id: 'w6', label: '1 Reel', type: 'count', target: 1, unit: 'reel', category: 'weekly', icon: '📸' },
  { id: 'w7', label: 'Registrar Peso (Dom)', type: 'unit', target: 1, unit: 'kg', category: 'weekly', icon: '⚖️' },
  { id: 'w8', label: 'Actividad Recreativa', type: 'text', target: 1, unit: '', category: 'weekly', icon: '🍃' },

  // MONTHLY
  { id: 'm1', label: 'Revisión Completa del Mes', type: 'boolean', target: 1, unit: 'vez', category: 'monthly', icon: '🔍' },
  { id: 'm2', label: '1 Video de Youtube', type: 'boolean', target: 1, unit: 'video', category: 'monthly', icon: '🎬' },
  { id: 'm3', label: 'Visitar Abueli', type: 'boolean', target: 1, unit: 'vez', category: 'monthly', icon: '🧑🏼‍🦳' },
  { id: 'm4', label: 'Proyecto Casa Propia 1h', type: 'unit', target: 60, unit: 'min', category: 'monthly', icon: '🏠' },
  { id: 'm5', label: '30m sin hacer NADA', type: 'unit', target: 30, unit: 'min', category: 'monthly', icon: '🤫' },
];

export const isHabitCompleted = (def: HabitDefinition, value: any): boolean => {
  if (value === undefined || value === null || value === '') return false;

  switch (def.id) {
    case 'd1': // Levantarme 10:00
      return true; // Marked as complete if any time is input
    case 'd10': // Acostarme 23:59
      return true; // Marked as complete if any time is input
    case 'd2': // Agua 2L
      return parseFloat(value) >= 2;
    case 'd_mily': // Paseo Mily 2/2
      return parseInt(value) >= 2;
    case 'd6': // Comer 3 veces
      return parseInt(value) >= 3;
    case 'd9': // Dientes 3 veces
      return parseInt(value) >= 3;
    case 'd3': // Leer
    case 'd4': // Push ups
    case 'd5': // Deepwork
      return parseFloat(value) > 0;
    
    // Updated Logic Cases
    case 'w7': // Peso - complete if any positive number
      return parseFloat(value) > 0;
    case 'w8': // Actividad Recreativa - complete if text length > 0
      return typeof value === 'string' && value.trim().length > 0;

    default:
      if (def.type === 'boolean') return !!value;
      if (def.type === 'count' || def.type === 'unit') return parseFloat(value) >= def.target;
      if (def.type === 'text') return typeof value === 'string' && value.length > 0;
      return false;
  }
};

export const getHabitColor = (def: HabitDefinition, value: any): string => {
  if (value === undefined || value === null || value === '') return 'text-gray-500';
  
  if (def.id === 'd1') {
    const [h, m] = value.split(':').map(Number);
    const timeValue = h + m / 60;
    return timeValue <= 10 ? 'text-green-500' : 'text-red-500';
  }
  
  if (def.id === 'd10') {
    const [h, m] = value.split(':').map(Number);
    const timeValue = h + m / 60;
    // Positive between 20:01 and 23:59
    if (timeValue >= 20.016 && timeValue <= 23.99) return 'text-green-500';
    return 'text-red-500';
  }

  return isHabitCompleted(def, value) ? 'text-green-500' : 'text-yellow-500';
};
