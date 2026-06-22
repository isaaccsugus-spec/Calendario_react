import React, { useState, useEffect } from 'react';
import { Category, Task } from '../types';
import { formatDate, parseLocalDate, addDays } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onSaveMultiple?: (tasks: Task[]) => void; // <-- NUEVO PROP AÑADIDO
  categories: Category[];
  initialDate?: Date;
  existingTask?: Task | null;
}

export const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onSaveMultiple, 
  categories, 
  initialDate, 
  existingTask 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  // --- ESTADOS PARA LA REPETICIÓN DE TAREAS ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]); 

  // Configuración de los días de la semana (0 = Domingo, 1 = Lunes...)
  const weekDaysConfig = [
    { label: 'L', value: 1 }, { label: 'M', value: 2 }, { label: 'X', value: 3 },
    { label: 'J', value: 4 }, { label: 'V', value: 5 }, { label: 'S', value: 6 }, { label: 'D', value: 0 }
  ];

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setDate(existingTask.date);
        setTime(existingTask.time || '');
        setCategoryId(existingTask.categoryId);
        setDescription(existingTask.description || '');
        
        // Si estamos editando, desactivamos la opción de repetir
        setIsRecurring(false);
      } else {
        setTitle('');
        const targetDate = initialDate ? initialDate : new Date();
        setDate(formatDate(targetDate)); // Usando fecha local
        setTime('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setDescription('');

        // Resetear la repetición por defecto
        setIsRecurring(false);
        setRecurrenceEndDate(formatDate(addDays(targetDate, 7))); // Por defecto repetir hasta 1 semana después
        setSelectedDays([targetDate.getDay()]); // Por defecto marcar el día actual
      }
    }
  }, [isOpen, existingTask, initialDate, categories]);

  if (!isOpen) return null;

  // Función para alternar los días seleccionados
  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !categoryId) return;

    const baseTask = {
      title,
      time: time || undefined,
      categoryId,
      description: description || undefined,
      completed: existingTask ? existingTask.completed : false,
    };

    // Si NO es una tarea recurrente o estamos editando una existente
    if (!isRecurring || existingTask) {
      onSave({ ...baseTask, id: existingTask ? existingTask.id : Date.now().toString(), date });
    } 
    // Si SÍ es una nueva tarea recurrente
    else {
      let currDate = parseLocalDate(date);
      const end = parseLocalDate(recurrenceEndDate);
      const tasksToSave: Task[] = [];
      let counter = 0;

      // Bucle para generar las tareas día a día hasta la fecha límite
      while (currDate <= end) {
        const dayOfWeek = currDate.getDay();
        let shouldAdd = false;

        if (recurrenceType === 'daily') shouldAdd = true;
        if (recurrenceType === 'weekly' && selectedDays.includes(dayOfWeek)) shouldAdd = true;

        if (shouldAdd) {
          tasksToSave.push({
            ...baseTask,
            id: `${Date.now().toString()}-${counter}`,
            date: formatDate(currDate)
          });
          counter++;
        }
        currDate = addDays(currDate, 1);
      }

      // Guardar las múltiples tareas si existe la función
      if (onSaveMultiple && tasksToSave.length > 0) {
        onSaveMultiple(tasksToSave);
      } else if (tasksToSave.length > 0) {
        onSave(tasksToSave[0]); // Fallback de seguridad
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{existingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Título <span className="text-primary">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">edit</span>
              <input
                autoFocus type="text" placeholder="¿Qué hay que hacer?"
                className="w-full pl-10 pr-4 py-3 bg-background-light rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-gray-900 font-medium"
                value={title} onChange={(e) => setTitle(e.target.value)} required
              />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Fecha de inicio</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                value={date} onChange={(e) => setDate(e.target.value)} required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Hora (opcional)</label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                value={time} onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* NUEVO BLOQUE: OPCIONES DE REPETICIÓN (Solo se muestra al crear tareas nuevas) */}
          {!existingTask && (
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">Repetir esta tarea</span>
              </label>

              {isRecurring && (
                <div className="mt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-500 font-medium">Tipo de repetición</label>
                      <select 
                        value={recurrenceType} 
                        onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly')}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="daily">Todos los días</option>
                        <option value="weekly">Días específicos</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-500 font-medium">Repetir hasta</label>
                      <input 
                        type="date" 
                        min={date} // No se puede repetir hacia atrás en el tiempo
                        value={recurrenceEndDate} 
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                        required={isRecurring}
                      />
                    </div>
                  </div>

                  {/* Selector de días de la semana */}
                  {recurrenceType === 'weekly' && (
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200">
                      {weekDaysConfig.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                            selectedDays.includes(day.value) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Categoría */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Etiqueta</label>
            {categories.length === 0 ? (
              <p className="text-xs text-red-500 italic">No hay etiquetas creadas. Por favor, crea una en el menú principal.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <label key={cat.id} className="cursor-pointer shrink-0">
                    <input type="radio" name="category" value={cat.id} checked={categoryId === cat.id} onChange={(e) => setCategoryId(e.target.value)} className="peer sr-only"/>
                    <div className="px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 peer-checked:bg-gray-900 peer-checked:text-white border-gray-200 text-gray-500 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      {cat.name}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Descripción</label>
            <textarea
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary resize-none h-24"
              placeholder="Añade detalles, enlaces o notas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {existingTask ? 'Actualizar' : isRecurring ? 'Crear Tareas' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};