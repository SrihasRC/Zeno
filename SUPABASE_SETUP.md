# Supabase Setup Guide for Zeno

## Prerequisites

1. Create a [Supabase](https://supabase.com) account
2. Create a new project in Supabase

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `zeno-productivity`
5. Enter a database password (save this!)
6. Select your region
7. Click "Create new project"

## Step 2: Set Up Environment Variables

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Project API Keys > anon public** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

3. Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Set Up Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, tasks, notes, resources, goals, pomodoro_sessions, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Automatic profile creation on user signup

## Step 4: Configure Authentication

1. In Supabase dashboard, go to **Authentication > Settings**
2. Configure the following:

### Email Templates (optional)
- Customize signup confirmation email
- Customize password reset email

### OAuth Providers (optional)
To enable Google OAuth:
1. Go to **Authentication > Providers**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourapp.com/auth/callback` (production)

## Step 5: Test the Application

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Create a new account or sign in
5. Your profile should be automatically created in the database

## Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **User Isolation**: Users can only access their own data
- **Automatic Profile Creation**: Profiles are created automatically on signup
- **Session Management**: Handled by Supabase Auth with secure cookies

## Database Tables Created

- `profiles` - User profile information
- `tasks` - Todo items and task management
- `notes` - Note-taking system with categories and tags
- `resources` - Link and resource management
- `goals` - Goal tracking with progress
- `pomodoro_sessions` - Timer session tracking
- `subjects` - Academic subjects
- `assignments` - Academic assignments
- `timetable_blocks` - Schedule management

## API Endpoints Available

- `GET/POST /api/tasks` - Task management
- `GET/POST /api/notes` - Note management  
- `GET/POST /api/resources` - Resource management
- `GET/POST /api/goals` - Goal management
- `GET/POST /api/pomodoro` - Pomodoro session tracking
- `GET/PUT /api/profile` - User profile management
- `POST /api/auth/logout` - User logout

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Run the schema.sql file
3. **"Unauthorized"**: Check RLS policies are set up correctly
4. **OAuth not working**: Verify redirect URLs and OAuth credentials

### Checking Database:
1. Go to **Table Editor** in Supabase dashboard
2. Verify all tables are created
3. Check that RLS is enabled on all tables
4. Test inserting data manually

## Production Deployment

1. Update environment variables with production Supabase URL
2. Add production domain to auth redirect URLs
3. Enable email confirmations in production
4. Consider setting up custom SMTP for emails

That's it! Your Zeno productivity app should now be fully connected to Supabase with authentication and database persistence.
