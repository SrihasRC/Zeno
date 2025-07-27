# Zeno Productivity App

Zeno is a modern, modular productivity app built with Next.js, Zustand, and TailwindCSS. It helps you manage your tasks, notes, resources, goals, and more—all in one place.

## ✨ Features

- **Dashboard**: See your daily productivity stats, streaks, and motivational quotes.
- **Tasks**: Add, complete, and manage daily tasks with priorities and tags.
- **Pomodoro Timer**: Built-in timer with session tracking and streaks.
- **Notes & Journal**: Write notes in a blog-style layout, preview, and organize by category and tags.
- **Resources Vault**: Save and categorize links (websites, YouTube, etc.) with notes and tags.
- **Goals**: Track your goals, progress, and deadlines.
- **Quick Actions**: Jump to timetable, academic, notes, or resources instantly.
- **Responsive UI**: Beautiful, modern design with smooth animations and dark mode support.

## 🛠️ Tech Stack
- [Next.js 14+](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

- `app/` — Main Next.js app pages (dashboard, notes, resources, journal, etc.)
- `store/` — Zustand stores for tasks, pomodoro, notes, resources, goals, etc.
- `components/` — UI components (navbar, cards, dialogs, etc.)
- `lib/` — Utility functions
- `public/` — Static assets and icons
- `types/` — TypeScript interfaces

## 📝 Customization
- **Add new categories**: Edit the category arrays in each page (e.g., `RESOURCE_CATEGORIES` in resources).
- **Change theme**: Tweak Tailwind config or use shadcn/ui theming.

## 💡 Tips
- Click the timer or quick actions on the dashboard to start a Pomodoro session or add a task instantly.
- Use the grid/list toggle in Resources Vault for your preferred view.
- Click on a note title to preview the full note in a dialog.

## 📦 Deployment
Deploy easily on [Vercel](https://vercel.com/) or any platform supporting Next.js 14+.

