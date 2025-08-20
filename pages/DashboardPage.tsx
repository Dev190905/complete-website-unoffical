import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import EasterEgg from '../components/EasterEgg';
import Chatbot from '../components/Chatbot';

interface EasterEggState {
  id: number;
  x: number;
  y: number;
}

const DashboardPage: React.FC = () => {
    const [easterEggs, setEasterEggs] = useState<EasterEggState[]>([]);
    const location = useLocation();

    const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Easter Egg Logic: 10% chance to spawn an icon
      if (Math.random() < 0.1) {
          const newEgg: EasterEggState = {
              id: Date.now(),
              x: e.clientX,
              y: e.clientY,
          };
          setEasterEggs(prev => [...prev, newEgg]);
      }
    };
    
    const removeEgg = (id: number) => {
        setEasterEggs(prev => prev.filter(egg => egg.id !== id));
    };

    return (
        <div className="flex h-screen text-gray-100" onClick={handleGlobalClick}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
                    <div key={location.pathname} className="container mx-auto px-6 py-8 page-container">
                        <Outlet />
                    </div>
                </main>
            </div>
            {easterEggs.map(egg => (
                <EasterEgg key={egg.id} x={egg.x} y={egg.y} onComplete={() => removeEgg(egg.id)} />
            ))}
            <Chatbot />
        </div>
    );
};

export default DashboardPage;