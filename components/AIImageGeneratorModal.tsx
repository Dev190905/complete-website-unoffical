import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AIImageGeneratorModalProps {
    onClose: () => void;
    onImageGenerated: (base64Image: string) => void;
}

const AIImageGeneratorModal: React.FC<AIImageGeneratorModalProps> = ({ onClose, onImageGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const { generateAvatar } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const base64 = await generateAvatar(prompt);
            setGeneratedImage(base64);
        } catch (err) {
            setError((err as Error).message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAccept = () => {
        if (generatedImage) {
            onImageGenerated(generatedImage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="premium-glass-card rounded-xl p-8 w-full max-w-md animate-modal-pop-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-white">Generate Avatar with AI</h2>
                <p className="text-slate-400 mb-4 text-sm">Describe the avatar you want to create. Be creative!</p>
                
                {generatedImage && !isLoading && (
                    <div className="my-4 animate-fade-in-up">
                        <img src={`data:image/png;base64,${generatedImage}`} alt="Generated Avatar" className="rounded-lg w-full aspect-square object-cover" />
                    </div>
                )}

                {isLoading && (
                    <div className="my-4 flex flex-col justify-center items-center h-64 text-center">
                        <div className="pulsating-orb"></div>
                        <p className="text-slate-300 mt-4 animate-pulse">AI is painting your masterpiece...</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <textarea 
                        placeholder="e.g., A minimalist line art of a wolf howling at a crescent moon" 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        required 
                        className="input-glow-effect w-full h-24 px-4 py-2 bg-slate-700/50 rounded-md focus:ring-2 border border-slate-600 text-white" 
                    />
                    <div className="flex justify-between items-center space-x-3 pt-2">
                        {generatedImage ? (
                            <>
                                <button type="submit" className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white">Regenerate</button>
                                <button type="button" onClick={handleAccept} className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white">Accept</button>
                            </>
                        ) : (
                             <>
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white disabled:bg-slate-500">
                                    {isLoading ? 'Generating...' : 'Generate'}
                                </button>
                             </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIImageGeneratorModal;