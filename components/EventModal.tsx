import React, { useState, useEffect } from 'react';
import { Category, Task } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  categories: Category[];
  initialDate?: Date;
  existingTask?: Task | null;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, categories, initialDate, existingTask }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        // Edit Mode
        setTitle(existingTask.title);
        setDate(existingTask.date);
        setTime(existingTask.time || '');
        setCategoryId(existingTask.categoryId);
        setDescription(existingTask.description || '');
      } else {
        // Create Mode
        setTitle('');
        setDate(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setTime('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setDescription('');
      }
    }
  }, [isOpen, existingTask, initialDate, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !categoryId) return;

    const taskToSave: Task = {
      id: existingTask ? existingTask.id : Date.now().toString(),
      title,
      date,
      time: time || undefined,
      categoryId,
      description: description || undefined,
      completed: existingTask ? existingTask.completed : false,
    };

    onSave(taskToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{existingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h2>
            <p className="text-sm text-text-muted">
              {existingTask ? 'Modifica los detalles del evento' : 'Añade detalles para tu próximo evento'}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Título <span className="text-primary">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">edit</span>
              <input
                autoFocus
                type="text"
                placeholder="¿Qué hay que hacer?"
                className="w-full pl-10 pr-4 py-3 bg-background-light rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Fecha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">calendar_today</span>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Hora (opcional)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-background-light rounded-xl border border-dashed border-primary/20">
            <label className="text-sm font-semibold text-gray-700">Categoría</label>
            {categories.length === 0 ? (
              <p className="text-xs text-red-500">No hay etiquetas. Crea una en el menú lateral.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <label key={cat.id} className="cursor-pointer relative group shrink-0">
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={categoryId === cat.id}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="peer sr-only"
                    />
                    <div className={`
                      px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all
                      peer-checked:bg-white peer-checked:shadow-sm peer-checked:border-primary peer-checked:text-gray-900
                      hover:bg-white/50 border-transparent text-gray-500
                    `}>
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      {cat.name}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Descripción</label>
            <textarea
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-primary resize-none h-24"
              placeholder="Añade detalles, enlaces o notas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

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
              {existingTask ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};