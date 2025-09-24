import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HabitLog } from "@/api/entities";
import { User } from "@/api/entities";
import { addMinutes, isAfter, isSameDay } from "date-fns";
import { 
  CheckCircle, 
  Circle, 
  Plus,
  Target,
  Clock,
  PauseCircle,
  AlertOctagon,
  XCircle,
} from "lucide-react";

const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function TodayHabits({ habits, logs, onUpdate, user }) {
  const [completingHabit, setCompletingHabit] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const handleToggleHabit = async (habit) => {
    setCompletingHabit(habit.id);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingLog = logs.find(log => log.habit_id === habit.id);
      
      const wasCompleted = existingLog && existingLog.completed;
      const isUncompletingAction = wasCompleted; 
      
      if (isUncompletingAction) {
        let dueTime;
        const now = new Date();

        if (habit.due_time_type === 'exact' && habit.due_time) {
            const [hours, minutes] = habit.due_time.split(':').map(Number);
            dueTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        } else {
            dueTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        
        const penaltyWindowEnd = addMinutes(dueTime, 30);

        if (isAfter(now, penaltyWindowEnd)) {
            alert("This habit is past its penalty window and can no longer be uncompleted for today.");
            setCompletingHabit(null);
            return;
        }
      }

      let updatedLogs;
      const willBeCompleted = !existingLog || !existingLog.completed; 

      if (existingLog) {
        await HabitLog.update(existingLog.id, {
          completed: willBeCompleted,
          completion_time: willBeCompleted ? new Date().toISOString() : null
        });
        updatedLogs = logs.map(log => 
          log.id === existingLog.id 
            ? { ...log, completed: willBeCompleted, completion_time: willBeCompleted ? new Date().toISOString() : null } 
            : log
        );
      } else {
        const newLog = await HabitLog.create({
          habit_id: habit.id,
          date: today,
          completed: true,
          completion_time: new Date().toISOString()
        });
        updatedLogs = [...logs, newLog];
      }

      onUpdate(updatedLogs, user);
    } catch (error) {
      console.error("Error updating habit:", error);
    } finally {
      setCompletingHabit(null);
    }
  };

  // **FIXED: Proper habit filtering logic**
  const getVisibleHabitsForToday = (allHabits) => {
    const now = new Date();
    return allHabits.filter(habit => {
      // If habit was created today and has a past due time, hide it until tomorrow
      const wasCreatedToday = isSameDay(new Date(habit.created_date), now);
      
      if (wasCreatedToday && habit.due_time_type === 'exact' && habit.due_time) {
        const [dueHours, dueMinutes] = habit.due_time.split(':').map(Number);
        const dueTimeToday = new Date();
        dueTimeToday.setHours(dueHours, dueMinutes, 0, 0);
        
        // Hide if created today and the due time has already passed
        if (now > dueTimeToday) {
          return false; // This habit will be shown tomorrow
        }
      }
      
      return true; // Show all other habits
    });
  };

  // **FIXED: Proper status logic**
  const getHabitDisplayStatus = (habit) => {
    const now = new Date();
    const log = logs.find(l => l.habit_id === habit.id);
    
    // COMPLETED (Green) - has log and completed = true
    if (log && log.completed === true) {
      return {
        status: 'completed',
        isActionable: false,
        color: 'green',
        badge: 'DONE',
        icon: 'checkCircle'
      };
    }
    
    // MISSED (Red) - has log and penalty_charged > 0
    if (log && log.penalty_charged && log.penalty_charged > 0) {
      return {
        status: 'missed',
        isActionable: false,
        color: 'red', 
        badge: 'MISSED',
        icon: 'xCircle'
      };
    }
    
    // Calculate due time for grace period check
    let dueTime;
    if (habit.due_time_type === 'exact' && habit.due_time) {
      const [hours, minutes] = habit.due_time.split(':').map(Number);
      dueTime = new Date();
      dueTime.setHours(hours, minutes, 0, 0);
    } else {
      dueTime = new Date();
      dueTime.setHours(23, 59, 59, 999);
    }
    
    const gracePeriodEnd = new Date(dueTime);
    gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + 3); // 3 minute grace period
    
    // GRACE PERIOD (Yellow) - past due time but before penalty charge
    if (now > dueTime && now <= gracePeriodEnd) {
      return {
        status: 'grace',
        isActionable: true,
        color: 'yellow',
        badge: 'GRACE PERIOD (3 MIN)',
        icon: 'circle'
      };
    }
    
    // REGULAR (Gray) - not yet at due time
    return {
      status: 'pending',
      isActionable: true,
      color: 'gray',
      badge: null,
      icon: 'circle'
    };
  };

  const visibleHabits = getVisibleHabitsForToday(habits);
  const totalHabits = visibleHabits.length;
  
  const completedCount = visibleHabits.filter(h => {
    const status = getHabitDisplayStatus(h);
    return status.status === 'completed';
  }).length;
  
  const completionPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl mx-2 md:mx-0`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg md:text-xl lg:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Today's Habits</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.penalties_paused ? 'Accountability Paused' : `${completedCount} of ${totalHabits} completed`}
            </p>
          </div>
        </div>
        <Link
          to={createPageUrl("Habits")}
          className={`${isDarkMode ? 'text-blue-500 hover:text-blue-400' : 'text-blue-600 hover:text-blue-500'} font-bold text-sm md:text-base lg:text-lg transition-colors duration-300 flex-shrink-0`}
        >
          Manage →
        </Link>
      </div>

      {user?.penalties_paused ? (
        <div className="text-center py-12">
          <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <PauseCircle className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          <h4 className={`text-xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Accountability is Paused</h4>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-6`}>Resume accountability in Settings to continue.</p>
          <Link
            to={createPageUrl("Settings")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go to Settings
          </Link>
        </div>
      ) : visibleHabits.length === 0 ? (
        <div className="text-center py-12">
          <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Plus className={`w-10 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h4 className={`text-xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>No habits due today!</h4>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-6`}>Start building better habits.</p>
          <Link
            to={createPageUrl("Habits")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Create First Habit
          </Link>
        </div>
      ) : (
        <>
          {completedCount === totalHabits && totalHabits > 0 && (
            <div className="text-center py-6 mb-6">
              <div className="inline-flex items-center gap-3 bg-green-900/50 border border-green-700 text-green-300 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All habits completed! 🎉</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {visibleHabits.map((habit, index) => {
              const habitStatus = getHabitDisplayStatus(habit);
              const isCompleting = completingHabit === habit.id;
              
              // Color classes based on status
              const colorClasses = {
                green: 'bg-green-900/30 border-green-700/50',
                red: 'bg-red-900/30 border-red-700/50', 
                yellow: 'bg-yellow-900/30 border-yellow-700/50',
                gray: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              };
              
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 ${colorClasses[habitStatus.color]}`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => habitStatus.isActionable && handleToggleHabit(habit)}
                      disabled={isCompleting || !habitStatus.isActionable}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                        habitStatus.status === 'missed'
                          ? 'bg-red-800/50 cursor-not-allowed'
                          : habitStatus.status === 'completed'
                          ? 'bg-green-600 cursor-pointer'
                          : habitStatus.isActionable
                          ? isDarkMode ? 'bg-gray-700 border-2 border-gray-600 hover:border-blue-500 cursor-pointer' : 'bg-white border-2 border-gray-300 hover:border-blue-500 cursor-pointer'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isCompleting ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : habitStatus.icon === 'xCircle' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : habitStatus.icon === 'checkCircle' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={`font-bold text-base md:text-lg truncate ${
                          habitStatus.status === 'missed'
                            ? 'line-through text-red-400'
                            : habitStatus.status === 'completed'
                            ? 'text-green-400'
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {habit.title}
                        </h4>
                        {habit.importance !== 'low' && (
                          <div className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                            habit.importance === 'high' 
                              ? 'bg-red-200 text-red-800' 
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {habit.importance}
                          </div>
                        )}
                        {habitStatus.badge && (
                          <div className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                            habitStatus.status === 'missed' 
                              ? 'bg-red-200 text-red-800'
                              : habitStatus.status === 'completed'
                              ? 'bg-green-200 text-green-800'
                              : habitStatus.status === 'grace'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {habitStatus.badge}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {habit.target_value && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{habit.target_value} {habit.target_unit}</span>
                          </div>
                        )}
                        {habit.due_time && habit.due_time_type === 'exact' && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Due {formatTime12Hour(habit.due_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        habit.importance === 'high' ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
                        habit.importance === 'medium' ? (isDarkMode ? 'text-yellow-500' : 'text-yellow-600') :
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        ${habit.penalty_amount}
                      </div>
                      <div className={`text-xs ${
                        habitStatus.status === 'missed'
                          ? 'text-red-500 font-bold' 
                          : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {habitStatus.status === 'missed' ? 'charged' : 'penalty'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!user?.penalties_paused && totalHabits > 0 && (
        <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Daily Progress</span>
            <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-bold`}>
              {completionPercentage}%
            </span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-3 overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}