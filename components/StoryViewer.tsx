import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Story } from '../types';

interface StoryGroup {
    userId: string;
    stories: Story[];
}

interface StoryViewerProps {
    storyGroups: StoryGroup[];
    initialUserIndex: number;
    onClose: () => void;
}

const CloseIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const ChevronLeft = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
const ChevronRight = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;

const StoryViewer: React.FC<StoryViewerProps> = ({ storyGroups, initialUserIndex, onClose }) => {
    const { allUsers, viewStory } = useAuth();
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const currentUserGroup = storyGroups[currentUserIndex];
    const currentStory = currentUserGroup?.stories[currentStoryIndex];
    const author = allUsers.find(u => u.id === currentUserGroup?.userId);
    
    useEffect(() => {
        if (currentStory) {
            viewStory(currentStory.id);
        }
    }, [currentStory, viewStory]);

    const goToNextStory = () => {
        if (currentUserGroup && currentStoryIndex < currentUserGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentUserIndex < storyGroups.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    };
    
    const goToPrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentUserIndex > 0) {
            const prevUserIndex = currentUserIndex - 1;
            setCurrentUserIndex(prevUserIndex);
            const prevUserStories = storyGroups[prevUserIndex].stories;
            setCurrentStoryIndex(prevUserStories.length - 1);
        }
    };
    
    useEffect(() => {
        if (isPaused) {
             if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(goToNextStory, 5000); // 5 seconds per story
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentStoryIndex, currentUserIndex, isPaused]);

    const handleNavigationClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, currentTarget } = e;
        const { left, width } = currentTarget.getBoundingClientRect();
        const clickPosition = clientX - left;
        if (clickPosition < width / 3) {
            goToPrevStory();
        } else {
            goToNextStory();
        }
    };

    if (!currentUserGroup || !author) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in" onMouseDown={(e) => { e.stopPropagation(); setIsPaused(true); }} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)}>
            <div className="relative h-full w-full max-h-[95vh] max-w-[50vh] aspect-[9/16] flex flex-col">
                {/* Progress Bars */}
                <div className="absolute top-2 left-2 right-2 flex space-x-1 z-10">
                    {currentUserGroup.stories.map((story, index) => (
                        <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                           <div
                                className="h-full bg-white"
                                style={{ 
                                    width: '100%',
                                    transformOrigin: 'left',
                                    transform: index < currentStoryIndex ? 'scaleX(1)' : index === currentStoryIndex ? 'scaleX(1)' : 'scaleX(0)',
                                    transition: index === currentStoryIndex && !isPaused ? 'transform 5s linear' : 'none'
                                }}
                           />
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
                    <div className="flex items-center space-x-2 pt-2">
                        <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full" />
                        <span className="text-white font-semibold">{author.name}</span>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-white z-20">
                    <CloseIcon />
                </button>
                
                {/* Story Image and Click Handler */}
                <div 
                    className="flex-1 w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
                >
                    <img 
                        src={currentStory.imageUrl} 
                        alt={`Story by ${author.name}`}
                        className="w-full h-full object-cover"
                    />
                </div>
                 {/* Navigation Overlay */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/3 h-full" onClick={goToPrevStory}></div>
                    <div className="w-1/3 h-full"></div>
                    <div className="w-1/3 h-full" onClick={goToNextStory}></div>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
