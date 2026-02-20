import React from 'react';
import { Task, Category } from '../types';
import { daysShort, months, formatDate } from '../utils/dateUtils';

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({ currentDate, tasks, categories, onToggleTask, onEditTask, onDeleteTask }) => {
  const dateStr = formatDate(currentDate); // Cambio aplicado aquí
  const daysTasks = tasks.filter(t => t.date === dateStr);
  
  // Sorting: Time first, then no time
  const sortedTasks = [...daysTasks].sort((a, b) => {
     if (a.time && b.time) return a.time.localeCompare(b.time);
     if (a.time && !b.time) return -1;
     if (!a.time && b.time) return 1;
     return 0;
  });

  const scheduledTasks = sortedTasks.filter(t => t.time);
  const anytimeTasks = sortedTasks.filter(t => !t.time);
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name;
  const getCategoryStyle = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return 'bg-gray-100 text-gray-600';
    if (cat.type === 'work') return 'bg-purple-100 text-purple-700';
    if (cat.type === 'personal') return 'bg-blue-100 text-blue-700';
    if (cat.type === 'health') return 'bg-green-100 text-green-700';
    if (cat.type === 'study') return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="group flex gap-4 bg-white hover:bg-background-light/50 px-4 py-4 rounded-xl transition-all border border-transparent hover:border-primary/20">
      <div className="flex items-start pt-1">
        <input 
          type="checkbox" 
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-all"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between items-start w-full">
          <p className={`text-base font-semibold transition-colors ${task.completed ? 'text-gray-400 line-through' : 'text-text-main group-hover:text-primary'}`}>
            {task.title}
          </p>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryStyle(task.categoryId)}`}>
            {getCategoryName(task.categoryId)}
          </span>
        </div>
        {(task.time || task.description) && (
          <p className={`text-sm ${task.completed ? 'text-gray-300' : 'text-text-muted'}`}>
            {task.time && <span className="font-medium mr-2">{task.time}</span>}
            {task.description}
          </p>
        )}
        
        <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
           <button onClick={() => onEditTask(task)} className="text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1">
             <span className="material-symbols-outlined text-[16px]">edit</span> Editar
           </button>
           <button onClick={() => onDeleteTask(task.id)} className="text-xs font-medium text-text-muted hover:text-red-500 flex items-center gap-1">
             <span className="material-symbols-outlined text-[16px]">delete</span> Borrar
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <header className="px-8 pt-8 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-black tracking-tight text-gray-900 capitalize">
               {daysShort[currentDate.getDay()]}, {currentDate.getDate()} de {months[currentDate.getMonth()]}
             </h1>
             <p className="text-text-muted mt-1 font-medium">
               {daysTasks.filter(t => !t.completed).length} tareas restantes
             </p>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {scheduledTasks.length > 0 && (
          <div>
            <div className="px-2 pb-3 text-xs font-bold uppercase tracking-wider text-text-muted/70 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">schedule</span> Programado
            </div>
            <div className="space-y-2">
              {scheduledTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {anytimeTasks.length > 0 && (
          <div>
            <div className="px-2 pb-3 pt-4 text-xs font-bold uppercase tracking-wider text-text-muted/70 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">all_inclusive</span> En cualquier momento
            </div>
            <div className="space-y-2">
               {anytimeTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {daysTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">event_busy</span>
            <p className="font-medium text-text-muted">No tienes tareas para este día.</p>
          </div>
        )}
      </div>
    </div>
  );
};