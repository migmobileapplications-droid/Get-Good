
import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Target, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function HabitCard({ habit, onEdit, onDelete }) {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${isDarkMode ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
              {habit.title}
            </h3>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${
              habit.importance === 'high' 
                ? 'bg-red-200 text-red-800' 
                : habit.importance === 'medium'
                ? 'bg-yellow-200 text-yellow-800'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {habit.importance} priority
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className={`${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(habit.id)}
            className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 line-clamp-3`}>
          {habit.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-3">
        {habit.target_value && (
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Target className="w-4 h-4" />
            <span>{habit.target_value} {habit.target_unit} {habit.target_frequency === 'daily' ? 'daily' : 'weekly'}</span>
          </div>
        )}

        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4" />
            {habit.due_time_type === 'exact' ? (
                <span>Due before {formatTime12Hour(habit.due_time)}</span>
            ) : (
                <span>Due by 11:59 PM</span>
            )}
        </div>

        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Flame className="w-4 h-4" />
          <span>
            Current: {habit.current_streak || 0} days
            {habit.best_streak > 0 && ` • Best: ${habit.best_streak} days`}
          </span>
        </div>
      </div>

      {/* Penalty Amount */}
      <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Miss penalty:</span>
          <span className={`font-bold text-lg ${
            habit.importance === 'high' ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
            habit.importance === 'medium' ? (isDarkMode ? 'text-yellow-500' : 'text-yellow-600') :
            (isDarkMode ? 'text-gray-400' : 'text-gray-600')
          }`}>
            ${habit.penalty_amount}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
