export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          grade: string | null
          id: string
          priority: "low" | "medium" | "high"
          status: "pending" | "in-progress" | "submitted" | "graded"
          subject_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          grade?: string | null
          id?: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in-progress" | "submitted" | "graded"
          subject_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          grade?: string | null
          id?: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in-progress" | "submitted" | "graded"
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          category: "personal" | "professional" | "health" | "learning" | "financial" | "other"
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean
          priority: "low" | "medium" | "high"
          progress: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: "personal" | "professional" | "health" | "learning" | "financial" | "other"
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: "low" | "medium" | "high"
          progress?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: "personal" | "professional" | "health" | "learning" | "financial" | "other"
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: "low" | "medium" | "high"
          progress?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          category: "personal" | "work" | "learning" | "ideas" | "meeting" | "journal" | "other"
          content: string
          created_at: string
          id: string
          mood: "excellent" | "good" | "neutral" | "sad" | "stressed" | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: "personal" | "work" | "learning" | "ideas" | "meeting" | "journal" | "other"
          content: string
          created_at?: string
          id?: string
          mood?: "excellent" | "good" | "neutral" | "sad" | "stressed" | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: "personal" | "work" | "learning" | "ideas" | "meeting" | "journal" | "other"
          content?: string
          created_at?: string
          id?: string
          mood?: "excellent" | "good" | "neutral" | "sad" | "stressed" | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pomodoro_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration: number
          end_time: string | null
          id: string
          label: string | null
          start_time: string
          type: "focus" | "short-break" | "long-break"
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration: number
          end_time?: string | null
          id?: string
          label?: string | null
          start_time: string
          type: "focus" | "short-break" | "long-break"
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          label?: string | null
          start_time?: string
          type?: "focus" | "short-break" | "long-break"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          category: "ai" | "development" | "design" | "academic" | "work" | "personal" | "reference" | "tutorial" | "other"
          created_at: string
          custom_category: string | null
          description: string | null
          id: string
          notes: string
          tags: string[]
          title: string
          type: "website" | "youtube" | "link"
          updated_at: string
          url: string
          user_id: string
          youtube_id: string | null
        }
        Insert: {
          category?: "ai" | "development" | "design" | "academic" | "work" | "personal" | "reference" | "tutorial" | "other"
          created_at?: string
          custom_category?: string | null
          description?: string | null
          id?: string
          notes?: string
          tags?: string[]
          title: string
          type?: "website" | "youtube" | "link"
          updated_at?: string
          url: string
          user_id: string
          youtube_id?: string | null
        }
        Update: {
          category?: "ai" | "development" | "design" | "academic" | "work" | "personal" | "reference" | "tutorial" | "other"
          created_at?: string
          custom_category?: string | null
          description?: string | null
          id?: string
          notes?: string
          tags?: string[]
          title?: string
          type?: "website" | "youtube" | "link"
          updated_at?: string
          url?: string
          user_id?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subjects: {
        Row: {
          code: string
          color: string
          created_at: string
          credits: number | null
          id: string
          instructor: string | null
          name: string
          user_id: string
        }
        Insert: {
          code: string
          color?: string
          created_at?: string
          credits?: number | null
          id?: string
          instructor?: string | null
          name: string
          user_id: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          credits?: number | null
          id?: string
          instructor?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: "low" | "medium" | "high"
          status: "pending" | "in-progress" | "done"
          subtasks: Json
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in-progress" | "done"
          subtasks?: Json
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in-progress" | "done"
          subtasks?: Json
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      timetable_blocks: {
        Row: {
          assignment_id: string | null
          color: string
          created_at: string
          date: string | null
          day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | null
          description: string | null
          end_time: string | null
          id: string
          start_time: string | null
          subject_id: string | null
          title: string
          type: "recurring" | "one-time" | "assignment"
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          color?: string
          created_at?: string
          date?: string | null
          day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          subject_id?: string | null
          title: string
          type?: "recurring" | "one-time" | "assignment"
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          color?: string
          created_at?: string
          date?: string | null
          day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          subject_id?: string | null
          title?: string
          type?: "recurring" | "one-time" | "assignment"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_blocks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_blocks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
