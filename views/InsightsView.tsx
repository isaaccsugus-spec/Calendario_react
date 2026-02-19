import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Task, Category } from '../types';
import { daysShort } from '../utils/dateUtils';

interface InsightsViewProps {
  tasks: Task[];
  categories: Category[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ tasks, categories }) => {
  
  // --- CALCULOS EN TIEMPO REAL ---

  // 1. Datos Generales
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 2. Calcular Racha Actual (Current Streak)
  const streak = useMemo(() => {
    // Obtener fechas únicas de tareas completadas
    const completedDates = [...new Set(
      tasks
        .filter(t => t.completed)
        .map(t => t.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Ordenar descendente (más reciente primero)
    )];

    if (completedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Si la última tarea no fue hoy ni ayer, la racha es 0
    if (completedDates[0] !== today && completedDates[0] !== yesterday) {
      return 0;
    }

    let currentStreak = 1;
    let currentDateStr = completedDates[0];

    // Iterar para buscar días consecutivos
    for (let i = 1; i < completedDates.length; i++) {
      const prevDateStr = completedDates[i];
      
      const curr = new Date(currentDateStr);
      const prev = new Date(prevDateStr);
      
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        currentStreak++;
        currentDateStr = prevDateStr;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [tasks]);

  // 3. Datos por Categoría (Para el Gráfico Circular)
  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const count = tasks.filter(t => t.categoryId === cat.id).length;
      // Mapeo básico de colores de Tailwind a Hex para Recharts
      let hexColor = '#9ca3af';
      if (cat.color.includes('purple')) hexColor = '#a855f7';
      if (cat.color.includes('blue')) hexColor = '#3b82f6';
      if (cat.color.includes('green')) hexColor = '#22c55e';
      if (cat.color.includes('red')) hexColor = '#f87171';
      if (cat.color.includes('yellow')) hexColor = '#facc15';
      if (cat.color.includes('primary')) hexColor = '#ec13c1';
      if (cat.color.includes('indigo')) hexColor = '#6366f1';
      if (cat.color.includes('teal')) hexColor = '#2dd4bf';

      return {
        name: cat.name,
        value: count,
        color: hexColor
      };
    }).filter(d => d.value > 0);
  }, [tasks, categories]);

  // 4. Actividad por Día de la Semana (Para el Gráfico de Barras)
  const weeklyActivityData = useMemo(() => {
    // Inicializar contadores para Dom(0) a Sab(6)
    const activity = Array(7).fill(0).map((_, i) => ({
      name: daysShort[i],
      completed: 0,
      total: 0
    }));

    tasks.forEach(task => {
      const date = new Date(task.date);
      const dayIndex = date.getDay(); // 0 = Domingo
      activity[dayIndex].total += 1;
      if (task.completed) {
        activity[dayIndex].completed += 1;
      }
    });
    
    // Reordenar para que empiece el Lunes (opcional, pero común en ES)
    // Mover Domingo (índice 0) al final
    const sunday = activity.shift();
    if(sunday) activity.push(sunday);

    return activity;
  }, [tasks]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto h-full pb-20 scrollbar-hide">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Tu Rendimiento</h2>
        <p className="text-text-muted">Análisis en tiempo real de tus tareas</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tasa de Completado */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden">
          <div className="relative w-24 h-24 flex-shrink-0 z-10">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: completionRate }, { value: 100 - completionRate }]}
                    innerRadius={30}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    <Cell fill="#ec13c1" />
                    <Cell fill="#f3e8f0" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-900">
               <span className="text-xl font-bold">{completionRate}%</span>
             </div>
          </div>
          <div className="z-10">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Eficiencia</h3>
            <div className="text-2xl font-bold text-gray-900 mt-1">{completedTasks} <span className="text-sm font-normal text-gray-400">/ {totalTasks} tareas</span></div>
            <div className="text-xs text-green-600 font-semibold mt-1 bg-green-50 px-2 py-1 rounded-full inline-block">
               {completedTasks > 0 ? '¡Buen trabajo!' : '¡Empieza hoy!'}
            </div>
          </div>
          {/* Decorative Blob */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
        </div>

        {/* Racha (Streak) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Racha Actual</h3>
            <span className={`material-symbols-outlined filled ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`}>local_fire_department</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black text-gray-900">{streak}</span>
            <span className="text-lg font-medium text-text-muted">Días</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 relative z-10">
            {streak > 2 ? '¡Estás en llamas! Sigue así.' : 'Completa tareas hoy y mañana para aumentar tu racha.'}
          </p>
           {/* Decorative Blob */}
           <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-50 rounded-full blur-2xl"></div>
        </div>

        {/* Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
           <div className="flex justify-between items-start z-10">
             <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Por Hacer</h3>
             <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
               <span className="material-symbols-outlined text-[14px]">pending_actions</span> Activas
             </span>
           </div>
           <div className="z-10 mt-2">
             <span className="text-4xl font-bold text-gray-900">{pendingTasks}</span>
             <p className="text-sm text-text-muted mt-1">Tareas esperando tu atención</p>
           </div>
           {/* Decorative Blob */}
           <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Actividad Semanal */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Actividad por Día</h3>
            <p className="text-sm text-text-muted">¿Qué días eres más productivo?</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9ca3af'}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9ca3af'}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8f6f8'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="total" name="Total" fill="#f3f4f6" radius={[4, 4, 4, 4]} stackId="a" />
                <Bar dataKey="completed" name="Completadas" fill="#ec13c1" radius={[4, 4, 4, 4]} stackId="b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Categorías */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Distribución</h3>
            <p className="text-sm text-text-muted">Categorías de tus tareas</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
             {categoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="text-center text-gray-300">
                 <span className="material-symbols-outlined text-4xl mb-2">donut_small</span>
                 <p className="text-sm">Sin datos suficientes</p>
               </div>
             )}
          </div>
          
          {/* Leyenda Personalizada */}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
