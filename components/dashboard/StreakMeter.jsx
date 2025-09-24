
import React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Target } from "lucide-react";

export default function StreakMeter({ user }) {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const currentStreak = user?.current_streak || 0;
  const bestStreak = user?.best_streak || 0;
  const progress = bestStreak > 0 ? (currentStreak / bestStreak) * 100 : 100;

  const streakMilestones = [7, 14, 30, 60, 100];
  const nextMilestone = streakMilestones.find(m => m > currentStreak) || 365;

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-3xl p-6 md:p-8 shadow-xl mx-2 md:mx-0`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Streak Meter</h3>
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2"
        >
          {currentStreak}
        </motion.div>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>day{currentStreak !== 1 ? 's' : ''} streak</p>
      </div>

      {/* Progress to Best Streak */}
      {bestStreak > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress to Personal Best</span>
            <span className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} font-bold`}>{Math.round(progress)}%</span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-3 overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
            Best streak: {bestStreak} days
          </p>
        </div>
      )}

      {/* Next Milestone */}
      <div className={`p-4 ${isDarkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-100 border-orange-300'} border rounded-xl`}>
        <div className="flex items-center gap-3 mb-2">
          <Target className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          <span className={`font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>Next Goal</span>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
          {nextMilestone - currentStreak} more days to reach {nextMilestone}-day milestone!
        </p>
      </div>

      {/* Achievement Badges */}
      <div className="mt-6">
        <h4 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Streak Milestones</h4>
        <div className="flex flex-wrap gap-2">
          {streakMilestones.map(milestone => (
            <div
              key={milestone}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentStreak >= milestone || bestStreak >= milestone
                  ? 'bg-orange-400 text-orange-900'
                  : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {milestone}d
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
