# Zeno Productivity App

Zeno is a modern, full-stack productivity app built with Next.js, Supabase, and TailwindCSS. It helps you manage your tasks, notes, resources, goals, and more—all in one place with user authentication and cloud storage.

## ✨ Features

- **User Authentication**: Secure login/signup with email/password or Google OAuth
- **Dashboard**: See your daily productivity stats, streaks, and motivational quotes
- **Tasks**: Add, complete, and manage daily tasks with priorities and tags
- **Pomodoro Timer**: Built-in timer with session tracking and streaks
- **Notes & Journal**: Write notes in a blog-style layout, preview, and organize by category and tags
- **Resources Vault**: Save and categorize links (websites, YouTube, etc.) with notes and tags
- **Goals**: Track your goals, progress, and deadlines
- **User Profiles**: Manage your profile and account settings
- **Data Persistence**: All data is securely stored in Supabase with Row Level Security
- **Responsive UI**: Beautiful, modern design with smooth animations and dark mode support

## 🛠️ Tech Stack
- [Next.js 14+](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for authentication and database
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account and project

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd zeno
npm install
```

### 2. Set up Supabase

1. **Create a Supabase project:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Fill in your project details

2. **Get your project credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Set up the database:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the schema from `supabase/schema.sql`

4. **Configure authentication (optional):**
   - Go to Authentication → Settings
   - Configure Google OAuth if you want social login

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes for data operations
│   ├── auth/              # Authentication pages (login, signup, etc.)
│   ├── profile/           # User profile pages
│   ├── notes/             # Notes and journal pages
│   ├── resources/         # Resources vault pages
│   └── ...               # Other app pages
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client configurations
│   └── utils.ts          # Utility functions
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── supabase/             # Database schema and migrations
│   └── schema.sql        # Complete database schema
├── middleware.ts         # Next.js middleware for auth
└── types/                # TypeScript type definitions
```

## 🔐 Authentication

The app supports multiple authentication methods:
- **Email/Password**: Traditional signup and login
- **Google OAuth**: Sign in with Google account
- **Password Reset**: Email-based password recovery

All routes are protected and require authentication except for the auth pages.

## �️ Database Schema

The app uses the following main tables:
- `profiles` - User profile information
- `tasks` - User tasks with priorities and tags
- `notes` - User notes with categories and mood tracking
- `resources` - Saved links and resources
- `goals` - User goals with progress tracking
- `pomodoro_sessions` - Timer session history
- `subjects` - Academic subjects
- `assignments` - Academic assignments
- `timetable_blocks` - Schedule blocks

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## 🎨 Customization

- **Categories**: Edit category enums in the database schema or add new ones
- **Theme**: Customize colors in `tailwind.config.js` or use shadcn/ui theming
- **Components**: All UI components are in the `components/` directory
- **Database**: Modify `supabase/schema.sql` and apply changes via Supabase dashboard

## 💡 Usage Tips

- **Dashboard**: Quick overview of your productivity metrics and recent activity
- **Pomodoro**: Click the timer to start focus sessions with automatic break reminders
- **Notes**: Use the blog-style layout to organize thoughts and ideas
- **Resources**: Save important links with tags and notes for easy retrieval
- **Goals**: Set deadlines and track progress on personal and professional goals

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform supporting Next.js 14+:
- Netlify
- Railway
- Render
- Your own server

## 🔧 Development

### Running Tests
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests (if configured)
```

### Code Quality
```bash
npm run lint        # ESLint checking
npm run type-check  # TypeScript checking
```

### Database Changes
1. Modify `supabase/schema.sql`
2. Apply changes in Supabase SQL Editor
3. Update TypeScript types if needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

