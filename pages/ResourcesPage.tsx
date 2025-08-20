import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Resource } from '../types';

const ResourcesPage: React.FC = () => {
    const { resources, addResource } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data: Omit<Resource, 'id' | 'uploadedBy' | 'uploadDate'>) => {
        addResource(data);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Study Resources</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold transition-colors">Upload Resource</button>
            </div>
            
            {resources.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/80 rounded-lg border border-dashed border-slate-700">
                    <h2 className="text-2xl font-semibold text-slate-300">No Resources Yet</h2>
                    <p className="text-slate-500 mt-2">Be the first to upload and share study material!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(res => (
                        <div key={res.id} className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col justify-between transition-transform transform hover:scale-105 card-hover-effect">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-2">{res.title}</h2>
                                <p className="text-slate-400 text-sm mb-3">{res.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {res.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">{tag}</span>)}
                                </div>
                            </div>
                            <div className="mt-4">
                                {res.link && <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">View Link &rarr;</a>}
                                {res.fileName && <p className="text-green-400">File: {res.fileName}</p>}
                                <p className="text-xs text-slate-500 mt-2">Uploaded by {res.uploadedBy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <ResourceModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ResourceModal: React.FC<{onSave: (data: any) => void, onClose: () => void}> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [link, setLink] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, link, tags: tags.split(',').map(t => t.trim()) });
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Upload Resource</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md h-24"/>
                    <input type="text" placeholder="Link (e.g., https://...)" value={link} onChange={e => setLink(e.target.value)} className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <p className="text-sm text-slate-400">Or upload a file (feature mocked).</p>
                    <input type="text" placeholder="Tags (comma-separated, e.g., CS, Maths)" value={tags} onChange={e => setTags(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default ResourcesPage;