

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserSDK } from "@/api/entities";
import {
  Home,
  User,
  Target,
  CheckSquare,
  LineChart,
  Flame,
  Settings,
  ListTodo,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Habits",
    url: createPageUrl("Habits"),
    icon: CheckSquare,
  },
  {
    title: "To-Do",
    url: createPageUrl("TodoList"),
    icon: ListTodo,
  },
  {
    title: "Streaks",
    url: createPageUrl("Streaks"),
    icon: Flame,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await UserSDK.me();
        setUser(currentUser);
        
        setCompletionProgress(66);
      } catch (e) {
        // Not logged in or error fetching user
      }
    };
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    fetchUser();
  }, [location.pathname]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = navigationItems;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} relative overflow-hidden`}>
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDarkMode ? 'bg-white/5' : 'bg-gray-200/20'} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-1/3 right-1/4 w-80 h-80 ${isDarkMode ? 'bg-white/3' : 'bg-gray-300/15'} rounded-full blur-3xl`}></div>
      </div>

      {/* Nearly Invisible Platform Badge */}
      <div className="absolute top-2 right-2 opacity-5 hover:opacity-20 transition-opacity duration-1000 z-50">
        <div className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-gray-500/30'} font-light`}>base44</div>
      </div>

      {/* Mobile Header with Hamburger */}
      <header className={`md:hidden ${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b px-4 py-3 sticky top-0 z-50`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
          
          <motion.div
            className="flex items-center gap-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c833aeb4f13d2ff81e3245/eedccc5b6_LOGO.png" alt="Get Good Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Get Good
            </span>
          </motion.div>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={`md:hidden fixed left-0 top-0 h-full w-72 ${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border-r z-50`}
            >
              <div className={`p-8 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c833aeb4f13d2ff81e3245/eedccc5b6_LOGO.png" alt="Get Good Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Get Good
                    </h2>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-bold tracking-wide`}>BUILD BETTER HABITS</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-6">
                <ul className="space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <motion.li
                        key={item.title}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.url}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                            isActive
                              ? isDarkMode ? 'bg-white text-black shadow-xl' : 'bg-gray-900 text-white shadow-xl'
                              : isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className={`w-5 h-5 ${
                            isActive 
                              ? isDarkMode ? 'text-black' : 'text-white'
                              : isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
                          } transition-all duration-300`} />
                          <span className="font-bold tracking-wide">{item.title}</span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-full w-72 ${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border-r flex-col z-40`}>
        <div className={`p-8 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <motion.div
            className="flex items-center gap-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c833aeb4f13d2ff81e3245/eedccc5b6_LOGO.png" alt="Get Good Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Get Good
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-bold tracking-wide`}>BUILD BETTER HABITS</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 p-6">
          <ul className="space-y-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.url;
              return (
                <motion.li
                  key={item.title}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.url}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? isDarkMode ? 'bg-white text-black shadow-xl transform scale-105' : 'bg-gray-900 text-white shadow-xl transform scale-105'
                        : isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-white hover:scale-102' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-102'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${
                      isActive 
                        ? isDarkMode ? 'text-black' : 'text-white'
                        : isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
                    } transition-all duration-300`} />
                    <span className="font-bold tracking-wide">{item.title}</span>
                    {isActive && (
                      <motion.div
                        className={`absolute right-4 w-2 h-2 ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-full`}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

