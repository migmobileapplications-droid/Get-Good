
import React, { useState, useEffect, useCallback } from "react";
import { Todo } from "@/api/entities";
import { User } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListTodo, CalendarCheck, Check, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, endOfWeek, endOfMonth, isToday, isThisWeek, isThisMonth, parseISO, addMinutes, isAfter } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TodoForm = ({ todo, onSubmit, onClose, isDarkMode }) => {
    const [currentTodo, setCurrentTodo] = useState(todo || {
        title: "",
        description: "",
        importance: "low",
        due_type: "end_of_day"
    });

    const calculateDueDate = (dueType) => {
        const now = new Date();
        let dueDate;
        switch (dueType) {
            case 'end_of_week':
                dueDate = endOfWeek(now, { weekStartsOn: 1 }); // Monday-based week
                break;
            case 'end_of_month':
                dueDate = endOfMonth(now);
                break;
            case 'end_of_day':
            default:
                dueDate = now;
                break;
        }
        // Set time to the very end of the user's local day
        dueDate.setHours(23, 59, 59, 999);
        // Convert to UTC ISO string for storage
        return dueDate.toISOString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const todoData = {
            ...currentTodo,
            due_date: calculateDueDate(currentTodo.due_type)
        };
        onSubmit(todoData);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <div className={`relative ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 w-full max-w-lg`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{todo ? 'Edit Task' : 'New Task'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={currentTodo.title}
                        onChange={(e) => setCurrentTodo({...currentTodo, title: e.target.value})}
                        required
                        className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} border`}
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={currentTodo.description}
                        onChange={(e) => setCurrentTodo({...currentTodo, description: e.target.value})}
                        className={`w-full p-3 rounded-lg h-24 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} border`}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={currentTodo.due_type}
                            onChange={(e) => setCurrentTodo({...currentTodo, due_type: e.target.value})}
                            required
                            className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} border`}
                        >
                            <option value="end_of_day">Due Today</option>
                            <option value="end_of_week">Due End of Week</option>
                            <option value="end_of_month">Due End of Month</option>
                        </select>
                         <select
                            value={currentTodo.importance}
                            onChange={(e) => setCurrentTodo({...currentTodo, importance: e.target.value})}
                            className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} border`}
                        >
                            <option value="low">Low Priority ($1)</option>
                            <option value="medium">Medium Priority ($5)</option>
                            <option value="high">High Priority ($10)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className={`border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white`}>Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">{todo ? 'Save Changes' : 'Create Task'}</Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

const TodoItem = ({ todo, onComplete, isDarkMode }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
    >
        <button onClick={() => onComplete(todo.id, !todo.completed)} className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${todo.completed ? 'bg-green-500 border-green-500' : (isDarkMode ? 'border-gray-600' : 'border-gray-300')}`}>
            {todo.completed && <Check className="w-4 h-4 text-white mx-auto"/>}
        </button>
        <div className="flex-1">
            <p className={`font-semibold ${todo.completed && 'line-through text-gray-500'}`}>{todo.title}</p>
            <p className="text-sm text-gray-500">
                Due: {format(parseISO(todo.due_date), 'MMM d, yyyy')} • ${todo.penalty_amount} Penalty
            </p>
        </div>
    </motion.div>
);

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
        const userData = await User.me();
        setUser(userData);
        
        if (userData.penalties_paused || userData.account_locked) {
            setTodos([]);
            return;
        }
        const allTodos = await Todo.filter({ created_by: userData.email });
        setTodos(allTodos);

    } catch (error) {
        console.error("Error loading todos:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    loadTodos();
  }, [loadTodos]);

  const handleSubmit = async (todoData) => {
    try {
      const penaltyAmounts = { low: 1, medium: 5, high: 10 };
      const finalData = {
        title: todoData.title,
        description: todoData.description || "",
        importance: todoData.importance,
        penalty_amount: penaltyAmounts[todoData.importance],
        due_type: todoData.due_type,
        due_date: todoData.due_date,
        completed: false,
        penalty_charged: false
      };
      
      const newTodo = await Todo.create(finalData);
      
      setShowForm(false);
      setTimeout(() => {
        loadTodos();
      }, 500);
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleComplete = async (id, completed) => {
    // If un-completing, check if the penalty window has passed.
    if (!completed) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            const dueDate = parseISO(todo.due_date);
            // Penalty is due 30 mins after the task's due date/time.
            const penaltyTime = addMinutes(dueDate, 30);
            if (isAfter(new Date(), penaltyTime)) {
                alert("This task is past its penalty time and can no longer be modified.");
                return; // Prevent modification
            }
        }
    }
      
    try {
        if (completed) {
            await Todo.update(id, { 
                completed: true,
                completed_at: new Date().toISOString()
            });
        } else {
            await Todo.update(id, { 
                completed: false,
                completed_at: null
            });
        }
        loadTodos();
    } catch(e) {
        console.error("Failed to update todo:", e);
    }
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const todosToday = activeTodos.filter(t => isToday(parseISO(t.due_date)));
  
  const todosThisWeek = activeTodos.filter(t => isThisWeek(parseISO(t.due_date), { weekStartsOn: 1 }) && !isToday(parseISO(t.due_date)));
  
  const todosThisMonth = activeTodos.filter(t => isThisMonth(parseISO(t.due_date)) && !isThisWeek(parseISO(t.due_date), { weekStartsOn: 1 }));

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                <ListTodo/>
                To-Do List
            </h1>
            <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
                <Plus className="w-4 h-4 mr-2" />
                New Task
            </Button>
        </div>
        
        {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading tasks...</div>
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
                        ? 'Please update your payment method to reactivate your to-do list.' 
                        : 'Resume accountability in Settings to manage your to-do list.'}
                </p>
                <Link to={createPageUrl("Settings")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                    Go to Settings
                    </Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-8">
                <section>
                    <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Due Today</h2>
                    <AnimatePresence>
                    {todosToday.length > 0 ? (
                        <div className="space-y-3">
                            {todosToday.map(todo => <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} isDarkMode={isDarkMode}/>)}
                        </div>
                    ) : (
                        <p className="text-gray-500">No tasks due today. You're all caught up!</p>
                    )}
                    </AnimatePresence>
                </section>

                {todosThisWeek.length > 0 && (
                    <section>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Due This Week</h2>
                        <AnimatePresence>
                            <div className="space-y-3">
                                {todosThisWeek.map(todo => <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} isDarkMode={isDarkMode}/>)}
                            </div>
                        </AnimatePresence>
                    </section>
                )}

                {todosThisMonth.length > 0 && (
                    <section>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Due This Month</h2>
                        <AnimatePresence>
                            <div className="space-y-3">
                                {todosThisMonth.map(todo => <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} isDarkMode={isDarkMode}/>)}
                            </div>
                        </AnimatePresence>
                    </section>
                )}
                
                {completedTodos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarCheck className="w-5 h-5 text-green-500"/>
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Completed Tasks</h2>
                        </div>
                         <AnimatePresence>
                             <div className="space-y-3">
                                {completedTodos.map(todo => <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} isDarkMode={isDarkMode}/>)}
                            </div>
                         </AnimatePresence>
                    </section>
                )}

                {todos.length === 0 && !isLoading && (
                    <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border`}>
                        <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                            <ListTodo className={`w-10 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No tasks created yet</h3>
                        <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-6`}>Create your first to-do task to get started</p>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Task
                        </Button>
                    </div>
                )}
            </div>
        )}
        
        <AnimatePresence>
            {showForm && <TodoForm onSubmit={handleSubmit} onClose={() => setShowForm(false)} isDarkMode={isDarkMode} />}
        </AnimatePresence>
    </div>
  );
}
