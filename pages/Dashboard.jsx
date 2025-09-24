
import React, { useState, useEffect } from "react";
import { User, Habit, HabitLog } from "@/api/entities";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Target,
  Flame,
  CheckCircle,
  TrendingUp,
  BarChart,
  Award,
  User as UserIcon,
  Plus,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";

import TodayHabits from "../components/dashboard/TodayHabits";
import HabitStats from "../components/dashboard/HabitStats";
import StreakMeter from "../components/dashboard/StreakMeter";

// Helper function to check if two Date objects represent the same day
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    loadDashboardData();
    processInvite();
  }, []);

  const processInvite = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (!inviteCode) return;

    try {
        const currentUser = await User.me();
        // Only process if user hasn't been credited for an invite before
        if (currentUser && !currentUser.invited_by_code) {
            const invitingUsers = await User.filter({ invite_code: inviteCode });
            if (invitingUsers.length > 0) {
                const invitingUser = invitingUsers[0];

                // Check if inviting user has reached their yearly limit
                if ((invitingUser.invite_credits_earned || 0) < 25) {
                    // Give credit to the inviting user
                    await User.update(invitingUser.id, {
                        credits: (invitingUser.credits || 0) + 5,
                        invited_friends_count: (invitingUser.invited_friends_count || 0) + 1,
                        invite_credits_earned: (invitingUser.invite_credits_earned || 0) + 5
                    });
                    
                    // Mark current user as invited
                    await User.updateMyUserData({ invited_by_code: inviteCode });

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    console.log(`Successfully applied invite from user ${invitingUser.email}`);
                }
            }
        }
    } catch(e) {
        console.error("Error processing invite code: ", e);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();

      // NEW: Automatically set user's timezone if it's not already set
      if (userData && !userData.timezone) {
        try {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (browserTimezone) {
                await User.updateMyUserData({ timezone: browserTimezone });
                userData.timezone = browserTimezone; // Update local copy for immediate use
                console.log(`Successfully set user timezone to: ${browserTimezone}`);
            }
        } catch (e) {
            console.error("Could not set user timezone:", e);
        }
      }

      const userHabits = await Habit.filter({ created_by: userData.email, is_active: true });

      // Filter habits that are due today
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const todayString = today.toISOString().split('T')[0];
      
      const habitsToday = userHabits.filter(habit => {
        if (habit.target_frequency === 'daily') {
          return true;
        } else if (habit.target_frequency === 'weekly') {
          return habit.due_day_of_week === dayOfWeek;
        }
        return false;
      });

      // Get ALL logs for today (including penalized ones)
      const logs = await HabitLog.filter({ created_by: userData.email, date: todayString });
      console.log('Today\'s habit logs:', logs); // Debug log

      setUser(userData);
      setHabits(habitsToday);
      setTodayLogs(logs);

      // Show setup prompt if user hasn't completed setup and has no habits
      if (!userData.setup_completed && userHabits.length === 0) {
        setShowSetupPrompt(true);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHabitUpdate = (updatedLogs) => {
    setTodayLogs(updatedLogs);
    // User data is now updated by server-side processes, so we only need to refresh logs.
    // For immediate feedback on things like XP, a full refresh is best.
    loadDashboardData();
  };

  // Re-load data when returning from other pages to ensure counts are accurate
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} p-4`}>
        <div className="max-w-md mx-auto space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 animate-pulse border`}>
              <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-4`}></div>
              <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // **DEFINITIVE FIX**: This logic correctly identifies habits for today's progress total.
  // It ONLY excludes habits that were newly created today and are already past their due time.
  // It correctly INCLUDES all other scheduled habits, even if they are missed.
  const getTodaysHabitsForProgress = (allHabits) => {
    const now = new Date();
    return allHabits.filter(habit => {
        const wasCreatedToday = isSameDay(new Date(habit.created_date), now);
        
        if (wasCreatedToday && habit.due_time_type === 'exact' && habit.due_time) {
            const [dueHours, dueMinutes] = habit.due_time.split(':').map(Number);
            const dueTimeToday = new Date();
            dueTimeToday.setHours(dueHours, dueMinutes, 0, 0);
            if (now > dueTimeToday) {
                return false; // Exclude: created today and already past due.
            }
        }
        return true; // Include all other habits for today.
    });
  };

  const habitsForProgress = getTodaysHabitsForProgress(habits);
  const totalHabits = habitsForProgress.length;

  const completedToday = habitsForProgress.filter(habit => {
    const log = todayLogs.find(l => l.habit_id === habit.id);
    return log && log.completed === true;
  }).length;
  
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Calculate XP needed for next level (5% more each level)
  const currentLevel = user?.level || 1;
  const xpForNextLevel = Math.floor(100 * Math.pow(1.05, currentLevel - 1));
  const currentXP = user?.xp || 0;
  const xpProgress = xpForNextLevel > 0 ? Math.floor((currentXP % xpForNextLevel) / xpForNextLevel * 100) : 0;


  const stats = [
    {
      title: "Today's Progress",
      value: `${completedToday}/${totalHabits}`, // Correctly reflects missed habits (e.g., 4/5)
      icon: Target,
      color: "from-blue-500 to-blue-600",
      trend: `${completionRate}% complete` // Correctly shows percentage (e.g., 80%)
    },
    {
      title: "Current Streak",
      value: `${user?.current_streak || 0}`,
      icon: Flame,
      color: "from-orange-500 to-red-500",
      trend: `days`
    },
    {
      title: "Level",
      value: `${currentLevel}`,
      icon: Award,
      color: "from-purple-500 to-indigo-600",
      trend: `${currentXP} XP`
    },
    {
      title: "Total Done",
      value: user?.total_habits_completed || 0,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      trend: "habits"
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-md mx-auto md:max-w-7xl p-4 space-y-6">
        {/* Account Status Notifications */}
        {user?.account_locked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border-red-500/50 border rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-300 mb-1">Account Locked</h3>
                <p className="text-red-400 text-sm">Your payment method was declined. Please update your card to continue using the app.</p>
              </div>
              <Link to={createPageUrl("Settings")}>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Fix Payment
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {user?.penalties_paused && !user?.account_locked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/30 border-blue-500/50 border rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-300 mb-1">Accountability Paused</h3>
                <p className="text-blue-400 text-sm">Your habits are paused. No penalties will be charged until you resume accountability.</p>
              </div>
              <Link to={createPageUrl("Settings")}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  Resume
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden text-center space-y-2 pt-4">
          <div className={`w-16 h-16 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} mx-auto flex items-center justify-center`}>
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Hey {user?.full_name?.split(' ')[0] || 'Builder'}!
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>
            Ready to level up today?
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className={`text-4xl lg:text-6xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Welcome back, {user?.full_name?.split(' ')[0] || 'Builder'}!
              </h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xl font-semibold tracking-wide`}>
                Ready to level up today?
              </p>
            </div>
            
            <div className={`w-16 h-16 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </motion.div>
        </div>

        {/* Setup Prompt */}
        {showSetupPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 mb-6"
          >
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Get Started!</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Welcome to Get Good! Let's set up your first habits to get you started on your journey.
            </p>
            <div className="flex gap-3">
              <Link to={createPageUrl("Setup")}>
                <Button className={`${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  Quick Setup
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setShowSetupPrompt(false)}
                className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 md:p-6`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <p className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {stat.trend}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content - Mobile First */}
        <div className="space-y-6 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
          {/* Today's Habits - Full Width on Mobile */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-full"
            >
              <TodayHabits
                habits={habits}
                logs={todayLogs}
                onUpdate={handleHabitUpdate}
                user={user}
              />
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6 w-full max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-full"
            >
              <StreakMeter user={user} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-full`}
            >
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                How Penalties Work
              </h3>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-3`}>
                <p>If you miss a habit, a penalty will be charged 30 minutes after its due time.</p>
                <p>Credits are automatically used to cover penalties first.</p>
                <p>Keep your streak alive to avoid charges!</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Habit Overview - Full Width Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-full"
        >
          <HabitStats habits={habits} user={user} />
        </motion.div>

        {/* Mobile Spacing for Bottom Nav */}
        <div className="h-20 md:h-0"></div>
      </div>
    </div>
  );
}
