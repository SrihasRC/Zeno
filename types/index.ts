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
  startTime?: string;
  endTime?: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  date?: Date; // For monthly view events
  color: string;
  type: 'recurring' | 'one-time' | 'assignment'; // added assignment type
  createdAt: Date;
  // Assignment-specific fields (optional for backward compatibility)
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'submitted' | 'graded';
  assignmentId?: string; // Reference to the original assignment
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor?: string;
  credits?: number;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'assignment' | 'project' | 'exam' | 'quiz' | 'presentation';
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high';
  grade?: string;
  maxPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'desktop' | 'aiml' | 'other';
  customCategory?: string; // For when category is 'other'
  tags: string[];
  techStack: string[];
  customTechStack?: string; // For custom technologies not in the predefined list
  status: 'planning' | 'in-progress' | 'done' | 'on-hold';
  repositoryUrl?: string;
  liveUrl?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'file' | 'link' | 'youtube' | 'website' | 'document';
  category: 'academic' | 'personal' | 'work' | 'reference' | 'tutorial' | 'other';
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  // For file uploads
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: ArrayBuffer;
  // For links
  url?: string;
  // For YouTube videos
  youtubeId?: string;
  // Additional metadata
  isFavorite?: boolean;
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
  label?: string;
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
  category: 'personal' | 'professional' | 'health' | 'learning' | 'financial' | 'other';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'work' | 'learning' | 'ideas' | 'meeting' | 'journal' | 'other';
  tags: string[];
  mood?: 'excellent' | 'good' | 'neutral' | 'sad' | 'stressed';
  createdAt: Date;
  updatedAt: Date;
}
