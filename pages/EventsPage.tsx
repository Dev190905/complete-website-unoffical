import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';

const EventsPage: React.FC = () => {
    const { user, events, addEvent, updateEvent, deleteEvent } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);

    const handleRsvp = (eventId: string) => {
        if (!user) return;
        const event = events.find(e => e.id === eventId);
        if(!event) return;

        const rsvpd = event.rsvps.includes(user.id);
        const newRsvps = rsvpd ? event.rsvps.filter(id => id !== user.id) : [...event.rsvps, user.id];
        updateEvent(eventId, { rsvps: newRsvps });
    };

    const openModal = (event: Partial<Event> | null = null) => {
        setCurrentEvent(event || { title: '', description: '', date: '', organizer: ''});
        setIsModalOpen(true);
    };
    
    const handleSave = (data: Omit<Event, 'id' | 'rsvps'>) => {
        if (currentEvent?.id) {
            updateEvent(currentEvent.id, data);
        } else {
            addEvent(data);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            deleteEvent(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Events & Clubs</h1>
                {user?.isAdmin && <button onClick={() => openModal()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">Add Event</button>}
            </div>
            
            {events.length === 0 ? (
                 <div className="text-center py-20 bg-slate-800/80 rounded-lg border border-dashed border-slate-700">
                    <h2 className="text-2xl font-semibold text-slate-300">No Events Scheduled</h2>
                    <p className="text-slate-500 mt-2">The data set is not currently available and will be added soon.</p>
                    {user?.isAdmin && <button onClick={() => openModal()} className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">Add First Event</button>}
                </div>
            ) : (
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
                                <div className="flex items-center space-x-2">
                                     {user?.isAdmin && (
                                        <>
                                            <button onClick={() => openModal(event)} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">EDIT</button>
                                            <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">DELETE</button>
                                        </>
                                    )}
                                    <button onClick={() => handleRsvp(event.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${user && event.rsvps.includes(user.id) ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                        {user && event.rsvps.includes(user.id) ? '✓ Attending' : 'RSVP'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && <EventModal event={currentEvent} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const EventModal: React.FC<{event: Partial<Event> | null, onSave: (data: any) => void, onClose: () => void}> = ({ event, onSave, onClose }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().substring(0, 16) : '');
    const [organizer, setOrganizer] = useState(event?.organizer || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, date: new Date(date).toISOString(), organizer });
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700 animate-modal-pop-in">
                <h2 className="text-2xl font-bold mb-4">{event?.id ? 'Edit' : 'Add'} Event</h2>
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
