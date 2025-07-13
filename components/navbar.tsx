"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  CheckSquare,
  FolderOpen,
  Rocket,
  Map,
  Timer,
  BookOpen,
  Target,
  Moon,
  Sun,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/timetable", icon: Calendar, label: "Timetable" },
  { href: "/academic", icon: GraduationCap, label: "Academic" },
  { href: "/todos", icon: CheckSquare, label: "To-Do" },
  { href: "/resources", icon: FolderOpen, label: "Resources" },
  { href: "/projects", icon: Rocket, label: "Projects" },
  { href: "/roadmap", icon: Map, label: "Roadmap" },
  { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/goals", icon: Target, label: "Goals" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDark(theme === "dark" || (!theme && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <span className="font-bold text-sm">Z</span>
            </motion.div>
            <span className="font-bold text-lg">Zeno</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden lg:block">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle mobile menu</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className="h-8 w-8 p-0"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </motion.div>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
        >
          <div className="container px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center space-y-1 p-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
