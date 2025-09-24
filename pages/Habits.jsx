
import React, { useState, useEffect } from "react";
import { Habit } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Plus, Search, Filter, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import HabitForm from "../components/habits/HabitForm";
import HabitCard from "../components/habits/HabitCard";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterImportance, setFilterImportance] = useState("all");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Initial state set as per outline, will be updated by useEffect

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme ? savedTheme === 'dark' : true);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      if (userData.penalties_paused || userData.account_locked) {
        setHabits([]);
      } else {
        const userHabits = await Habit.filter({ created_by: userData.email }, '-created_date');
        setHabits(userHabits);
      }
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (habitData) => {
    try {
      // Set penalty amount based on importance
      const penaltyAmounts = { low: 1, medium: 5, high: 10 };
      
      // Ensure all required fields are present with proper types
      const finalData = {
        title: habitData.title,
        description: habitData.description || "",
        category: habitData.category || "personal",
        importance: habitData.importance,
        penalty_amount: penaltyAmounts[habitData.importance],
        target_frequency: habitData.target_frequency || "daily",
        target_value: habitData.target_value ? Number(habitData.target_value) : null,
        target_unit: habitData.target_unit || "",
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        due_time_type: habitData.due_time_type || "end_of_day",
        due_time: habitData.due_time || "22:00",
        reminder_offset_minutes: Number(habitData.reminder_offset_minutes) || 0,
        current_streak: 0,
        best_streak: 0
      };

      // Add weekly-specific fields if needed
      if (habitData.target_frequency === 'weekly') {
        finalData.due_day_of_week = Number(habitData.due_day_of_week) || 1;
      }

      if (editingHabit) {
        await Habit.update(editingHabit.id, finalData);
      } else {
        await Habit.create(finalData);
      }
      
      setShowForm(false);
      setEditingHabit(null);
      loadData();
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await Habit.update(habitId, { is_active: false });
        loadData();
      } catch (error) {
        console.error("Error deactivating habit:", error);
      }
    }
  };

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || habit.category === filterCategory;
    const matchesImportance = filterImportance === "all" || habit.importance === filterImportance;
    const isActive = habit.is_active !== false;
    
    return matchesSearch && matchesCategory && matchesImportance && isActive;
  });

  return (
    <div className={`p-4 md:p-8 max-w-6xl mx-auto ${isDarkMode ? '' : 'min-h-screen bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Habits
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Build better habits with financial accountability</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
          <Input
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className={`w-full md:w-40 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterImportance} onValueChange={setFilterImportance}>
          <SelectTrigger className={`w-full md:w-40 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
            <SelectValue placeholder="Importance" />
          </SelectTrigger>
          <SelectContent className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High ($10)</SelectItem>
            <SelectItem value="medium">Medium ($5)</SelectItem>
            <SelectItem value="low">Low ($1)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 animate-pulse border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-4`}></div>
              <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full mb-2`}></div>
              <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
            </div>
          ))}
        </div>
      ) : user?.penalties_paused || user?.account_locked ? (
        <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border`}>
          <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <PauseCircle className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {user?.account_locked ? 'Account Locked' : 'Accountability Paused'}
          </h3>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-6`}>
            {user?.account_locked 
                ? 'Please update your payment method to reactivate your habits.' 
                : 'Resume accountability in Settings to manage your habits.'}
          </p>
          <Link to={createPageUrl("Settings")}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              Go to Settings
            </Button>
          </Link>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border`}>
          <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Plus className={`w-10 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {habits.length === 0 ? "No habits created yet" : "No habits match your filters"}
          </h3>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-6`}>
            {habits.length === 0 
              ? "Start building better habits with financial accountability" 
              : "Try adjusting your search or filters"
            }
          </p>
          {habits.length === 0 && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Habit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <HabitCard
                habit={habit}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}
