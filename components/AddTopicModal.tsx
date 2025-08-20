import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AddTopicModalProps {
    onClose: () => void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({ onClose }) => {
    const { addTopic } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        try {
            const newTopic = addTopic({ title, description });
            onClose();
            navigate(`/forum/${newTopic.id}`);
        } catch(err) {
            console.error(err);
            alert("Could not create topic. Please ensure you are logged in.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-white">Start a New Discussion</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Topic Title" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required 
                        className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 rounded-md focus:ring-2 border border-slate-600 text-white" 
                    />
                    <textarea 
                        placeholder="Topic Description (Optional)" 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="input-glow-effect w-full h-32 px-4 py-2 bg-slate-700/50 rounded-md focus:ring-2 border border-slate-600 text-white resize-none" 
                    />
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white">Create Topic</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTopicModal;