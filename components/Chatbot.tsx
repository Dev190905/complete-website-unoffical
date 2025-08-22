
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

const API_KEY = process.env.API_KEY;

const ChatIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg> );
const CloseIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const SendIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> );

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { notices, topics, events, allUsers } = useAuth();
    
    const systemInstruction = useMemo(() => {
         const portalContext = `
            You are a friendly and helpful AI assistant for a college portal. Your goal is to assist students.
            Here is a summary of the current state of the college portal:
            - Latest Notices: ${notices.slice(0,2).map(n => n.title).join('; ')}
            - Hottest Forum Topics: ${topics.slice(0,2).map(t => t.title).join('; ')}
            - Upcoming Events: ${events.slice(0,2).map(e => e.title).join('; ')}
            - Total users: ${allUsers.length}
            Based on this context, answer user queries. If a query is not related to this context or general college life, politely state that you can only help with portal-related questions.
        `;
        return portalContext;
    }, [notices, topics, events, allUsers]);

    useEffect(() => {
        if (isOpen && !chatRef.current && API_KEY) {
            console.log("Initializing Chatbot...");
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                },
            });
        }
    }, [isOpen, systemInstruction]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSend = async () => {
        const chat = chatRef.current;
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].parts[0].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
             setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now." }] }]);
        } finally {
            setIsLoading(false);
        }
    };
    
     if (!API_KEY) return null; // Don't render if no API key

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-all duration-300 z-50"
                aria-label="Toggle chatbot"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-2xl flex flex-col border border-slate-700 z-50 animate-fade-in-up">
                    <header className="bg-slate-700/50 p-4 rounded-t-lg">
                        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-bg-pattern scrollbar-thin">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                   {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 bg-slate-700 rounded-2xl rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-slate-700">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="input-glow-effect flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-full focus:outline-none focus:ring-2"
                                disabled={isLoading}
                            />
                            <button type="submit" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white disabled:bg-slate-600" disabled={isLoading || !input.trim()}>
                                <SendIcon />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;