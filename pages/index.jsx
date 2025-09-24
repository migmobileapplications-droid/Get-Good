import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Profile from "./Profile";

import Habits from "./Habits";

import Streaks from "./Streaks";

import Settings from "./Settings";

import Setup from "./Setup";

import TodoList from "./TodoList";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Profile: Profile,
    
    Habits: Habits,
    
    Streaks: Streaks,
    
    Settings: Settings,
    
    Setup: Setup,
    
    TodoList: TodoList,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Habits" element={<Habits />} />
                
                <Route path="/Streaks" element={<Streaks />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Setup" element={<Setup />} />
                
                <Route path="/TodoList" element={<TodoList />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}