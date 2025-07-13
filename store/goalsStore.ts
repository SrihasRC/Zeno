import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal } from '@/types';

interface GoalsStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  toggleComplete: (id: string) => void;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getGoalsByCategory: (category: Goal['category']) => Goal[];
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      goals: [],
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: crypto.randomUUID(),
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id 
              ? { ...goal, ...updates, updatedAt: new Date() } 
              : goal
          ),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },
      updateProgress: (id, progress) => {
        const clampedProgress = Math.max(0, Math.min(100, progress));
        const isCompleted = clampedProgress >= 100;
        
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id 
              ? { 
                  ...goal, 
                  progress: clampedProgress,
                  isCompleted,
                  updatedAt: new Date() 
                } 
              : goal
          ),
        }));
      },
      toggleComplete: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id 
              ? { 
                  ...goal, 
                  isCompleted: !goal.isCompleted,
                  progress: !goal.isCompleted ? 100 : goal.progress,
                  updatedAt: new Date() 
                } 
              : goal
          ),
        }));
      },
      getActiveGoals: () => {
        return get().goals.filter((goal) => !goal.isCompleted);
      },
      getCompletedGoals: () => {
        return get().goals.filter((goal) => goal.isCompleted);
      },
      getGoalsByCategory: (category) => {
        return get().goals.filter((goal) => goal.category === category);
      },
    }),
    {
      name: 'goals-storage',
    }
  )
);
