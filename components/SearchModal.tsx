import React, { useState, useEffect, useRef } from 'react';
import { Task, Category } from '../types';
import { parseLocalDate } from '../utils/dateUtils'; // <- ACTUALIZADO

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: Category[];
  onSelectTask: (task: Task) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, tasks, categories, onSelectTask }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(task => {
    if (!query) return false;
    const searchLower = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower))
    );
  }).slice(0, 5);

  const getCategoryColor = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.color : 'bg-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <span className="material-symbols-outlined text-primary text-2xl">search</span>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Buscar eventos, notas, reuniones..." 
            className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-900 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded bg-gray-100 text-xs font-bold uppercase tracking-wider">
            ESC
          </button>
        </div>

        <div className="bg-gray-50/50 min-h-[100px] max-h-[400px] overflow-y-auto">
          {query === '' && (
            <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-sm">
              <p>Escribe para buscar en tu calendario</p>
            </div>
          )}

          {query !== '' && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-sm">
              <span className="material-symbols-outlined mb-1">search_off</span>
              <p>No se encontraron resultados</p>
            </div>
          )}

          {filteredTasks.map(task => {
            const dateLocal = parseLocalDate(task.date); // <- FIX AQUÍ
            return (
            <div 
              key={task.id}
              onClick={() => { onSelectTask(task); onClose(); }}
              className="px-4 py-3 hover:bg-white hover:shadow-sm cursor-pointer border-l-4 border-transparent hover:border-primary transition-all flex items-center gap-4 group"
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-500 group-hover:border-primary/20">
                <span className="text-[10px] font-bold uppercase">{dateLocal.toLocaleString('es-ES', { month: 'short' }).replace('.', '')}</span>
                <span className="text-lg font-bold text-gray-900">{dateLocal.getDate()}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.categoryId)}`} />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {task.time && <span className="font-mono bg-gray-200 px-1 rounded mr-2">{task.time}</span>}
                  {task.description || 'Sin descripción adicional'}
                </p>
              </div>

              <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">chevron_right</span>
            </div>
          )})}
        </div>
        
        {filteredTasks.length > 0 && (
           <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 text-right">
             Mostrando {filteredTasks.length} resultados
           </div>
        )}
      </div>
    </div>
  );
};