import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 sm:px-6 py-8 page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
