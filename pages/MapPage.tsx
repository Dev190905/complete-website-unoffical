import React, { useState } from 'react';
import type { MapMarker } from '../types';

// Updated markers for MLRITM Campus with more accurate positions
const markers: MapMarker[] = [
  { id: 'main', name: 'Main Block (Admin)', description: 'Administrative offices, admissions, and main entrance.', position: { top: '50%', left: '40%' } },
  { id: 'cse', name: 'CSE / IT Block', description: 'Computer Science and Information Technology departments.', position: { top: '34%', left: '55%' } },
  { id: 'aero', name: 'Aeronautical Block', description: 'Home to the Aeronautical Engineering department.', position: { top: '65%', left: '25%' } },
  { id: 'library', name: 'Central Library', description: 'A vast collection of books, journals, and digital resources.', position: { top: '55%', left: '58%' } },
  { id: 'mech', name: 'Mechanical Block', description: 'Labs and classrooms for the Mechanical Engineering department.', position: { top: '70%', left: '70%' } },
  { id: 'canteen', name: 'Main Canteen', description: 'The central hub for food and student gatherings.', position: { top: '45%', left: '75%' } },
];

const MapPage: React.FC = () => {
    const [activeMarker, setActiveMarker] = useState<MapMarker | null>(null);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Campus Map</h1>
            <div 
                className="relative w-full aspect-[16/10] bg-[#1a4a1a] rounded-lg border-2 border-slate-700 overflow-hidden"
                onClick={() => setActiveMarker(null)}
            >
                {/* Custom Pixelated Map Background */}
                <div className="absolute inset-0">
                    {/* Roads */}
                    <div className="absolute top-[48%] left-0 w-full h-[6%] bg-slate-600/80"></div>
                    <div className="absolute top-0 left-[48%] w-[6%] h-full bg-slate-600/80"></div>
                    
                    {/* Building Blocks */}
                    <div className="absolute top-[30%] left-[52%] w-[8%] h-[8%] bg-[#5a3b2a] border-2 border-black/20"></div> {/* CSE */}
                    <div className="absolute top-[62%] left-[20%] w-[10%] h-[12%] bg-[#6b4a39] border-2 border-black/20"></div> {/* Aero */}
                    <div className="absolute top-[52%] left-[55%] w-[8%] h-[8%] bg-[#7c5a48] border-2 border-black/20"></div> {/* Library */}
                    <div className="absolute top-[65%] left-[65%] w-[10%] h-[10%] bg-[#8d6957] border-2 border-black/20"></div> {/* Mech */}
                    <div className="absolute top-[40%] left-[70%] w-[10%] h-[8%] bg-[#9e7966] border-2 border-black/20"></div> {/* Canteen */}
                    <div className="absolute top-[45%] left-[30%] w-[12%] h-[12%] bg-[#af8875] border-2 border-black/20"></div> {/* Main Block */}
                    
                    {/* Green Patches */}
                    <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#2e8b57]/30 rounded-full"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[25%] h-[25%] bg-[#6b8e23]/30 rounded-lg"></div>
                </div>

                {markers.map(marker => (
                    <div
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: marker.position.top, left: marker.position.left }}
                        onClick={(e) => { e.stopPropagation(); setActiveMarker(marker); }}
                    >
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white/50">
                           <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                ))}
                
                {activeMarker && (
                    <div 
                        className="absolute p-4 bg-slate-900/80 backdrop-blur-sm border border-primary-500 rounded-lg shadow-2xl transition-all duration-300 w-64 animate-fade-in"
                        style={{ top: `calc(${activeMarker.position.top} + 20px)`, left: `calc(${activeMarker.position.left} + 20px)` }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-primary-400">{activeMarker.name}</h3>
                        <p className="text-sm text-slate-300">{activeMarker.description}</p>
                    </div>
                )}
            </div>
             <p className="text-center mt-4 text-slate-500">A custom pixelated map of the MLRITM campus. Click markers for info.</p>
        </div>
    );
};

export default MapPage;