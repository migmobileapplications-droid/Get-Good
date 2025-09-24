
import React from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, Calendar, Award } from "lucide-react";

export default function HabitStats({ habits, user }) {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to dark mode if no theme is saved, or if it's explicitly 'dark'
    return savedTheme ? savedTheme === 'dark' : true; 
  });

  const activeHabits = habits.filter(h => h.is_active).length;
  const highImportanceHabits = habits.filter(h => h.importance === 'high').length;
  const avgPenalty = habits.length > 0 ? 
    (habits.reduce((sum, h) => sum + h.penalty_amount, 0) / habits.length).toFixed(2) : 0;

  const stats = [
    {
      icon: BarChart,
      label: "Active Habits",
      value: activeHabits,
      color: isDarkMode ? "text-blue-400" : "text-blue-600",
      bg: isDarkMode ? "bg-blue-900/50" : "bg-blue-100"
    },
    {
      icon: Award,
      label: "High Priority",
      value: highImportanceHabits,
      color: isDarkMode ? "text-red-400" : "text-red-600",
      bg: isDarkMode ? "bg-red-900/50" : "bg-red-100"
    },
    {
      icon: TrendingUp,
      label: "Avg Penalty",
      value: `$${avgPenalty}`,
      color: isDarkMode ? "text-yellow-400" : "text-yellow-600",
      bg: isDarkMode ? "bg-yellow-900/50" : "bg-yellow-100"
    },
    {
      icon: Calendar,
      label: "Best Streak",
      value: `${user?.best_streak || 0} days`,
      color: isDarkMode ? "text-green-400" : "text-green-600",
      bg: isDarkMode ? "bg-green-900/50" : "bg-green-100"
    }
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl mx-2 md:mx-0`}>
      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Habit Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex flex-col sm:flex-row items-center justify-between p-3 md:p-4 rounded-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 sm:mb-0">
              <div className={`p-1.5 md:p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center sm:text-left`}>{stat.label}</span>
            </div>
            <span className={`font-bold text-sm md:text-base ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
