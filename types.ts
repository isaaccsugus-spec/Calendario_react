export type ViewType = 'day' | 'week' | 'month' | 'insights' | 'settings';

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  type: 'work' | 'personal' | 'health' | 'study' | 'other';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO Date string YYYY-MM-DD
  time?: string; // HH:mm
  categoryId: string;
  completed: boolean;
}

export interface UserSettings {
  userName: string;
  theme: 'light' | 'dark';
}
