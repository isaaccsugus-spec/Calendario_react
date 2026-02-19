import React, { useState } from 'react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (category: Category) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  'bg-purple-500', 'bg-blue-400', 'bg-green-500', 
  'bg-primary', 'bg-red-400', 'bg-yellow-400', 
  'bg-indigo-500', 'bg-teal-400'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categories, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCategory: Category = {
      id: editingId || Date.now().toString(),
      name,
      color: selectedColor,
      type: 'other' // Default type
    };

    onSave(newCategory);
    resetForm();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSelectedColor(cat.color);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSelectedColor(COLORS[0]);
  };

  return (
    <div className="fixed inset-0 bg-background-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Gestionar Etiquetas</h2>
          <button onClick={onClose} className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-8 bg-background-light p-4 rounded-xl">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{editingId ? 'Editar Etiqueta' : 'Nueva Etiqueta'}</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Nombre de la etiqueta"
                className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs text-gray-500 font-medium hover:text-gray-700">
                  Cancelar
                </button>
              )}
              <button type="submit" className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black">
                {editingId ? 'Actualizar' : 'Añadir'}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(cat)} className="p-1 text-gray-400 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};