
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, MoreHorizontal, GripVertical, Trash2, FileText, 
  Type, List, ListOrdered, CheckSquare, Image as ImageIcon, 
  Hash, ChevronRight, ChevronDown, ArrowLeft, Calendar,
  Copy, MoreVertical, X, Smile
} from 'lucide-react';

// --- Types ---

export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'todo' | 'quote' | 'toggle';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  isChecked?: boolean;
  // Properties for Toggle Block
  isOpen?: boolean;
  details?: string; // The hidden content
}

export interface Project {
  id: string;
  title: string;
  icon: string;
  updatedAt: string;
  blocks: Block[];
}

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

// --- Constants ---

const EMOJI_LIST = [
  "🚀", "💡", "📅", "✅", "🔥", "🎨", "📝", "📊", "📈", "📉", "💰", "💎", 
  "🏠", "🏢", "🏫", "🎓", "💻", "🖥️", "📱", "⌚", "📷", "🎥", "🎧", "🎤", 
  "🎮", "🕹️", "🎲", "🧩", "🎯", "🎳", "🎹", "🎷", "🎺", "🎸", "🎻", "🎬",
  "🚗", "✈️", "🌍", "🏖️", "🏔️", "⛺", "🏃", "🧘", "🏋️", "🚴", "🧠", "❤️",
  "⭐", "🌟", "⚡", "🌈", "☀️", "🌙", "☁️", "❄️", "💧", "🍎", "🍔", "🍕",
  "🍺", "☕", "🍷", "🍩", "🍪", "🐶", "🐱", "🦁", "🐯", "🐻", "🐼", "🐨",
  "🦄", "🐝", "🦋", "🌻", "🌵", "🌴", "🍀", "🍁", "🍄", "🔧", "🔨", "⚙️",
  "💊", "💉", "🧬", "🔬", "🔭", "📡", "🔋", "🔌", "🔔", "🔒", "🔑", "🛒",
  "🎁", "🎈", "🎉", "🎊", "🏆", "🥇", "👀", "👋", "👍", "👎", "👌", "🤝",
  "📁", "📂", "📅", "📌", "📍", "📎", "📏", "📐", "✂️", "🗑️", "🔍", "🔎"
];

// --- Helper Components ---

const BlockTypeIcon = ({ type }: { type: BlockType }) => {
    switch (type) {
        case 'h1': return <Type size={16} />;
        case 'h2': return <Type size={14} />;
        case 'h3': return <Type size={12} />;
        case 'bullet': return <List size={16} />;
        case 'number': return <ListOrdered size={16} />;
        case 'todo': return <CheckSquare size={16} />;
        case 'quote': return <Hash size={16} />;
        case 'toggle': return <ChevronRight size={16} />;
        default: return <FileText size={16} />;
    }
};

const SlashMenu = ({ 
    position, 
    onSelect, 
    onClose 
}: { 
    position: { top: number; left: number }; 
    onSelect: (type: BlockType) => void; 
    onClose: () => void; 
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const options: { type: BlockType; label: string; icon: React.ElementType; desc: string }[] = [
        { type: 'text', label: 'Texto', icon: FileText, desc: 'Escribe texto plano' },
        { type: 'h1', label: 'Encabezado 1', icon: Type, desc: 'Título grande' },
        { type: 'h2', label: 'Encabezado 2', icon: Type, desc: 'Título mediano' },
        { type: 'h3', label: 'Encabezado 3', icon: Type, desc: 'Título pequeño' },
        { type: 'bullet', label: 'Lista', icon: List, desc: 'Lista simple con viñetas' },
        { type: 'number', label: 'Enumeración', icon: ListOrdered, desc: 'Lista ordenada' },
        { type: 'todo', label: 'To-do List', icon: CheckSquare, desc: 'Lista de tareas' },
        { type: 'toggle', label: 'Toggle List', icon: ChevronRight, desc: 'Pestaña desplegable' },
        { type: 'quote', label: 'Cita', icon: Hash, desc: 'Cita destacada' },
    ];

    return (
        <div 
            ref={menuRef}
            style={{ top: position.top + 24, left: position.left }}
            className="fixed z-50 w-72 bg-[#1c1f2e] border border-gray-700 rounded-lg shadow-2xl flex flex-col p-1 animate-in fade-in zoom-in duration-200 overflow-hidden max-w-[90vw]"
        >
            <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase bg-[#161822] border-b border-gray-800 mb-1">Bloques Básicos</div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {options.map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => onSelect(opt.type)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-[#2d3748] rounded-md transition-colors text-left group"
                    >
                        <div className="bg-gray-800 p-1.5 rounded text-gray-400 group-hover:text-white border border-gray-700 shadow-sm">
                            <opt.icon size={16} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{opt.label}</div>
                            <div className="text-[10px] text-gray-500">{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const BlockOptionsMenu = ({ 
    position, 
    onAction, 
    onClose 
}: { 
    position: { top: number; left: number }; 
    onAction: (action: 'delete' | 'duplicate' | BlockType) => void; 
    onClose: () => void; 
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const conversions: { type: BlockType; label: string }[] = [
        { type: 'text', label: 'Texto' },
        { type: 'h1', label: 'Encabezado 1' },
        { type: 'h2', label: 'Encabezado 2' },
        { type: 'h3', label: 'Encabezado 3' },
        { type: 'bullet', label: 'Lista' },
        { type: 'todo', label: 'To-do' },
        { type: 'quote', label: 'Cita' },
    ];

    return (
        <div 
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-56 bg-[#1c1f2e] border border-gray-700 rounded-lg shadow-2xl flex flex-col p-1 animate-in fade-in zoom-in duration-200"
        >
            <div className="p-1 space-y-1 border-b border-gray-700 mb-1 pb-1">
                <button onClick={() => onAction('duplicate')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-[#2d3748] hover:text-white rounded">
                    <Copy size={14} /> Duplicar
                </button>
                <button onClick={() => onAction('delete')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded">
                    <Trash2 size={14} /> Eliminar
                </button>
            </div>
            
            <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase">Convertir en</div>
            {conversions.map(c => (
                <button 
                    key={c.type} 
                    onClick={() => onAction(c.type)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-[#2d3748] hover:text-white rounded text-left"
                >
                    <div className="opacity-50"><BlockTypeIcon type={c.type} /></div>
                    {c.label}
                </button>
            ))}
        </div>
    );
};

const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, setProjects }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId);
  
  // --- Editor State ---
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // --- Icon Picker State ---
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  // Close Icon Picker on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
            setShowIconPicker(false);
        }
    };
    if (showIconPicker) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showIconPicker]);

  // --- Project Management ---
  const createProject = () => {
      const newProject: Project = {
          id: Date.now().toString(),
          title: '',
          icon: '📄',
          updatedAt: new Date().toISOString(),
          blocks: [{ id: Date.now().toString(), type: 'text', content: '' }]
      };
      setProjects([...projects, newProject]);
      setActiveProjectId(newProject.id);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setProjects(projects.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
  };

  // --- Block Logic ---
  
  const updateProjectTitle = (newTitle: string) => {
      setProjects(projects.map(p => p.id === activeProjectId ? { ...p, title: newTitle } : p));
  };

  const updateProjectIcon = (newIcon: string) => {
      setProjects(projects.map(p => p.id === activeProjectId ? { ...p, icon: newIcon } : p));
      setShowIconPicker(false);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    if (!activeProject) return;
    const newBlocks = activeProject.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, blocks: newBlocks } : p));
    
    // Handle Slash Menu Trigger
    if (updates.content !== undefined) {
        const block = newBlocks.find(b => b.id === blockId);
        if (block && block.content === '/') {
            const el = document.getElementById(`block-${blockId}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                setMenuPosition({ top: rect.top, left: rect.left });
                setActiveBlockId(blockId);
                setShowSlashMenu(true);
            }
        } else if (block && !block.content.startsWith('/')) {
             setShowSlashMenu(false);
             // Handle Markdown Shortcuts
             checkForMarkdownShortcuts(block);
        }
    }
  };

  const checkForMarkdownShortcuts = (block: Block) => {
      const text = block.content;
      // Only trigger if user typed a space at the end
      if (!text.endsWith(' ')) return;

      const trigger = text.trim();
      let newType: BlockType | null = null;

      if (trigger === '#') newType = 'h1';
      else if (trigger === '##') newType = 'h2';
      else if (trigger === '###') newType = 'h3';
      else if (trigger === '-' || trigger === '*') newType = 'bullet';
      else if (trigger === '1.') newType = 'number';
      else if (trigger === '[]') newType = 'todo';
      else if (trigger === '>') newType = 'quote';
      
      if (newType) {
          // Transform block and clear the trigger chars
          transformBlock(block.id, newType, '');
      }
  };

  const addBlock = (afterBlockId: string) => {
      if (!activeProject) return;
      const newBlock: Block = { id: Date.now().toString(), type: 'text', content: '' };
      const index = activeProject.blocks.findIndex(b => b.id === afterBlockId);
      const newBlocks = [...activeProject.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      
      setProjects(projects.map(p => p.id === activeProjectId ? { ...p, blocks: newBlocks } : p));
      
      setTimeout(() => {
          const el = document.getElementById(`block-${newBlock.id}`);
          if (el) (el as HTMLTextAreaElement).focus();
      }, 0);
  };

  const deleteBlock = (blockId: string) => {
      if (!activeProject) return;
      const index = activeProject.blocks.findIndex(b => b.id === blockId);
      
      // Don't delete the last remaining empty block
      if (activeProject.blocks.length === 1 && activeProject.blocks[0].content === '') return; 

      const newBlocks = activeProject.blocks.filter(b => b.id !== blockId);
      setProjects(projects.map(p => p.id === activeProjectId ? { ...p, blocks: newBlocks } : p));

      // Focus previous
      if (index > 0) {
          setTimeout(() => {
            const prevId = activeProject.blocks[index - 1].id;
            const el = document.getElementById(`block-${prevId}`);
            if (el) {
                (el as HTMLTextAreaElement).focus();
                // Optional: set cursor to end
                const len = (el as HTMLTextAreaElement).value.length;
                (el as HTMLTextAreaElement).setSelectionRange(len, len);
            }
          }, 0);
      }
  };

  const duplicateBlock = (blockId: string) => {
    if (!activeProject) return;
    const blockToCopy = activeProject.blocks.find(b => b.id === blockId);
    if(!blockToCopy) return;

    const newBlock = { ...blockToCopy, id: Date.now().toString() };
    const index = activeProject.blocks.findIndex(b => b.id === blockId);
    const newBlocks = [...activeProject.blocks];
    newBlocks.splice(index + 1, 0, newBlock);

    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, blocks: newBlocks } : p));
    setShowBlockMenu(false);
  };

  const transformBlock = (blockId: string, type: BlockType, contentOverride?: string) => {
      if(!activeProject) return;
      const block = activeProject.blocks.find(b => b.id === blockId);
      if (!block) return;

      const updates: Partial<Block> = { type };
      
      if (contentOverride !== undefined) {
          updates.content = contentOverride;
      }

      // Specific logic for toggles
      if (type === 'toggle') {
          updates.isOpen = true;
          updates.details = block.details || '';
      }

      updateBlock(blockId, updates);
      setShowSlashMenu(false);
      setShowBlockMenu(false);
      setTimeout(() => {
          document.getElementById(`block-${blockId}`)?.focus();
      }, 0);
  };

  const handleBlockMenuAction = (action: 'delete' | 'duplicate' | BlockType) => {
      if (!activeBlockId) return;

      if (action === 'delete') {
          deleteBlock(activeBlockId);
          setShowBlockMenu(false);
      } else if (action === 'duplicate') {
          duplicateBlock(activeBlockId);
      } else {
          // It's a type conversion
          transformBlock(activeBlockId, action);
      }
  };

  const openBlockMenu = (e: React.MouseEvent, blockId: string) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 5, left: rect.left });
      setActiveBlockId(blockId);
      setShowBlockMenu(true);
  };

  // --- Keyboard Handlers ---

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
      // Shortcut: Ctrl + Shift + 7 -> Toggle Block
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '7') {
          e.preventDefault();
          transformBlock(block.id, 'toggle');
          return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          addBlock(block.id);
      }
      
      if (e.key === 'Backspace' && block.content === '' && !block.details) {
          e.preventDefault();
          deleteBlock(block.id);
      }

      // Handle / trigger manually if needed (though onChange handles it usually)
      if (e.key === '/') {
          // Logic handled in updateBlock via render
      }
  };

  // --- Render Helper ---
  const renderBlockInput = (block: Block, index: number) => {
    const baseClass = "w-full bg-transparent focus:outline-none resize-none overflow-hidden selection:bg-blue-500/30";
    let specificClass = "text-sm text-gray-300 min-h-[24px] py-1";
    let placeholder = index === 0 ? "Escribe algo..." : "Escribe '/' para comandos";

    if (block.type === 'h1') { specificClass = "text-2xl md:text-3xl font-bold text-white mt-4 mb-2"; placeholder = "Encabezado 1"; }
    if (block.type === 'h2') { specificClass = "text-xl md:text-2xl font-bold text-white mt-3 mb-1"; placeholder = "Encabezado 2"; }
    if (block.type === 'h3') { specificClass = "text-lg md:text-xl font-bold text-white mt-2"; placeholder = "Encabezado 3"; }
    if (block.type === 'quote') { specificClass = "text-base md:text-lg text-gray-400 italic border-l-4 border-gray-600 pl-4 py-2 my-2"; placeholder = "Cita..."; }
    if (block.type === 'toggle') { specificClass = "text-sm font-bold text-white py-1"; placeholder = "Título de la pestaña..."; }
    
    // Visual Prefixes
    let prefix = null;
    if (block.type === 'bullet') prefix = <div className="w-6 flex justify-center pt-2.5 select-none"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /></div>;
    if (block.type === 'number') prefix = <div className="w-6 flex justify-center pt-1 text-gray-500 font-mono text-xs select-none">{index + 1}.</div>;
    if (block.type === 'todo') prefix = (
        <div className="w-6 flex justify-center pt-1">
            <button 
                onClick={() => updateBlock(block.id, { isChecked: !block.isChecked })}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${block.isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-600 hover:border-gray-400'}`}
            >
                {block.isChecked && <CheckSquare size={10} />}
            </button>
        </div>
    );
    if (block.type === 'toggle') prefix = (
        <div className="w-6 flex justify-center pt-1">
             <button 
                onClick={() => updateBlock(block.id, { isOpen: !block.isOpen })}
                className="text-gray-400 hover:text-white transition-colors p-0.5 rounded hover:bg-gray-800"
             >
                 {block.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
             </button>
        </div>
    );

    return (
        <div key={block.id} className="group flex flex-col items-start -ml-8 pl-2 hover:bg-[#1c1f2e] rounded-md relative transition-colors">
            <div className="flex w-full items-start relative">
                
                {/* Notion-like "Six Dots" Handle & Menu Trigger */}
                <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 flex items-center justify-end w-8 pr-1 transition-opacity">
                    <button 
                        onClick={(e) => openBlockMenu(e, block.id)}
                        className="text-gray-600 hover:text-white hover:bg-gray-700 rounded p-0.5 cursor-pointer"
                        title="Click to open menu, Drag to move"
                    >
                        <GripVertical size={18} />
                    </button>
                    <div className="text-gray-700 select-none ml-1">
                        <Plus size={14} className="cursor-pointer hover:text-gray-400" onClick={() => addBlock(block.id)} />
                    </div>
                </div>

                {prefix}
                
                <textarea
                    id={`block-${block.id}`}
                    rows={1}
                    value={block.content}
                    placeholder={placeholder}
                    onChange={(e) => {
                        updateBlock(block.id, { content: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className={`${baseClass} ${specificClass} ${block.type === 'todo' && block.isChecked ? 'line-through text-gray-600' : ''}`}
                />
            </div>

            {/* Details Area for Toggle Block */}
            {block.type === 'toggle' && block.isOpen && (
                <div className="w-full pl-6 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <textarea
                        value={block.details || ''}
                        onChange={(e) => {
                            updateBlock(block.id, { details: e.target.value });
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder="Contenido oculto..."
                        className="w-full bg-transparent text-sm text-gray-400 border-l-2 border-gray-700 pl-3 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                        rows={1}
                        style={{ minHeight: '24px' }}
                    />
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!activeProject ? (
        // --- Gallery View ---
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Proyectos</h2>
                    <p className="text-sm text-gray-400">Gestiona todas tus iniciativas en un solo lugar</p>
                </div>
                <button 
                    onClick={createProject}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} /> Nuevo Proyecto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => setActiveProjectId(p.id)}
                        className="bg-[#1c1f2e] border border-gray-800/50 hover:border-blue-500/50 p-6 rounded-2xl cursor-pointer transition-all group relative hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-4xl mb-2 block filter drop-shadow-lg">{p.icon}</span>
                            <button 
                                onClick={(e) => deleteProject(p.id, e)}
                                className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 truncate">
                            {p.title || 'Sin Título'}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                            <Calendar size={12} />
                            <span>Actualizado {new Date(p.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Preview Blocks */}
                        <div className="mt-4 pt-4 border-t border-gray-800/50 space-y-1">
                             {p.blocks.slice(0, 3).map(b => (
                                 <div key={b.id} className="text-[10px] text-gray-500 truncate pl-2 border-l border-gray-700">
                                     {b.content || '...'}
                                 </div>
                             ))}
                        </div>
                    </div>
                ))}
                
                {/* New Project Card (Placeholder style) */}
                <div 
                    onClick={createProject}
                    className="border-2 border-dashed border-gray-800 hover:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 cursor-pointer transition-colors min-h-[200px]"
                >
                    <Plus size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Crear nuevo</span>
                </div>
            </div>
        </div>
      ) : (
        // --- Editor View (Full Page) ---
        <div className="flex-1 bg-[#1c1f2e] rounded-2xl border border-gray-800/50 flex flex-col relative overflow-hidden h-[calc(100vh-6rem)]">
            
            {/* Navigation Header */}
            <div className="absolute top-4 left-4 z-10">
                <button 
                    onClick={() => setActiveProjectId(null)}
                    className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg transition-all border border-white/10 text-xs font-medium"
                >
                    <ArrowLeft size={14} /> Volver
                </button>
            </div>

            {/* Cover / Header */}
            <div className="h-48 bg-gradient-to-r from-blue-900/20 via-[#1c1f2e] to-purple-900/20 border-b border-gray-800/50 relative shrink-0">
                <div className="absolute bottom-0 left-4 md:left-20 transform translate-y-1/2 flex items-end gap-4">
                    
                    {/* Icon with Picker Trigger */}
                    <div className="relative group/icon" ref={iconPickerRef}>
                        <div 
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="text-6xl md:text-8xl select-none cursor-pointer hover:scale-105 transition-transform filter drop-shadow-2xl"
                        >
                            {activeProject.icon}
                        </div>
                        
                        <div 
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="absolute bottom-2 -right-2 opacity-100 lg:opacity-0 lg:group-hover/icon:opacity-100 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full p-1.5 cursor-pointer border border-gray-600 shadow-xl transition-all"
                        >
                            <Smile size={14} />
                        </div>

                        {/* Emoji Picker Popover */}
                        {showIconPicker && (
                            <div className="absolute top-full left-0 mt-2 z-50 bg-[#1c1f2e] border border-gray-700 rounded-xl shadow-2xl w-64 animate-in fade-in zoom-in duration-200">
                                <div className="p-3 border-b border-gray-800 font-bold text-xs text-gray-500 uppercase">
                                    Seleccionar Icono
                                </div>
                                <div className="h-60 overflow-y-auto custom-scrollbar p-2 grid grid-cols-5 gap-1">
                                    {EMOJI_LIST.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => updateProjectIcon(emoji)}
                                            className="text-xl p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 pb-32 px-4 md:px-20 lg:px-40">
                
                {/* Title Input */}
                <input 
                    type="text"
                    value={activeProject.title}
                    onChange={(e) => updateProjectTitle(e.target.value)}
                    placeholder="Título del Proyecto"
                    className="w-full bg-transparent text-3xl md:text-5xl font-bold text-white placeholder-gray-700 focus:outline-none mb-6 leading-tight"
                />

                {/* Info Bar */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-10 border-b border-gray-800/50 pb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">YO</div>
                        <span className="text-gray-400">Propietario</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        <span>Editado {new Date(activeProject.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="ml-auto text-gray-600 font-mono">
                        {activeProject.blocks.length} bloques
                    </div>
                </div>

                {/* Blocks */}
                <div className="space-y-1 min-h-[400px]">
                    {activeProject.blocks.map((block, index) => renderBlockInput(block, index))}
                    
                    {/* Empty Click Area */}
                    <div 
                        className="h-32 cursor-text opacity-0 hover:opacity-100 flex items-center justify-center text-gray-700 text-sm transition-opacity"
                        onClick={() => addBlock(activeProject.blocks[activeProject.blocks.length - 1].id)}
                    >
                        Haz clic para añadir contenido al final
                    </div>
                </div>

            </div>

            {/* Slash Menu Popover */}
            {showSlashMenu && (
                <SlashMenu 
                    position={menuPosition} 
                    onSelect={(type) => transformBlock(activeBlockId!, type, '')} 
                    onClose={() => setShowSlashMenu(false)} 
                />
            )}

            {/* Block Options Menu (The 6-dots menu) */}
            {showBlockMenu && (
                <BlockOptionsMenu 
                    position={menuPosition}
                    onAction={handleBlockMenuAction}
                    onClose={() => setShowBlockMenu(false)}
                />
            )}
        </div>
      )}

    </div>
  );
};

export default ProjectsPage;
