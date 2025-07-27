-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in-progress', 'done')) DEFAULT 'pending',
  tags TEXT[] DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('personal', 'work', 'learning', 'ideas', 'meeting', 'journal', 'other')) DEFAULT 'personal',
  tags TEXT[] DEFAULT '{}',
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'sad', 'stressed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('website', 'youtube', 'link')) DEFAULT 'website',
  category TEXT CHECK (category IN ('ai', 'development', 'design', 'academic', 'work', 'personal', 'reference', 'tutorial', 'other')) DEFAULT 'reference',
  custom_category TEXT,
  url TEXT NOT NULL,
  youtube_id TEXT,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('personal', 'professional', 'health', 'learning', 'financial', 'other')) DEFAULT 'personal',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  deadline TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('focus', 'short-break', 'long-break')) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table (for academic features)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  instructor TEXT,
  credits INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in-progress', 'submitted', 'graded')) DEFAULT 'pending',
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetable_blocks table
CREATE TABLE IF NOT EXISTS public.timetable_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT, -- Format: HH:MM
  end_time TEXT,   -- Format: HH:MM
  day TEXT CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  date TIMESTAMP WITH TIME ZONE, -- For one-time events
  color TEXT DEFAULT '#3B82F6',
  type TEXT CHECK (type IN ('recurring', 'one-time', 'assignment')) DEFAULT 'recurring',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Users can view own resources" ON public.resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON public.resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON public.resources FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view own sessions" ON public.pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);

-- Subjects policies
CREATE POLICY "Users can view own subjects" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- Assignments policies
CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON public.assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignments" ON public.assignments FOR DELETE USING (auth.uid() = user_id);

-- Timetable blocks policies
CREATE POLICY "Users can view own timetable blocks" ON public.timetable_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own timetable blocks" ON public.timetable_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timetable blocks" ON public.timetable_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timetable blocks" ON public.timetable_blocks FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
