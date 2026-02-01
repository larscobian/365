

// Shared types and data for Journal features

export interface JournalEntry {
    date: string; // YYYY-MM-DD
    rating: number; // 1-10
    tags: string[]; // IDs of selected tags
    summary: string;
    learning: string;
    bestMoment: string;
    tomorrowGoals: string;
    screenTime: string; // New field for Screen Time
  }
  
  export interface TagOption {
    id: string;
    label: string;
    colorClass: string; // Full badge styles
    dotClass: string;   // Background color for dots
  }
  
  export const JOURNAL_TAGS: TagOption[] = [
    { id: 'motivado', label: '🤩 Motivado', colorClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30', dotClass: 'bg-pink-500' },
    { id: 'optimista', label: '😀 Optimista', colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dotClass: 'bg-orange-500' },
    { id: 'tranquilo', label: '🍃 Tranquilo', colorClass: 'bg-green-500/20 text-green-300 border-green-500/30', dotClass: 'bg-green-500' },
    { id: 'agradecido', label: '🙏 Agradecido', colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dotClass: 'bg-purple-500' },
    { id: 'feliz', label: '😁 Feliz', colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', dotClass: 'bg-yellow-500' },
    { id: 'amistoso', label: '🫂 Amistoso', colorClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', dotClass: 'bg-indigo-500' },
    { id: 'cansado', label: '😮‍💨 Cansado', colorClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30', dotClass: 'bg-gray-500' },
    { id: 'con_sueno', label: '😴 Con sueño', colorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dotClass: 'bg-blue-500' },
    { id: 'caliente', label: '🥵 Caliente', colorClass: 'bg-red-500/20 text-red-300 border-red-500/30', dotClass: 'bg-red-500' },
  ];
  
  export const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-emerald-600 text-white shadow-emerald-900/20';
    if (rating >= 5) return 'bg-yellow-600 text-white shadow-yellow-900/20';
    return 'bg-red-600 text-white shadow-red-900/20';
  };

  export const initialEntries: Record<string, JournalEntry> = {
    '2026-01-02': {
      date: '2026-01-02',
      rating: 9,
      tags: ['motivado', 'agradecido'],
      summary: 'Inicio del 2026 con toda la energía. Terminé el proyecto a tiempo.',
      learning: 'La consistencia es clave este año.',
      bestMoment: 'El café de la mañana.',
      tomorrowGoals: 'Empezar el nuevo módulo.',
      screenTime: '3h 15m'
    },
    '2026-01-05': {
      date: '2026-01-05',
      rating: 4,
      tags: ['cansado', 'con_sueno'],
      summary: 'Me sentí muy cansado y no pude entrenar.',
      learning: 'Necesito dormir mejor.',
      bestMoment: 'Ver una serie en la noche.',
      tomorrowGoals: 'Ir al gimnasio sin falta.',
      screenTime: '6h 30m'
    },
  };
