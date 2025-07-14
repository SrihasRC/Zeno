import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '@/types';

interface NotesStore {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNote: (id: string) => void;
  getNotesByCategory: (category: Note['category']) => Note[];
  getNotesByTag: (tag: string) => Note[];
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
      },
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
          ),
        }));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      getNotesByCategory: (category) => {
        return get().notes.filter((note) => note.category === category);
      },
      getNotesByTag: (tag) => {
        return get().notes.filter((note) => note.tags.includes(tag));
      },
    }),
    {
      name: 'notes-storage',
    }
  )
);
