
import React, { useState } from 'react';
import { Plus, X, ChefHat, Trash2, RotateCcw } from 'lucide-react';
import { useUserData } from '../hooks/useFirestore';

// --- Types ---

interface FoodItem {
  id: string;
  name: string;
  icon: string; // Emoji or text icon
}

interface Meal {
  id: string;
  foods: FoodItem[];
}

interface DayPlan {
  name: string;
  meals: Meal[];
}

// --- Initial Data ---

const INITIAL_FOODS: FoodItem[] = [
  { id: 'f1', name: 'Arroz', icon: '🍚' },
  { id: 'f2', name: 'Fideos', icon: '🍝' },
  { id: 'f3', name: 'Papa', icon: '🥔' },
  { id: 'f4', name: 'Huevo', icon: '🥚' },
  { id: 'f5', name: 'Pescado', icon: '🐟' },
  { id: 'f6', name: 'Pollo', icon: '🍗' },
  { id: 'f7', name: 'Lechuga', icon: '🥬' },
  { id: 'f8', name: 'Lentejas', icon: '🍲' },
  { id: 'f9', name: 'Pan', icon: '🍞' },
  { id: 'f10', name: 'Queso', icon: '🧀' },
  { id: 'f11', name: 'Leche', icon: '🥛' },
];

const INITIAL_WEEK: DayPlan[] = [
  { name: 'Lunes', meals: [{ id: 'm_mon_1', foods: [{ id: 'f1', name: 'Arroz', icon: '🍚' }, { id: 'f2', name: 'Fideos', icon: '🍝' }, { id: 'f4', name: 'Huevo', icon: '🥚' }] }, { id: 'm_mon_2', foods: [{ id: 'f1', name: 'Arroz', icon: '🍚' }, { id: 'f2', name: 'Fideos', icon: '🍝' }] }] },
  { name: 'Martes', meals: [{ id: 'm_tue_1', foods: [{ id: 'f3', name: 'Papa', icon: '🥔' }, { id: 'f5', name: 'Pescado', icon: '🐟' }, { id: 'f4', name: 'Huevo', icon: '🥚' }] }, { id: 'm_tue_2', foods: [{ id: 'f4', name: 'Huevo', icon: '🥚' }] }] },
  { name: 'Miércoles', meals: [{ id: 'm_wed_1', foods: [{ id: 'f3', name: 'Papa', icon: '🥔' }, { id: 'f5', name: 'Pescado', icon: '🐟' }] }, { id: 'm_wed_2', foods: [{ id: 'f7', name: 'Lechuga', icon: '🥬' }, { id: 'f6', name: 'Pollo', icon: '🍗' }] }, { id: 'm_wed_3', foods: [{ id: 'f9', name: 'Pan', icon: '🍞' }] }] },
  { name: 'Jueves', meals: [{ id: 'm_thu_1', foods: [{ id: 'f6', name: 'Pollo', icon: '🍗' }, { id: 'f1', name: 'Arroz', icon: '🍚' }] }, { id: 'm_thu_2', foods: [{ id: 'f9', name: 'Pan', icon: '🍞' }, { id: 'f10', name: 'Queso', icon: '🧀' }, { id: 'f11', name: 'Leche', icon: '🥛' }] }] },
  { name: 'Viernes', meals: [] },
  { name: 'Sábado', meals: [] },
];

const MealPrepPage: React.FC = () => {
  // Use useUserData instead of usePersistentState
  const [weekPlan, setWeekPlan] = useUserData<DayPlan[]>('mealprep_plan', INITIAL_WEEK);
  const [availableFoods, setAvailableFoods] = useUserData<FoodItem[]>('mealprep_foods', INITIAL_FOODS);
  
  const [newFoodName, setNewFoodName] = useState('');
  const [isAddingFood, setIsAddingFood] = useState(false);

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, food: FoodItem) => {
    e.dataTransfer.setData('food', JSON.stringify(food));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Drop into an existing meal (Adds food to that meal)
  const handleDropOnMeal = (e: React.DragEvent, dayIndex: number, mealIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation so we don't trigger the Day's drop handler
    
    const foodData = e.dataTransfer.getData('food');
    if (!foodData) return;

    const food = JSON.parse(foodData) as FoodItem;
    
    const newWeek = [...weekPlan];
    newWeek[dayIndex].meals[mealIndex].foods.push({ ...food, id: Date.now().toString() });
    setWeekPlan(newWeek);
  };

  // Drop onto the Day column (Creates a NEW meal with that food)
  const handleDropOnDay = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    const foodData = e.dataTransfer.getData('food');
    if (!foodData) return;

    const food = JSON.parse(foodData) as FoodItem;
    
    const newWeek = [...weekPlan];
    
    // Constraint: Max 5 meals per day
    if (newWeek[dayIndex].meals.length >= 5) return;

    // Create a new meal containing the dropped food
    const newMeal: Meal = {
        id: `meal_${Date.now()}`,
        foods: [{ ...food, id: `food_${Date.now()}` }]
    };

    newWeek[dayIndex].meals.push(newMeal);
    setWeekPlan(newWeek);
  };

  // --- Actions ---

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const newWeek = [...weekPlan];
    newWeek[dayIndex].meals.splice(mealIndex, 1);
    setWeekPlan(newWeek);
  };

  const removeFoodFromMeal = (dayIndex: number, mealIndex: number, foodInstanceId: string) => {
    const newWeek = [...weekPlan];
    const meal = newWeek[dayIndex].meals[mealIndex];
    meal.foods = meal.foods.filter(f => f.id !== foodInstanceId);
    
    // Auto-remove meal if empty to keep the UI clean since we removed the add button
    if (meal.foods.length === 0) {
        newWeek[dayIndex].meals.splice(mealIndex, 1);
    }

    setWeekPlan(newWeek);
  };

  const addNewAvailableFood = () => {
    if (!newFoodName.trim()) return;
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: newFoodName,
      icon: '🥗', // Default icon
    };
    setAvailableFoods([...availableFoods, newFood]);
    setNewFoodName('');
    setIsAddingFood(false);
  };

  const removeAvailableFood = (id: string) => {
    setAvailableFoods(availableFoods.filter(f => f.id !== id));
  };

  const clearWeek = () => {
      if(window.confirm("¿Estás seguro de que quieres borrar todas las comidas de la semana?")) {
          const emptyWeek = weekPlan.map(day => ({ ...day, meals: [] }));
          setWeekPlan(emptyWeek);
      }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-2 relative">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <ChefHat className="text-emerald-400" size={32} />
          Planificador Semanal
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-gray-400 text-sm">Arrastra ingredientes (PC) o gestiona tus comidas</p>
            <button 
                onClick={clearWeek} 
                className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-2 py-1 rounded-full border border-red-500/20 transition-colors"
                title="Borrar todo"
            >
                <RotateCcw size={10} /> Reiniciar
            </button>
        </div>
      </div>

      {/* Weekly Scroll Area - Horizontal scroll friendly on mobile */}
      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-[300px] md:min-w-[1000px] h-full">
          {weekPlan.map((day, dayIndex) => (
            <div 
              key={day.name} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnDay(e, dayIndex)}
              className="flex-1 min-w-[280px] md:min-w-[200px] bg-[#1c1f2e] rounded-2xl border border-gray-800/50 flex flex-col p-3 h-full min-h-[500px] transition-colors hover:border-gray-700 group/day snap-center"
            >
              {/* Day Header */}
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-white">{day.name}</h3>
                <span className="text-xs text-gray-500 bg-[#0f111a] px-2 py-1 rounded-md">
                  {day.meals.length}/5
                </span>
              </div>

              {/* Meals List */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-hide mb-3">
                {day.meals.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center p-4 opacity-30 select-none pointer-events-none border-2 border-dashed border-gray-700 rounded-xl m-1">
                    <p className="text-sm text-gray-400 italic">
                      Vacío
                    </p>
                  </div>
                )}

                {day.meals.map((meal, mealIndex) => (
                  <div 
                    key={meal.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnMeal(e, dayIndex, mealIndex)}
                    className="bg-[#0f111a] rounded-xl p-3 border border-gray-700/50 hover:border-blue-500/50 transition-colors group flex flex-col shadow-sm relative"
                  >
                    {/* Meal Foods - Compacted layout */}
                    <div className="space-y-1.5">
                        {meal.foods.map((food) => (
                            <div key={food.id} className="flex items-center gap-2 text-xs text-gray-300 bg-[#1c1f2e] px-2 py-1 rounded border border-gray-800 shadow-sm">
                                <span className="select-none">{food.icon}</span>
                                <span className="font-medium flex-1">{food.name}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFoodFromMeal(dayIndex, mealIndex, food.id);
                                    }}
                                    className="text-gray-600 hover:text-red-400 p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Remove Meal Button */}
                    <div className="mt-2 pt-2 border-t border-gray-800 flex justify-end">
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeMeal(dayIndex, mealIndex);
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500/10 px-2 py-1 rounded lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Foods Section - Sticky-ish for better mobile usage */}
      <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Alimentos Disponibles</h3>
        
        <div className="flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
            {availableFoods.map((food) => (
                <div 
                    key={food.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, food)}
                    className="group flex items-center gap-2 bg-[#0f111a] hover:bg-[#2d3748] hover:scale-105 border border-gray-800 hover:border-gray-600 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing transition-all select-none shadow-sm"
                >
                    <span className="text-lg">{food.icon}</span>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">{food.name}</span>
                    <button 
                        onClick={() => removeAvailableFood(food.id)}
                        className="ml-2 text-gray-600 hover:text-red-400 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            {/* Add New Food Button */}
            {isAddingFood ? (
                <div className="flex items-center gap-2 bg-[#0f111a] border border-blue-500 rounded-lg px-2 py-1 shadow-lg animate-in fade-in zoom-in">
                    <input 
                        autoFocus
                        type="text"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addNewAvailableFood();
                            if (e.key === 'Escape') setIsAddingFood(false);
                        }}
                        placeholder="Nombre..."
                        className="bg-transparent text-sm text-white focus:outline-none w-24"
                    />
                    <button onClick={addNewAvailableFood} className="text-blue-400 hover:text-white"><Plus size={16} /></button>
                    <button onClick={() => setIsAddingFood(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAddingFood(true)}
                    className="flex items-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
                >
                    <Plus size={16} /> Añadir Alimento
                </button>
            )}
        </div>
      </div>

    </div>
  );
};

export default MealPrepPage;
