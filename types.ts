
export interface User {
  id: string;
  name: string;
  email: string;
  birthday: string; // ISO string
  password?: string;
}

export interface Task {
  id: string;
  text: string;
  dueDate: string; // ISO string
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  notified: boolean;
  alarmEnabled: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[];
  timestamp: number;
}

export interface AIAdvice {
  suggestion: string;
  motivation: string;
  prioritizedIds: string[];
}
