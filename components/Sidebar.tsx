
import React from 'react';
import { Home, Target, BookOpen, Utensils, ChevronLeft, ChevronRight, Briefcase, X } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'goals' | 'journal' | 'mealprep' | 'projects';
  onViewChange: (view: 'dashboard' | 'goals' | 'journal' | 'mealprep' | 'projects') => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, 
    onViewChange, 
    isCollapsed, 
    toggleSidebar, 
    isMobileOpen,
    closeMobileMenu
}) => {
  const navItemClass = (active: boolean) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap
    ${active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
      : 'text-gray-400 hover:bg-[#1c1f2e] hover:text-white'
    }
    ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
  `;

  return (
    <>
        {/* Mobile Backdrop */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={closeMobileMenu}
            />
        )}

        {/* Sidebar Container */}
        <div 
        className={`
            fixed top-0 left-0 h-screen bg-[#0f111a] border-r border-gray-800/50 flex flex-col p-4 transition-transform duration-300 z-50
            lg:translate-x-0 
            ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
        >
        {/* Header / Toggle */}
        <div className={`flex items-center mb-10 ${isCollapsed ? 'lg:justify-center lg:flex-col lg:gap-4' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 bg-black rounded-full" />
                </div>
                {(!isCollapsed || isMobileOpen) && (
                    <span className="text-lg font-bold tracking-wide text-white animate-in fade-in duration-300">
                        PROYECTO <span className="font-light">365</span>
                    </span>
                )}
            </div>
            
            {/* Desktop Toggle */}
            <button 
                onClick={toggleSidebar}
                className="hidden lg:block p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close */}
            <button 
                onClick={closeMobileMenu}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
                <X size={20} />
            </button>
        </div>

        {/* Main Menu */}
        <nav className="space-y-2">
            <div 
            onClick={() => onViewChange('dashboard')} 
            className={navItemClass(currentView === 'dashboard')}
            title={isCollapsed ? "Dashboard" : ""}
            >
            <div className={`p-1.5 rounded-lg shrink-0 ${currentView === 'dashboard' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                <Home size={16} className={currentView === 'dashboard' ? 'text-white' : 'text-gray-400'} />
            </div>
            {(!isCollapsed || isMobileOpen) && <span>Dashboard</span>}
            </div>
            <div 
            onClick={() => onViewChange('goals')} 
            className={navItemClass(currentView === 'goals')}
            title={isCollapsed ? "Mis Metas 2026" : ""}
            >
            <div className={`p-1.5 rounded-lg shrink-0 ${currentView === 'goals' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                <Target size={16} className={currentView === 'goals' ? 'text-white' : 'text-gray-400'} />
            </div>
            {(!isCollapsed || isMobileOpen) && <span>Mis Metas 2026</span>}
            </div>
            
            <div 
            onClick={() => onViewChange('journal')} 
            className={navItemClass(currentView === 'journal')}
            title={isCollapsed ? "Journal" : ""}
            >
            <div className={`p-1.5 rounded-lg shrink-0 ${currentView === 'journal' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                <BookOpen size={16} className={currentView === 'journal' ? 'text-white' : 'text-gray-400'} />
            </div>
            {(!isCollapsed || isMobileOpen) && <span>Journal</span>}
            </div>
            
            <div 
            onClick={() => onViewChange('projects')} 
            className={navItemClass(currentView === 'projects')}
            title={isCollapsed ? "Proyectos" : ""}
            >
            <div className={`p-1.5 rounded-lg shrink-0 ${currentView === 'projects' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                <Briefcase size={16} className={currentView === 'projects' ? 'text-white' : 'text-gray-400'} />
            </div>
            {(!isCollapsed || isMobileOpen) && <span>Proyectos</span>}
            </div>
            
            <div 
            onClick={() => onViewChange('mealprep')} 
            className={navItemClass(currentView === 'mealprep')}
            title={isCollapsed ? "Meal Prep" : ""}
            >
            <div className={`p-1.5 rounded-lg shrink-0 ${currentView === 'mealprep' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                <Utensils size={16} className={currentView === 'mealprep' ? 'text-white' : 'text-gray-400'} />
            </div>
            {(!isCollapsed || isMobileOpen) && <span>Meal Prep</span>}
            </div>
        </nav>
        </div>
    </>
  );
};

export default Sidebar;
