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
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">Z</span>
              </div>
              <span className="font-bold text-xl">Zeno</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your personal productivity hub. Built for focus, designed for growth.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for productivity</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Status</h3>
            <div className="space-y-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{stat.label}:</span>
                    <span className="font-medium">{stat.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © 2025 Zeno. Personal productivity dashboard.
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
