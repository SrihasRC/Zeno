import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PomodoroSession } from '@/types';

interface PomodoroStore {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  isRunning: boolean;
  timeLeft: number;
  addSession: (session: Omit<PomodoroSession, 'id'>) => void;
  startSession: (type: 'focus' | 'short-break' | 'long-break', duration: number, label?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  clearSession: () => void;
  clearHistory: () => void;
  updateTimeLeft: (time: number) => void;
  getTodaysSessions: () => PomodoroSession[];
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      isRunning: false,
      timeLeft: 0,
      addSession: (session) => {
        const newSession: PomodoroSession = {
          ...session,
          id: crypto.randomUUID(),
        };
        set((state) => ({ sessions: [...state.sessions, newSession] }));
      },
      startSession: (type, duration, label) => {
        const session: PomodoroSession = {
          id: crypto.randomUUID(),
          type,
          duration,
          completed: false,
          startTime: new Date(),
          label,
        };
        set({ currentSession: session, isRunning: true, timeLeft: duration * 60 });
      },
      pauseSession: () => {
        set({ isRunning: false });
      },
      resumeSession: () => {
        set({ isRunning: true });
      },
      stopSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          const completedSession = {
            ...currentSession,
            completed: true,
            endTime: new Date(),
          };
          set((state) => ({
            sessions: [...state.sessions, completedSession],
            currentSession: null,
            isRunning: false,
            timeLeft: 0,
          }));
        }
      },
      clearSession: () => {
        set({
          currentSession: null,
          isRunning: false,
          timeLeft: 0,
        });
      },
      clearHistory: () => {
        set({ sessions: [] });
      },
      updateTimeLeft: (time) => {
        set({ timeLeft: time });
        if (time <= 0) {
          get().stopSession();
        }
      },
      getTodaysSessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return get().sessions.filter((session) => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= today && sessionDate < tomorrow;
        });
      },
    }),
    {
      name: 'pomodoro-storage',
    }
  )
);
