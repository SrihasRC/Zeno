import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimetableBlock, Subject, Assignment } from '@/types';

interface TimetableStore {
  blocks: TimetableBlock[];
  subjects: Subject[];
  assignments: Assignment[];
  addBlock: (block: Omit<TimetableBlock, 'id' | 'createdAt'>) => void;
  updateBlock: (id: string, updates: Partial<TimetableBlock>) => void;
  deleteBlock: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getBlocksForDay: (day: TimetableBlock['day']) => TimetableBlock[];
  getBlocksForWeek: () => Record<TimetableBlock['day'], TimetableBlock[]>;
  getBlocksForMonth: (month: number, year: number) => TimetableBlock[];
  getAssignmentsForSubject: (subjectId: string) => Assignment[];
}

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      blocks: [],
      subjects: [],
      assignments: [],
      addBlock: (block) => {
        const newBlock: TimetableBlock = {
          ...block,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({ blocks: [...state.blocks, newBlock] }));
      },
      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },
      deleteBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id),
        }));
      },
      addSubject: (subject) => {
        const newSubject: Subject = {
          ...subject,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({ subjects: [...state.subjects, newSubject] }));
      },
      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, ...updates } : subject
          ),
        }));
      },
      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== id),
          assignments: state.assignments.filter((assignment) => assignment.subjectId !== id),
        }));
      },
      addAssignment: (assignment) => {
        const newAssignment: Assignment = {
          ...assignment,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ assignments: [...state.assignments, newAssignment] }));
      },
      updateAssignment: (id, updates) => {
        set((state) => ({
          assignments: state.assignments.map((assignment) =>
            assignment.id === id ? { ...assignment, ...updates, updatedAt: new Date() } : assignment
          ),
        }));
      },
      deleteAssignment: (id) => {
        set((state) => ({
          assignments: state.assignments.filter((assignment) => assignment.id !== id),
        }));
      },
      getBlocksForDay: (day) => {
        return get().blocks
          .filter((block) => block.day === day && block.type === 'recurring')
          .sort((a, b) => {
            const aTime = a.startTime || '00:00';
            const bTime = b.startTime || '00:00';
            return aTime.localeCompare(bTime);
          });
      },
      getBlocksForWeek: () => {
        const blocks = get().blocks;
        const days: TimetableBlock['day'][] = [
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
        ];
        
        return days.reduce((acc, day) => {
          acc[day] = blocks
            .filter((block) => block.day === day && block.type === 'recurring')
            .sort((a, b) => {
              const aTime = a.startTime || '00:00';
              const bTime = b.startTime || '00:00';
              return aTime.localeCompare(bTime);
            });
          return acc;
        }, {} as Record<TimetableBlock['day'], TimetableBlock[]>);
      },
      getBlocksForMonth: (month, year) => {
        return get().blocks.filter((block) => {
          if (block.type === 'one-time' && block.date) {
            // Handle both Date objects and date strings
            const blockDate = block.date instanceof Date ? block.date : new Date(block.date);
            return blockDate.getMonth() === month && blockDate.getFullYear() === year;
          }
          return false;
        });
      },
      getAssignmentsForSubject: (subjectId) => {
        return get().assignments
          .filter((assignment) => assignment.subjectId === subjectId)
          .sort((a, b) => {
            // Handle both Date objects and date strings
            const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
            const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
            return dateA.getTime() - dateB.getTime();
          });
      },
    }),
    {
      name: 'timetable-storage',
    }
  )
);
