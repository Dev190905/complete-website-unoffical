import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, GroundingChunk } from '../types';
import { marked } from 'marked';
import 'prismjs'; // Import Prism to make it available

const SendIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const SourcesIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>;


const AIChatPage: React.FC = () => {
    const { user, startAIChatStream } = useAuth();
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(lastMessageRef.current){
             // @ts-ignore
            if (window.Prism) {
                 // @ts-ignore
                window.Prism.highlightAllUnder(lastMessageRef.current);
            }
        }
    }, [history, isLoading]);
    
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isLoading]);


    const handleSend = useCallback(async (message?: string) => {
        const textToSend = message || input;
        if (!textToSend.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: textToSend }] };
        const currentHistory = [...history, userMessage];
        setHistory(currentHistory);
        setInput('');
        setIsLoading(true);

        try {
            const stream = startAIChatStream(history, textToSend);
            let modelResponse = '';
            let sources: GroundingChunk[] = [];
            
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }], sources: [] };
            setHistory(prev => [...prev, modelMessage]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                if(chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    sources = chunk.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
                }

                setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    lastMessage.parts[0].text = modelResponse;
                    lastMessage.sources = sources;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "An error occurred. Please try again." }]};
            setHistory(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, history, startAIChatStream]);

    const conversationStarters = [
        "Summarize recent notices for me",
        "What are the most active forum topics?",
        "Tell me about upcoming campus events",
        "Explain the tower of hanoi problem in python"
    ];

    return (
        <div className="ai-chat-page flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {history.length === 0 && (
                    <div className="text-center pt-10 animate-fade-in">
                        <h1 className="text-4xl font-bold text-white mb-2">Alpha</h1>
                        <p className="text-xl text-gray-400 mb-8">Your hyper-intelligent portal assistant. State your query.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {conversationStarters.map(prompt => (
                                <button key={prompt} onClick={() => handleSend(prompt)} className="suggestion-chip p-4 rounded-lg text-left text-white">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">A</div>}
                        <div ref={index === history.length - 1 ? lastMessageRef : null} className={`max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white p-4 rounded-2xl rounded-br-lg' : ''}`}>
                            {msg.role === 'model' ? (
                                <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.parts[0].text) }}
                                />
                            ) : (
                                msg.parts[0].text
                            )}

                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 border-t border-gray-600 pt-2">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><SourcesIcon /> Sources</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, i) => (
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" key={i} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md truncate max-w-xs">
                                                {source.web.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && history[history.length-1].role === 'user' && ( // show loading only if last message was user
                    <div className="flex justify-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">A</div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-[#121212]">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Message Alpha..."
                        rows={1}
                        className="w-full px-4 py-3 pr-14 bg-[#2d2d2d] border border-[#404040] rounded-xl resize-none focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity" disabled={!input.trim() || isLoading}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPage;
