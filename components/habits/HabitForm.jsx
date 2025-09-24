
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Utility function to convert 24-hour time to 12-hour format for display
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function HabitForm({ habit, onSubmit, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (habit) return habit;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    return {
      title: "",
      description: "",
      category: "personal",
      importance: "low",
      target_frequency: "daily",
      due_day_of_week: 1,
      target_value: "",
      target_unit: "",
      due_time_type: "exact",
      due_time: currentTime,
      reminder_offset_minutes: 0,
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const penaltyAmounts = { low: 1, medium: 5, high: 10 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        penalty_amount: penaltyAmounts[formData.importance],
        // Ensure numeric fields are properly converted
        target_value: formData.target_value ? Number(formData.target_value) : null,
        reminder_offset_minutes: Number(formData.reminder_offset_minutes) || 0,
        due_day_of_week: Number(formData.due_day_of_week) || 1
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-auto shadow-2xl my-4 md:my-0 mb-32 md:mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {habit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name *</label>
            <Input
              placeholder="e.g., Read for 30 minutes"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <Textarea
              placeholder="Why is this habit important to you?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Category & Importance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Importance *</label>
              <Select value={formData.importance} onValueChange={(value) => setFormData({ ...formData, importance: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="low">Low - $1 penalty</SelectItem>
                  <SelectItem value="medium">Medium - $5 penalty</SelectItem>
                  <SelectItem value="high">High - $10 penalty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Frequency & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <Select value={formData.target_frequency} onValueChange={(value) => setFormData({ ...formData, target_frequency: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.target_frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Day of Week</label>
                <Select value={String(formData.due_day_of_week)} onValueChange={(value) => setFormData({ ...formData, due_day_of_week: Number(value) })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                    <SelectItem value="0">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Target Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount</label>
              <Input 
                type="number" 
                placeholder="30" 
                value={formData.target_value} 
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
              <Input 
                placeholder="minutes, pages, etc." 
                value={formData.target_unit} 
                onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Time</label>
            <Select value={formData.due_time_type} onValueChange={(value) => setFormData({ ...formData, due_time_type: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                <SelectItem value="exact">Exact time</SelectItem>
                <SelectItem value="end_of_day">Due by end of day</SelectItem>
              </SelectContent>
            </Select>
            {formData.due_time_type === 'end_of_day' && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Due by 11:59 PM
                </p>
            )}
          </div>

          {formData.due_time_type === 'exact' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Before</label>
                <Input 
                  type="time" 
                  value={formData.due_time} 
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {formData.due_time && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due before {formatTime12Hour(formData.due_time)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reminder</label>
                <Select value={String(formData.reminder_offset_minutes)} onValueChange={(value) => setFormData({ ...formData, reminder_offset_minutes: Number(value) })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    <SelectItem value="0">No reminder</SelectItem>
                    <SelectItem value="10">10 mins before</SelectItem>
                    <SelectItem value="15">15 mins before</SelectItem>
                    <SelectItem value="30">30 mins before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Penalty Preview */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h4 className="font-medium text-white mb-2">Penalty Preview</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Miss this habit:</span>
              <span className="font-bold text-red-400">
                ${penaltyAmounts[formData.importance]} penalty
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-300">Charged:</span>
              <span className="text-gray-400">
                {formData.due_time_type === 'exact' ? '30 mins after due time' : 'After 11:59 PM'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formData.importance === 'high' && "High stakes keep you motivated!"}
              {formData.importance === 'medium' && "Moderate pressure for steady progress."}
              {formData.importance === 'low' && "Light penalty for gentle accountability."}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || isSubmitting}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {isSubmitting ? "Saving..." : habit ? "Update Habit" : "Create Habit"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
