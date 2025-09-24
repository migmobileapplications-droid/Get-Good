
import React, { useState, useEffect } from "react";
import { Habit, HabitLog, User } from "@/api/entities";
import { motion } from "framer-motion";
import { Flame, Target, TrendingUp, CalendarDays, LineChart } from "lucide-react";
import { format, subDays, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, startOfWeek, startOfYear } from "date-fns";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

const processData = (logs, period) => {
  let startDate;
  const endDate = new Date();
  switch (period) {
    case 'weekly':
      startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // Monday as start of week
      break;
    case 'monthly':
      startDate = startOfMonth(endDate);
      break;
    case 'yearly':
      startDate = startOfYear(endDate);
      break;
    default:
      startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // Default to weekly
  }

  const interval = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Filter logs to only include those within the selected period for processing
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });

  return interval.map(day => {
    const dayLogs = filteredLogs.filter(log => isSameDay(new Date(log.date), day));
    return {
      date: format(day, 'MMM d'), // Format date for display on XAxis
      completed: dayLogs.filter(log => log.completed).length,
      failed: dayLogs.filter(log => !log.completed).length,
    };
  });
};


export default function StreaksPage() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [view, setView] = useState("monthly"); // For the chart

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      const userHabits = await Habit.filter({ created_by: userData.email, is_active: true });
      
      // Fetch all logs for the chart, but we can also use them for streaks
      const allLogs = await HabitLog.filter({ created_by: userData.email }, '-date', 365);
      
      setUser(userData);
      setHabits(userHabits);
      setLogs(allLogs);
    } catch (error) {
      console.error("Error loading streaks data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHabitStreak = (habitId) => {
    const habitLogs = logs.filter(log => log.habit_id === habitId).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i);
      const dayLog = habitLogs.find(log => isSameDay(new Date(log.date), checkDate));
      
      if (dayLog && dayLog.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getMonthlyCompletion = (habitId) => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start, end });

    const habitLogs = logs.filter(log => log.habit_id === habitId);
    
    const completedCount = daysInMonth.filter(day => 
      habitLogs.some(log => isSameDay(new Date(log.date), day) && log.completed)
    ).length;

    // We only count against days the habit has existed
    const habitStartDate = habits.find(h => h.id === habitId)?.start_date;
    const daysSinceStart = daysInMonth.filter(day => !habitStartDate || day >= new Date(habitStartDate)).length;

    if (daysSinceStart === 0) return 0;
    return Math.round((completedCount / daysSinceStart) * 100);
  };

  const chartData = processData(logs, view);
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "#9ca3af" : "#4b5563";
  const tooltipBg = isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";
  const tooltipBorder = isDarkMode ? "#4b5563" : "#e5e7eb";

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 animate-pulse`}>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-6 rounded w-1/3 mb-4`}></div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-4 rounded w-2/3`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Progress & Streaks
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Visualize your consistency and track your progress</p>
      </div>
      
      {/* Progress Chart */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
            <LineChart className="w-5 h-5"/>
            Habit Performance
        </h2>
        <div className={`flex gap-2 p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg`}>
          <Button onClick={() => setView('weekly')} variant={view === 'weekly' ? 'default' : 'ghost'} className={view === 'weekly' ? 'bg-green-600 text-white' : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-300'}`}>Weekly</Button>
          <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'ghost'} className={view === 'monthly' ? 'bg-green-600 text-white' : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-300'}`}>Monthly</Button>
          <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'ghost'} className={view === 'yearly' ? 'bg-green-600 text-white' : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-300'}`}>Yearly</Button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-xl mb-12`}
      >
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={textColor} fontSize={12} />
                <YAxis allowDecimals={false} stroke={textColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    backdropFilter: "blur(4px)",
                    borderRadius: "0.75rem",
                    border: `1px solid ${tooltipBorder}`,
                    color: isDarkMode ? "#f3f4f6" : "#1f2937"
                  }}
                />
                <Legend wrapperStyle={{color: textColor, paddingTop: '10px'}}/>
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Completed" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Failed" />
              </RechartsLineChart>
            </ResponsiveContainer>
        </div>
      </motion.div>


      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Current Streak</span>
          </div>
          <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.current_streak || 0}</p>
          <p className="text-xs text-gray-500">days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-500" />
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Best Streak</span>
          </div>
          <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.best_streak || 0}</p>
          <p className="text-xs text-gray-500">days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
        >
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-6 h-6 text-green-500" />
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Active Habits</span>
          </div>
          <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{habits.length}</p>
          <p className="text-xs text-gray-500">tracking</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Completed</span>
          </div>
          <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.total_habits_completed || 0}</p>
          <p className="text-xs text-gray-500">total</p>
        </motion.div>
      </div>

      {/* Individual Habit Streaks */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl`}>
            <Flame className={`w-20 h-20 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>No active habits</h3>
            <p className="text-gray-500">Create some habits to see your streaks!</p>
          </div>
        ) : (
          habits.map((habit, index) => {
            const currentStreak = calculateHabitStreak(habit.id);
            const monthlyCompletion = getMonthlyCompletion(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{habit.title}</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm line-clamp-1`}>{habit.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-center">
                    <div className="w-20">
                      <div className={`text-2xl font-black ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{currentStreak}</div>
                      <div className="text-xs text-gray-500">Current</div>
                    </div>
                     <div className="w-20">
                      <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{habit.best_streak || 0}</div>
                      <div className="text-xs text-gray-500">Best</div>
                    </div>
                  </div>
                </div>

                {/* Monthly Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month's Progress</span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{monthlyCompletion}%</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <motion.div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${monthlyCompletion}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
