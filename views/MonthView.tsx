import React from 'react';
import { getDaysInMonth, getFirstDayOfMonth, daysShort, isSameDay } from '../utils/dateUtils';
import { Task, Category } from '../types';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  categories: Category[];
  onDateClick: (date: Date) => void;
  onAddEvent: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, tasks, categories, onDateClick, onAddEvent }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  const getTaskColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (cat.color.includes('purple')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (cat.color.includes('blue')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (cat.color.includes('green')) return 'bg-green-100 text-green-700 border-green-200';
    if (cat.color.includes('red')) return 'bg-red-100 text-red-700 border-red-200';
    if (cat.color.includes('yellow')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-pink-100 text-pink-700 border-primary/20';
  };

  // Helper to sort tasks: Tasks with time first, then no-time. Sorted chronologically.
  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return 0;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Days */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {daysShort.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="bg-background-light/30 border-b border-r border-gray-50 min-h-[100px]" />
        ))}
        
        {days.map(day => {
          const dateObj = new Date(year, month, day);
          const dateStr = dateObj.toISOString().split('T')[0];
          
          // Filter and Sort
          const rawTasks = tasks.filter(t => t.date === dateStr);
          const sortedTasks = sortTasks([...rawTasks]);
          
          const isToday = isSameDay(dateObj, today);

          // Overflow Logic
          const MAX_VISIBLE_TASKS = 4;
          const visibleTasks = sortedTasks.slice(0, MAX_VISIBLE_TASKS);
          const hiddenCount = sortedTasks.length - MAX_VISIBLE_TASKS;

          return (
            <div 
              key={day} 
              onClick={() => onDateClick(dateObj)}
              className={`
                group min-h-[120px] p-2 border-b border-r border-gray-50 relative transition-colors cursor-pointer flex flex-col
                hover:bg-primary/5
                ${isToday ? 'bg-primary/5' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-1 shrink-0">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-primary text-white shadow-md' : 'text-text-main'}
                `}>
                  {day}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddEvent(dateObj); }}
                  className="opacity-0 group-hover:opacity-100 text-primary hover:bg-primary/10 rounded-full p-1 transition-all"
                  title="Añadir evento"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              <div className="flex flex-col gap-1 w-full">
                {visibleTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`
                      text-[10px] font-semibold px-1.5 py-0.5 rounded border border-transparent truncate w-full
                      ${getTaskColor(task.categoryId)}
                      ${task.completed ? 'opacity-50 line-through' : ''}
                    `}
                    title={task.title}
                  >
                    {task.time ? <span className="mr-1 opacity-75">{task.time}</span> : ''}
                    {task.title}
                  </div>
                ))}
                
                {hiddenCount > 0 && (
                  <div className="text-[10px] font-bold text-text-muted px-1.5 mt-0.5">
                    +{hiddenCount} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
