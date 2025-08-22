
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AddStoryModalProps {
    onClose: () => void;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({ onClose }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const { addStory } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl.trim()) {
            setError('Please enter an image URL.');
            return;
        }
        try {
            await addStory(imageUrl);
            onClose();
        } catch (err) {
            setError('Failed to add story. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg border border-gray-700 animate-modal-pop-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-white">Add to Your Story</h2>
                <p className="text-gray-400 mb-4 text-sm">Stories are visible for 24 hours. For this demo, please provide a direct image URL.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-400">{error}</p>}
                    <input 
                        type="text" 
                        placeholder="https://example.com/image.png" 
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        required 
                        className="input-glow-effect w-full px-4 py-2 bg-gray-700/50 rounded-md focus:ring-2 border border-gray-600 text-white" 
                    />
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white">Share Story</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStoryModal;