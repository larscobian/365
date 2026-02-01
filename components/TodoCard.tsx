
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, X, Pencil, GripVertical } from 'lucide-react';
import { useUserData } from '../hooks/useFirestore';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoCardProps {
  title: string;
  initialTodos?: Todo[];
  storageKey: string; // Used for Firestore document ID key
}

const TodoCard: React.FC<TodoCardProps> = ({ title, initialTodos = [], storageKey }) => {
  // Switched to useUserData for Firestore Sync
  const [todos, setTodos] = useUserData<Todo[]>(storageKey, initialTodos);

  const [isAdding, setIsAdding] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  
  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Drag and Drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Sort todos: Incomplete first, Completed last
  const sortedTodos = useMemo(() => {
      return [...todos].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [todos]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([{ id: Date.now(), text: newTodo, completed: false }, ...todos]);
    setNewTodo('');
    setIsAdding(false);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId !== null && editText.trim()) {
      setTodos(todos.map(t => t.id === editingId ? { ...t, text: editText } : t));
      setEditingId(null);
      setEditText('');
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (draggedItemIndex === null) return;
    if (draggedItemIndex === index) return;
    
    const newSorted = [...sortedTodos];
    const draggedItem = newSorted[draggedItemIndex];
    newSorted.splice(draggedItemIndex, 1);
    newSorted.splice(index, 0, draggedItem);
    
    setTodos(newSorted);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="bg-[#1c1f2e] p-5 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[250px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 rounded-lg transition-colors ${isAdding ? 'bg-red-500/20 text-red-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        
        {/* Add Input Field */}
        {isAdding && (
            <form onSubmit={handleAdd} className="mb-2">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Escribe y presiona Enter..." 
                    className="w-full bg-[#0f111a] border border-blue-500/50 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsAdding(false);
                    }}
                />
            </form>
        )}

        {sortedTodos.length === 0 && !isAdding && (
            <p className="text-gray-600 text-xs text-center py-8 italic">Lista vacía</p>
        )}

        {sortedTodos.map((todo, index) => (
          <div 
            key={todo.id} 
            draggable={editingId === null}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-2 bg-[#0f111a] p-2 rounded-xl border border-gray-800/30 hover:border-gray-700 transition-all ${draggedItemIndex === index ? 'opacity-40 dashed border-blue-500' : ''}`}
          >
            {/* Drag Handle */}
            <div className="cursor-grab text-gray-700 hover:text-gray-500 active:cursor-grabbing">
                <GripVertical size={12} />
            </div>

            <button onClick={() => toggleTodo(todo.id)} className="text-gray-500 hover:text-blue-500 transition-colors shrink-0">
              {todo.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
            </button>
            
            {editingId === todo.id ? (
                <input 
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 bg-transparent border-b border-blue-500 text-xs md:text-sm text-white focus:outline-none px-1 py-0.5"
                />
            ) : (
                <span 
                    onClick={() => startEditing(todo)}
                    className={`flex-1 text-xs md:text-sm truncate cursor-text ${todo.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}
                >
                  {todo.text}
                </span>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEditing(todo)} className="text-gray-600 hover:text-blue-400 transition-colors">
                    <Pencil size={13} />
                </button>
                <button onClick={() => deleteTodo(todo.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoCard;
