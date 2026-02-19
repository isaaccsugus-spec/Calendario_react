import { Task, Category, UserSettings } from '../types';

// Mock Data - Empty for production/clean start
const INITIAL_CATEGORIES: Category[] = [
  { id: 'def-1', name: 'General', color: 'bg-gray-500', type: 'other' }
];

const INITIAL_TASKS: Task[] = [];

const INITIAL_SETTINGS: UserSettings = {
  userName: 'Usuario',
  theme: 'light',
};

// Storage Keys - Updated to force fresh state
const KEYS = {
  TASKS: 'app_tasks_v2',
  CATEGORIES: 'app_categories_v2',
  SETTINGS: 'app_settings_v2'
};

export const db = {
  getTasks: (): Task[] => {
    const stored = localStorage.getItem(KEYS.TASKS);
    return stored ? JSON.parse(stored) : INITIAL_TASKS;
  },
  
  saveTask: (task: Task) => {
    const tasks = db.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    return task;
  },

  deleteTask: (taskId: string) => {
    const tasks = db.getTasks().filter(t => t.id !== taskId);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getCategories: (): Category[] => {
    const stored = localStorage.getItem(KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
  },

  saveCategory: (category: Category) => {
    const categories = db.getCategories();
    const existingIndex = categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    return category;
  },

  deleteCategory: (categoryId: string) => {
    const categories = db.getCategories().filter(c => c.id !== categoryId);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getSettings: (): UserSettings => {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // --- Backup Functions ---
  
  exportData: () => {
    const data = {
      tasks: db.getTasks(),
      categories: db.getCategories(),
      settings: db.getSettings(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendario-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData: async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.tasks) localStorage.setItem(KEYS.TASKS, JSON.stringify(data.tasks));
          if (data.categories) localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(data.categories));
          if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
          
          resolve(true);
        } catch (error) {
          console.error('Error importing data', error);
          reject(false);
        }
      };
      reader.onerror = () => reject(false);
      reader.readAsText(file);
    });
  }
};