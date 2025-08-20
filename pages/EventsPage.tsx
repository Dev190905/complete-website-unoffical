import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';

const EventsPage: React.FC = () => {
    const { user, events, addEvent, updateEvent } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRsvp = (eventId: string) => {
        if (!user) return;
        const event = events.find(e => e.id === eventId);
        if(!event) return;

        const rsvpd = event.rsvps.includes(user.id);
        const newRsvps = rsvpd ? event.rsvps.filter(id => id !== user.id) : [...event.rsvps, user.id];
        updateEvent(eventId, { rsvps: newRsvps });
    };
    
    const handleSave = (data: Omit<Event, 'id' | 'rsvps'>) => {
        addEvent(data);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Events & Clubs</h1>
                {user?.isAdmin && <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">Add Event</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                    <div key={event.id} className="bg-gradient-to-br from-slate-800 to-slate-800/80 rounded-xl border border-slate-700 flex flex-col transition-transform transform hover:scale-105 card-hover-effect overflow-hidden">
                        <div className="p-5 flex-1">
                            <p className="text-sm text-primary-400 font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <h2 className="text-xl font-bold text-white mt-1 mb-2">{event.title}</h2>
                            <p className="text-slate-400 text-sm mb-2">Organized by: {event.organizer}</p>
                            <p className="text-slate-300 text-sm mb-4">{event.description}</p>
                        </div>
                         <div className="bg-slate-700/50 p-4 flex justify-between items-center mt-auto">
                            <span className="text-sm text-slate-400">{event.rsvps.length} going</span>
                            <button onClick={() => handleRsvp(event.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${user && event.rsvps.includes(user.id) ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                {user && event.rsvps.includes(user.id) ? '✓ Attending' : 'RSVP'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <EventModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const EventModal: React.FC<{onSave: (data: any) => void, onClose: () => void}> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [organizer, setOrganizer] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, date: new Date(date).toISOString(), organizer });
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Add Event</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300"/>
                    <input type="text" placeholder="Organizer (e.g., CS Club)" value={organizer} onChange={e => setOrganizer(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md h-24"/>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventsPage;