import React from 'react';
import { getWeekDays, isSameDay, daysShort, formatDate } from '../utils/dateUtils';
import { Task, Category } from '../types';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
  onAddEvent: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, tasks, categories, onTaskClick, onDateClick, onAddEvent }) => {
  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  const getTaskColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 'bg-gray-100 border-l-4 border-gray-400 text-gray-700';
    if (cat.color.includes('purple')) return 'bg-purple-50 border-l-4 border-purple-500 text-purple-900';
    if (cat.color.includes('blue')) return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
    if (cat.color.includes('green')) return 'bg-green-50 border-l-4 border-green-500 text-green-900';
    if (cat.color.includes('red')) return 'bg-red-50 border-l-4 border-red-500 text-red-900';
    if (cat.color.includes('yellow')) return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
    if (cat.color.includes('primary')) return 'bg-pink-50 border-l-4 border-primary text-pink-900';
    return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
  };

  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return 0;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Grid */}
      <div className="grid grid-cols-7 border-b border-gray-100 divide-x divide-gray-100">
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onDateClick(day)}
              className={`
                py-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50
                ${isToday ? 'bg-primary/5' : ''}
              `}
            >
              <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                {daysShort[index === 0 ? 6 : index - 1]} 
              </span>
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg
                ${isToday ? 'bg-primary text-white shadow-md' : 'text-gray-900'}
              `}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 min-h-full divide-x divide-gray-100">
          {weekDays.map((day) => {
            const dateStr = formatDate(day); // Cambio aplicado aquí
            const rawTasks = tasks.filter(t => t.date === dateStr);
            const dayTasks = sortTasks([...rawTasks]);
            const isToday = isSameDay(day, today);

            return (
              <div 
                key={day.toISOString()} 
                className={`flex flex-col gap-2 p-2 min-h-[200px] group relative ${isToday ? 'bg-primary/5' : ''}`}
                onClick={() => onDateClick(day)}
              >
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                    className={`
                      p-2 rounded shadow-sm text-xs cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md
                      ${getTaskColor(task.categoryId)}
                      ${task.completed ? 'opacity-60 grayscale' : ''}
                    `}
                  >
                    <div className="font-semibold truncate">{task.title}</div>
                    <div className="flex justify-between items-center mt-1">
                      {task.time ? (
                        <span className="opacity-75 text-[10px] font-mono bg-white/30 px-1 rounded">
                          {task.time}
                        </span>
                      ) : (
                        <span className="opacity-0">.</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add button visible on hover or if list is empty */}
                <div className={`
                   flex items-center justify-center pt-4 pb-10
                   ${dayTasks.length === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity
                `}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddEvent(day); }}
                      className="text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors rounded-full p-2"
                      title="Añadir evento"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};