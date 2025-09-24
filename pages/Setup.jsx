
import React, { useState, useEffect } from "react";
import { User, Habit } from "@/api/entities";
import { motion } from "framer-motion";
import { CheckSquare, Clock, Target, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PREBUILT_HABITS = [
  {
    title: "Read for 30 minutes",
    category: "learning",
    importance: "medium",
    target_value: 30,
    target_unit: "minutes",
    icon: "📚"
  },
  {
    title: "Exercise or workout",
    category: "fitness", 
    importance: "high",
    target_value: 45,
    target_unit: "minutes",
    icon: "🏃"
  },
  {
    title: "Meditate",
    category: "mindfulness",
    importance: "medium", 
    target_value: 10,
    target_unit: "minutes",
    icon: "🧘"
  },
  {
    title: "Drink 8 glasses of water",
    category: "health",
    importance: "low",
    target_value: 8,
    target_unit: "glasses",
    icon: "💧"
  },
  {
    title: "Take vitamins",
    category: "health",
    importance: "low",
    target_value: 1,
    target_unit: "dose",
    icon: "💊"
  },
  {
    title: "Call family/friends",
    category: "social",
    importance: "medium",
    target_value: 1,
    target_unit: "call",
    icon: "📞"
  },
  {
    title: "Write in journal",
    category: "personal",
    importance: "low",
    target_value: 15,
    target_unit: "minutes", 
    icon: "✍️"
  },
  {
    title: "No social media",
    category: "productivity",
    importance: "medium",
    target_value: 1,
    target_unit: "day",
    icon: "📵"
  },
  {
    title: "Learn something new",
    category: "learning",
    importance: "medium",
    target_value: 20,
    target_unit: "minutes",
    icon: "🎯"
  },
  {
    title: "Practice gratitude",
    category: "mindfulness",
    importance: "low",
    target_value: 5,
    target_unit: "minutes",
    icon: "🙏"
  },
  {
    title: "Stretch or yoga",
    category: "fitness",
    importance: "medium",
    target_value: 20,
    target_unit: "minutes",
    icon: "🤸"
  },
  {
    title: "Make bed",
    category: "personal",
    importance: "low",
    target_value: 1,
    target_unit: "time",
    icon: "🛏️"
  }
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const toggleHabit = (habit) => {
    setSelectedHabits(prev => {
      const exists = prev.find(h => h.title === habit.title);
      if (exists) {
        return prev.filter(h => h.title !== habit.title);
      } else {
        return [...prev, habit];
      }
    });
  };

  const createSelectedHabits = async () => {
    setIsCreating(true);
    try {
      const penaltyAmounts = { low: 1, medium: 5, high: 10 };
      
      const habitsToCreate = selectedHabits.map(habit => ({
        ...habit,
        penalty_amount: penaltyAmounts[habit.importance],
        start_date: new Date().toISOString().split('T')[0],
        target_frequency: "daily",
        due_time_type: "end_of_day",
        is_active: true
      }));

      if (habitsToCreate.length > 0) {
        await Habit.bulkCreate(habitsToCreate);
      }

      // Mark user as having completed setup
      await User.updateMyUserData({ setup_completed: true });
      
      // Redirect to dashboard
      window.location.href = '/Dashboard';
      
    } catch (error) {
      console.error("Error creating habits:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const skipSetup = async () => {
    try {
      await User.updateMyUserData({ setup_completed: true });
      window.location.href = '/Dashboard';
    } catch (error) {
      console.error("Error skipping setup:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 mx-auto">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c833aeb4f13d2ff81e3245/eedccc5b6_LOGO.png" 
                alt="Get Good Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white dark:text-white text-gray-900">
                Welcome to Get Good!
              </h1>
              <p className="text-xl text-gray-400 dark:text-gray-400 text-gray-600">
                Get Good by building better habits or pay the price
              </p>
            </div>

            <div className="bg-gray-900 dark:bg-gray-900 bg-white border border-gray-700 dark:border-gray-700 border-gray-200 rounded-2xl p-8 space-y-6 text-left">
              <h2 className="text-2xl font-bold text-white dark:text-white text-gray-900">How It Works</h2>
              
              <div className="space-y-4 text-gray-400 dark:text-gray-400 text-gray-600">
                <div className="flex items-start gap-4">
                  <CheckSquare className="w-6 h-6 mt-1 text-blue-500" />
                  <div>
                    <p className="font-semibold text-white dark:text-white text-gray-900">Track Your Habits</p>
                    <p>Set daily or weekly habits with financial stakes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 mt-1 text-red-500" />
                  <div>
                    <p className="font-semibold text-white dark:text-white text-gray-900">Pay for Failures</p>
                    <p>Miss a habit? Pay $1-$10 depending on priority</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Plus className="w-6 h-6 mt-1 text-green-500" />
                  <div>
                    <p className="font-semibold text-white dark:text-white text-gray-900">Earn Credits & XP</p>
                    <p>Level up and earn credits to offset penalties</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={skipSetup}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Skip Setup
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                Get Started
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-black text-white dark:text-white text-gray-900">
                Choose Your Habits
              </h1>
              <p className="text-gray-400 dark:text-gray-400 text-gray-600">
                Select habits to get started. You can always add more later.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-gray-600">
                {selectedHabits.length} selected
              </p>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {PREBUILT_HABITS.map((habit, index) => (
                <motion.div
                  key={habit.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleHabit(habit)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedHabits.find(h => h.title === habit.title)
                      ? 'bg-blue-900/50 border-blue-500'
                      : 'bg-gray-900 dark:bg-gray-900 bg-white border-gray-700 dark:border-gray-700 border-gray-200 hover:border-gray-600 dark:hover:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{habit.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white dark:text-white text-gray-900">{habit.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-400 text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          habit.importance === 'high' ? 'bg-red-200 text-red-800' :
                          habit.importance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {habit.importance} priority
                        </span>
                        {habit.target_value && (
                          <span>{habit.target_value} {habit.target_unit}</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedHabits.find(h => h.title === habit.title)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedHabits.find(h => h.title === habit.title) && (
                        <CheckSquare className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Back
              </Button>
              <Button 
                onClick={createSelectedHabits}
                disabled={selectedHabits.length === 0 || isCreating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : `Create ${selectedHabits.length} Habits`}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
