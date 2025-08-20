import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl font-bold text-primary-500">404</h1>
            <h2 className="text-3xl font-semibold text-white mt-4">Page Not Found</h2>
            <p className="text-slate-400 mt-2">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="mt-6 px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold transition-colors">
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;