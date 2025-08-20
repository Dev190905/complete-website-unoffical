import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Notice, NoticeCategory } from '../types';

const NoticePage: React.FC = () => {
    const { user, notices, addNotice, updateNotice, deleteNotice } = useAuth();
    const [filter, setFilter] = useState<NoticeCategory | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNotice, setCurrentNotice] = useState<Partial<Notice> | null>(null);

    const filteredNotices = useMemo(() => {
        const sorted = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (filter === 'All') {
            return sorted;
        }
        return sorted.filter(n => n.category === filter);
    }, [notices, filter]);


    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            deleteNotice(id);
        }
    };
    
    const openModal = (notice: Partial<Notice> | null = null) => {
        setCurrentNotice(notice || { title: '', description: '', category: 'General' });
        setIsModalOpen(true);
    };

    const handleSave = (noticeData: Omit<Notice, 'id' | 'date' | 'postedBy'>) => {
        if (currentNotice?.id) { // Editing
            updateNotice(currentNotice.id, noticeData);
        } else { // Adding
            addNotice(noticeData);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Notices</h1>
                {user?.isAdmin && <button onClick={() => openModal()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold transition-colors">Add Notice</button>}
            </div>

            <div className="mb-6 flex items-center space-x-2">
                {(['All', 'Exam', 'Event', 'General', 'Scholarship', 'Club'] as const).map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${filter === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{cat}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredNotices.map(notice => (
                    <div key={notice.id} className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col justify-between transition-transform transform hover:-translate-y-1 card-hover-effect">
                        <div>
                             <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${notice.category === 'Exam' ? 'bg-red-500/50 text-red-200' : notice.category === 'Event' ? 'bg-green-500/50 text-green-200' : 'bg-teal-500/50 text-teal-200'}`}>{notice.category}</span>
                                {user?.isAdmin && (
                                    <div className="flex space-x-3 flex-shrink-0">
                                        <button onClick={() => openModal(notice)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                                        <button onClick={() => handleDelete(notice.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">{notice.title}</h2>
                            <p className="text-slate-400 mb-4">{notice.description}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Posted on {new Date(notice.date).toLocaleDateString()} by {notice.postedBy}</p>
                    </div>
                ))}
            </div>
            
            {isModalOpen && <NoticeModal notice={currentNotice} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const NoticeModal: React.FC<{notice: Partial<Notice> | null, onSave: (data: any) => void, onClose: () => void}> = ({ notice, onSave, onClose }) => {
    const [title, setTitle] = useState(notice?.title || '');
    const [description, setDescription] = useState(notice?.description || '');
    const [category, setCategory] = useState<NoticeCategory>(notice?.category || 'General');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, category });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700">
                <h2 className="text-2xl font-bold mb-4">{notice?.id ? 'Edit' : 'Add'} Notice</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 rounded-md focus:ring-2 border border-slate-600" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 rounded-md h-32 border border-slate-600" />
                    <select value={category} onChange={e => setCategory(e.target.value as NoticeCategory)} className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 rounded-md border border-slate-600">
                        <option value="General">General</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Club">Club</option>
                    </select>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoticePage;