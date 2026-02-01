
import React, { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './services/firebase';
import { useUserData } from './hooks/useFirestore';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GoalsPage from './components/GoalsPage';
import JournalPage from './components/JournalPage';
import MealPrepPage from './components/MealPrepPage';
import ProjectsPage, { Project } from './components/ProjectsPage';
import AIAssistant from './components/AIAssistant';
import { initialEntries, JournalEntry } from './data/journal';

const App: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  
  // Autenticación Anónima Automática
  useEffect(() => {
    // Escuchar cambios de estado
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
            // Si no hay usuario, iniciamos sesión anónima automáticamente
            // para que Firestore funcione sin pedir credenciales visuales.
            signInAnonymously(auth).catch((err) => {
                console.error("Error en auth anónima:", err);
            });
        }
    });
    return () => unsubscribe();
  }, []);

  const [currentView, setCurrentView] = useState<'dashboard' | 'goals' | 'journal' | 'mealprep' | 'projects'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Firestore Synced State ---
  // Estos hooks esperarán a que el usuario anónimo esté listo
  const [journalEntries, setJournalEntries] = useUserData<Record<string, JournalEntry>>('journal_entries', initialEntries);

  const [projects, setProjects] = useUserData<Project[]>('projects_data', [
    {
        id: '1',
        title: 'Lanzamiento Website',
        icon: '🚀',
        updatedAt: new Date().toISOString(),
        blocks: [
            { id: 'b1', type: 'h1', content: 'Plan de Lanzamiento' },
            { id: 'b2', type: 'text', content: 'Objetivo: Lanzar la nueva landing page para el Q4.' },
            { id: 'b3', type: 'h2', content: 'Tareas Principales' },
            { id: 'b4', type: 'todo', content: 'Comprar dominio', isChecked: true },
            { id: 'b5', type: 'todo', content: 'Configurar SSL', isChecked: false },
            { id: 'b6', type: 'bullet', content: 'Revisar analytics' },
        ]
    },
    {
        id: '2',
        title: 'Ideas de Contenido',
        icon: '💡',
        updatedAt: new Date().toISOString(),
        blocks: [
            { id: 'b1', type: 'h1', content: 'Ideas YouTube Octubre' },
            { id: 'b2', type: 'bullet', content: 'Tutorial de React' },
            { id: 'b3', type: 'bullet', content: 'Vlog de productividad' },
        ]
    }
  ]);

  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); 
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white selection:bg-blue-500 selection:text-white flex flex-col lg:block">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f111a] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-400 hover:text-white"
            >
                <Menu size={24} />
            </button>
            <span className="font-bold text-lg tracking-wide">PROYECTO <span className="font-light">365</span></span>
          </div>
          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
             <span className="text-xs font-bold text-blue-500">P</span>
          </div>
      </div>

      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <main 
        className={`
            transition-all duration-300 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-60px)] lg:min-h-screen
            lg:ml-${isSidebarCollapsed ? '20' : '64'}
        `}
      >
        <div className="flex justify-end lg:absolute lg:top-6 lg:right-8 mb-4 lg:mb-0 z-20">
             <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 hidden md:block">
                    {user ? 'Sincronización Activa' : 'Conectando...'}
                </span>
                <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
             </div>
        </div>

        {currentView === 'dashboard' && (
            <Dashboard 
                journalEntries={journalEntries} 
            />
        )}
        {currentView === 'goals' && <GoalsPage />}
        {currentView === 'projects' && (
            <ProjectsPage 
                projects={projects} 
                setProjects={setProjects} 
            />
        )}
        {currentView === 'journal' && (
            <JournalPage 
                entries={journalEntries} 
                setEntries={setJournalEntries} 
            />
        )}
        {currentView === 'mealprep' && <MealPrepPage />}
      </main>

      {/* Global AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default App;
