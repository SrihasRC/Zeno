"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Zap, Clock, Target } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/todos", label: "Tasks" },
  { href: "/pomodoro", label: "Focus" },
  { href: "/goals", label: "Goals" },
];

const stats = [
  { icon: Zap, label: "Productivity", value: "High" },
  { icon: Clock, label: "Today", value: "Active" },
  { icon: Target, label: "Goals", value: "On Track" },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="font-bold text-xs">Z</span>
              </div>
              <span className="font-bold text-lg">Zeno</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Your personal productivity hub. Built for focus, designed for growth.
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500" />
              <span>for productivity</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground">Quick Access</h3>
            <div className="grid grid-cols-2 gap-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground">Status</h3>
            <div className="space-y-1">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <Icon className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{stat.label}:</span>
                    <span className="font-medium text-foreground">{stat.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
        <div className="mt-6 pt-4 border-t border-border/40 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-1 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © 2025 Zeno. Personal productivity dashboard.
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
    </motion.footer>
  );
}
