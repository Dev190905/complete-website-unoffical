import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import NoticesPage from './pages/NoticesPage';
import { ForumPage, TopicPage } from './pages/ForumAndTopicPages';
import ResourcesPage from './pages/ResourcesPage';
import EventsPage from './pages/EventsPage';
import MarketplacePage from './pages/MarketplacePage';
import PlacementsPage from './pages/PlacementsPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FriendsPage from './pages/FriendsPage';
import ChatPage from './pages/ChatPage';
import SplashScreen from './components/SplashScreen';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/" /> : <ResetPasswordPage />} />
            <Route 
                path="/*"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="notices" element={<NoticesPage />} />
                <Route path="forum" element={<ForumPage />} />
                <Route path="forum/:topicId" element={<TopicPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="placements" element={<PlacementsPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="chat/:friendId" element={<ChatPage />} />
                <Route path="profile" element={<ProfilePage />} />
                 <Route path="search/:query" element={<SearchPage />} />
                <Route path="admin" element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // Splash screen duration
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthProvider>
            {showSplash && <SplashScreen />}
            <div className={showSplash ? 'hidden' : 'block'}>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </div>
        </AuthProvider>
    );
};

export default App;