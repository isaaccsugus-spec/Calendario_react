import React, { useState, useEffect, useRef } from 'react';
import { db } from './services/db';
import { Task, Category, ViewType } from './types';
import { months } from './utils/dateUtils';

// Components
import { EventModal } from './components/EventModal';
import { CategoryModal } from './components/CategoryModal';
import { SearchModal } from './components/SearchModal';

// Views
import { MonthView } from './views/MonthView';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView'; 
import { InsightsView } from './views/InsightsView';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Modals & Sidebars
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<Date | undefined>(undefined);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(db.getTasks());
    setCategories(db.getCategories());

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshData = () => {
    setTasks(db.getTasks());
    setCategories(db.getCategories());
  };

  const handleSaveTask = (newTask: Task) => {
    const saved = db.saveTask(newTask);
    refreshData();
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updated = { ...task, completed: !task.completed };
      handleSaveTask(updated);
    }
  };

  const handleDeleteTask = (id: string) => {
    if(window.confirm('¿Seguro que quieres borrar esta tarea?')) {
      db.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEventModalOpen(true);
  };

  const handleCreateTask = (initialDate?: Date) => {
    setEditingTask(null);
    setSelectedDateForNewTask(initialDate || currentDate);
    setIsEventModalOpen(true);
  };

  const handleSaveCategory = (cat: Category) => {
    const saved = db.saveCategory(cat);
    refreshData();
  };

  const handleDeleteCategory = (id: string) => {
    if(window.confirm('¿Eliminar esta etiqueta? Las tareas asociadas mantendrán el ID pero perderán el color.')) {
      db.deleteCategory(id);
      refreshData();
    }
  };

  // Backup Handlers
  const handleExport = () => {
    db.exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Al importar se sobrescribirán tus datos actuales. ¿Quieres continuar?')) {
      try {
        await db.importData(file);
        refreshData();
        alert('Datos importados correctamente.');
      } catch (error) {
        alert('Error al importar el archivo.');
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + increment);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (increment * 7));
    } else {
      newDate.setDate(newDate.getDate() + increment);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(new Date(e.target.value));
    }
  };

  return (
    <div className="flex h-screen bg-background-light text-text-main font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Mi Calendario</h1>
              <p className="text-xs text-text-muted">Planificador Personal</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
             <button 
                onClick={() => { setCurrentView('day'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentView === 'day' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <span className="material-symbols-outlined">view_day</span>
               Día
             </button>
             <button 
                onClick={() => { setCurrentView('week'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentView === 'week' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <span className="material-symbols-outlined">calendar_view_week</span>
               Semana
             </button>
             <button 
                onClick={() => { setCurrentView('month'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentView === 'month' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <span className="material-symbols-outlined">calendar_view_month</span>
               Mes
             </button>
             <button 
                onClick={() => { setCurrentView('insights'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentView === 'insights' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <span className="material-symbols-outlined">bar_chart</span>
               Estadísticas
             </button>
          </nav>

          <div className="mt-10 px-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Etiquetas</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-gray-400 hover:text-primary transition-colors"
                title="Gestionar etiquetas"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 text-sm text-gray-600 group">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                  <span className="truncate">{cat.name}</span>
                </div>
              ))}
              {categories.length === 0 && <span className="text-xs text-gray-400 italic">Sin etiquetas</span>}
            </div>
          </div>
        </div>
          
        {/* Sidebar Footer - Backup Controls */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
           <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Datos</h4>
           <div className="flex gap-2">
             <button 
               onClick={handleExport}
               className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all"
               title="Descargar copia de seguridad"
             >
               <span className="material-symbols-outlined text-[16px]">download</span>
               Exportar
             </button>
             <button 
               onClick={handleImportClick}
               className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all"
               title="Cargar copia de seguridad"
             >
               <span className="material-symbols-outlined text-[16px]">upload</span>
               Importar
             </button>
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
             />
           </div>
           <div className="mt-3 text-[10px] text-gray-400 text-center">
              V 1.0 • Local Storage
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-gray-100 bg-white flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-gray-500">
              <span className="material-symbols-outlined">menu</span>
            </button>
            
            <div className="flex items-center gap-2 relative group">
                <h2 className="text-xl font-bold text-gray-900 capitalize flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                  {currentView === 'insights' ? 'Resumen' : (
                    <>
                      {months[currentDate.getMonth()]} <span className="text-gray-400 font-normal">{currentDate.getFullYear()}</span>
                    </>
                  )}
                  {currentView !== 'insights' && <span className="material-symbols-outlined text-gray-300 text-sm">expand_more</span>}
                </h2>
                {/* Invisible Date Picker Overlay */}
                {currentView !== 'insights' && (
                  <input 
                    type="date" 
                    onChange={handleDateInput}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentView !== 'insights' && (
              <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                <button onClick={() => changeDate(-1)} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-semibold text-gray-600 hover:text-primary">Hoy</button>
                <button onClick={() => changeDate(1)} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
              title="Buscar (Ctrl+K)"
            >
               <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            
            <button 
              onClick={() => handleCreateTask()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm">Nuevo Evento</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-hidden bg-background-light p-4 md:p-6 relative">
          {currentView === 'month' && (
            <MonthView 
              currentDate={currentDate} 
              tasks={tasks} 
              categories={categories}
              onDateClick={handleDateClick}
              onAddEvent={handleCreateTask}
            />
          )}

          {currentView === 'week' && (
            <WeekView 
              currentDate={currentDate} 
              tasks={tasks} 
              categories={categories}
              onDateClick={handleDateClick}
              onTaskClick={handleEditTask}
              onAddEvent={handleCreateTask}
            />
          )}
          
          {currentView === 'day' && (
            <DayView 
              currentDate={currentDate} 
              tasks={tasks}
              categories={categories}
              onToggleTask={handleToggleTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentView === 'insights' && (
            <InsightsView tasks={tasks} categories={categories} />
          )}

           {/* FAB for Mobile */}
           <button 
              onClick={() => handleCreateTask()}
              className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
           </button>
        </div>
      </main>

      {/* Overlays */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-20 md:hidden"></div>
      )}

      {/* Modals */}
      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveTask}
        categories={categories}
        initialDate={selectedDateForNewTask}
        existingTask={editingTask}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        tasks={tasks}
        categories={categories}
        onSelectTask={(task) => {
          handleDateClick(new Date(task.date)); // Go to that date
          handleEditTask(task); // Open the task
        }}
      />
    </div>
  );
}

export default App;