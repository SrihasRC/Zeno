// Common types for the Zeno productivity app

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  tags: string[];
  subtasks: SubTask[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimetableBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  color: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  techStack: string[];
  status: 'planning' | 'in-progress' | 'done';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  tags: string[];
  notes: string;
  uploadedAt: Date;
  fileData?: ArrayBuffer;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  steps: RoadmapStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSession {
  id: string;
  type: 'focus' | 'short-break' | 'long-break';
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  date: Date;
  tags: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: Date;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
