# Zeno Setup Guide

Follow these steps to set up Zeno with Supabase authentication and database.

## 🚀 Quick Setup

### Step 1: Supabase Project Setup

1. **Create a Supabase account**: Go to [https://supabase.com](https://supabase.com) and sign up
2. **Create a new project**: Click "New Project" and fill in the details
3. **Wait for setup**: Your project will take a few minutes to initialize

### Step 2: Get Your Credentials

1. **Go to your project dashboard**
2. **Navigate to Settings → API**
3. **Copy the following values**:
   - Project URL (looks like: `https://xyzcompany.supabase.co`)
   - anon/public key (starts with `eyJhbGci...`)

### Step 3: Set Up Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and replace the placeholder values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### Step 4: Set Up the Database

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire contents** of `supabase/schema.sql`
3. **Paste and run** the SQL to create all tables and security policies

### Step 5: Configure Authentication (Optional)

If you want Google OAuth login:

1. **Go to Authentication → Settings** in Supabase
2. **Enable Google provider**
3. **Add your domain** to authorized redirect URLs
4. **Configure OAuth credentials** (follow Supabase docs)

### Step 6: Start the Application

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and you should see the login page!

## 🔧 Troubleshooting

### "Your project's URL and Key are required"
- Check that your `.env.local` file exists and has the correct values
- Make sure there are no extra spaces or quotes around the values
- Restart your development server after adding environment variables

### "Failed to fetch" errors
- Verify your Supabase project URL is correct
- Check that your anon key is copied correctly
- Ensure your Supabase project is running (not paused)

### Database/RLS errors
- Make sure you've run the complete `schema.sql` file
- Check that RLS policies are enabled on all tables
- Verify that the `profiles` table has a trigger for new user creation

### OAuth not working
- Check your redirect URLs in Supabase Auth settings
- Ensure you've configured the OAuth provider correctly
- Make sure your domain is added to authorized domains

## 📝 Database Schema Overview

The app creates these main tables:
- `profiles` - User profile information
- `tasks` - To-do items with priorities and tags
- `notes` - Journal entries and notes
- `resources` - Saved links and resources
- `goals` - Goal tracking with progress
- `pomodoro_sessions` - Timer session history
- `subjects` - Academic subjects
- `assignments` - Academic tasks
- `timetable_blocks` - Schedule/calendar items

All tables include Row Level Security (RLS) to ensure data privacy.

## 🎯 Next Steps

Once everything is set up:
1. **Create an account** using the signup page
2. **Explore the dashboard** to see your productivity overview
3. **Add some tasks** to get started
4. **Try the Pomodoro timer** for focused work sessions
5. **Create notes** to capture your thoughts
6. **Save resources** for future reference

## 🆘 Need Help?

- Check the [Supabase documentation](https://supabase.com/docs)
- Open an issue on GitHub if you encounter problems
- Make sure you're using Node.js 18+ and the latest npm version

Happy productivity! 🚀
