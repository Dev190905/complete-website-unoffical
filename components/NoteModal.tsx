
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface NoteModalProps {
    onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ onClose }) => {
    const { user, notes, addNote, deleteNote } = useAuth();
    const currentUserNote = useMemo(() => notes.find(n => n.userId === user?.id), [notes, user]);

    const [content, setContent] = useState(currentUserNote?.content || '');
    const characterLimit = 60;

    const handleShare = async () => {
        if (!content.trim()) {
            if (currentUserNote) { // If note exists but content is cleared, delete it
                await deleteNote();
            }
            onClose();
            return;
        }
        await addNote(content);
        onClose();
    };
    
    const handleDelete = async () => {
        await deleteNote();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm border border-gray-700 text-center animate-modal-pop-in" onClick={e => e.stopPropagation()}>
                <img src={user?.avatarUrl} alt="Your avatar" className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-gray-800" />
                <h2 className="text-xl font-bold mt-4 text-white">Share a thought</h2>
                <p className="text-gray-400 text-sm mb-4">Your friends can see your note for 24 hours.</p>
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={e => {
                            if (e.target.value.length <= characterLimit) {
                                setContent(e.target.value);
                            }
                        }}
                        placeholder="What's on your mind?"
                        className="input-glow-effect w-full h-24 p-3 bg-gray-700/50 border border-gray-600 rounded-md text-white text-center text-lg resize-none"
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-gray-500">{content.length}/{characterLimit}</span>
                </div>
                <div className="mt-4 flex flex-col space-y-2">
                    <button onClick={handleShare} className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white font-semibold">
                        {currentUserNote ? 'Update Note' : 'Share'}
                    </button>
                    {currentUserNote && (
                         <button onClick={handleDelete} className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors text-sm">
                            Delete Note
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteModal;