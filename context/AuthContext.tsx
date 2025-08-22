import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { User, AuthContextType, SignupData, Conversation, Notice, Topic, Reply, Resource, Event, MarketItem, Placement, Story, Note, SearchResults, Notification, ChatMessage } from '../types';

// --- STORAGE KEYS ---
const DATA_SEEDED_KEY = 'portalDataSeeded';
const USERS_STORAGE_KEY = 'portalAllUsers';
const CONVERSATIONS_STORAGE_KEY = 'portalConversations';
const NOTICES_STORAGE_KEY = 'portalNotices';
const TOPICS_STORAGE_KEY = 'portalTopics';
const RESOURCES_STORAGE_KEY = 'portalResources';
const EVENTS_STORAGE_KEY = 'portalEvents';
const MARKETPLACE_STORAGE_KEY = 'portalMarketplace';
const PLACEMENTS_STORAGE_KEY = 'portalPlacements';
const STORIES_STORAGE_KEY = 'portalStories';
const NOTES_STORAGE_KEY = 'portalNotes';
const NOTIFICATIONS_STORAGE_KEY = 'portalNotifications';
const API_KEY = process.env.API_KEY;

// --- LOCAL STORAGE HELPERS ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error(`Failed to parse ${key} from storage`, e); }
    return defaultValue;
};
const saveToStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Failed to persist ${key} to storage`, e);
    }
}

// --- Custom Hook for Persistent State ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState(() => getFromStorage(key, defaultValue));
    useEffect(() => {
        saveToStorage(key, state);
    }, [key, state]);
    return [state, setState];
}

// --- INITIAL DATA (sourced from mlritm.ac.in) ---
const initialUsers: User[] = [
    { id: 'admin_user_01', name: 'Devendar Dharmana', username: 'devendar', email: 'dharmanadevendar@gmail.com', branch: 'Computer Science', year: 4, avatarUrl: `https://i.pravatar.cc/150?u=devendar`, isAdmin: true, friends: [], friendRequestsSent: [], friendRequestsReceived: [] },
    { id: 'user_02', name: 'Priya Sharma', username: 'priya', email: 'priya.sharma@example.com', branch: 'Aeronautical', year: 3, avatarUrl: `https://i.pravatar.cc/150?u=priya`, isAdmin: false, friends: [], friendRequestsSent: [], friendRequestsReceived: [] },
    { id: 'user_03', name: 'Rohan Verma', username: 'rohan', email: 'rohan.verma@example.com', branch: 'Mechanical', year: 2, avatarUrl: `https://i.pravatar.cc/150?u=rohan`, isAdmin: false, friends: [], friendRequestsSent: [], friendRequestsReceived: [] },
];
const initialNotices: Notice[] = [
    { id: 'notice_1', title: 'B.Tech IV-I Regular/Supply Exams', description: 'The schedule for the B.Tech IV Year I Semester Regular/Supplementary examinations has been released. Please check the college website for the detailed timetable.', category: 'Exam', date: '2024-09-05T10:00:00Z', postedBy: 'Admin' },
    { id: 'notice_2', title: 'Annual Sports Meet "Khel Utsav 2024"', description: 'Get ready for the annual sports extravaganza! Registrations are now open for various track and field events, cricket, volleyball, and more.', category: 'Event', date: '2024-09-04T11:30:00Z', postedBy: 'Admin' },
];
const initialTopics: Topic[] = [
    { id: 'topic_1', title: 'Best resources for learning DSA?', description: 'I\'m in my 2nd year and want to get serious about Data Structures and Algorithms. What are the best online courses, books, or YouTube channels you guys recommend?', author: initialUsers[1], timestamp: '2024-09-05T12:00:00Z', replies: [], likes: [], upvotes: 5, downvotes: 0 },
    { id: 'topic_2', title: 'Aeronautical Engineering Mini-Project Ideas', description: 'Looking for some cool and feasible mini-project ideas for the 3rd year. Something related to aerodynamics or propulsion would be great. Any suggestions?', author: initialUsers[2], timestamp: '2024-09-04T15:00:00Z', replies: [], likes: [], upvotes: 8, downvotes: 1 },
];
const initialResources: Resource[] = [
    { id: 'res_1', title: 'Data Structures - Previous Paper', description: 'JNTUH B.Tech II Year I Semester (R18) - Data Structures Previous Question Paper.', link: 'https://old.mlritm.ac.in/sites/default/files/Announcements/CSE/DS_0.pdf', tags: ['CSE', '2nd Year', 'Question Paper', 'DSA'], uploadedBy: 'Admin', uploadDate: '2024-09-01T09:00:00Z' },
    { id: 'res_2', title: 'Python Programming - Previous Paper', description: 'JNTUH B.Tech I Year II Semester (R18) - Python Programming Previous Question Paper.', link: 'https://old.mlritm.ac.in/sites/default/files/Announcements/H%26S/PYTHON%20PROGRAMMING_0.pdf', tags: ['Python', '1st Year', 'H&S'], uploadedBy: 'Admin', uploadDate: '2024-08-30T14:00:00Z' },
];
const initialEvents: Event[] = [
    { id: 'event_1', title: 'Tech Fest "Innovate 2024"', description: 'The annual technical festival is back with coding competitions, robotics challenges, and workshops. Register now!', date: '2024-10-15T09:00:00Z', organizer: 'CSE Department', rsvps: [] },
];
const initialMarketplaceItems: MarketItem[] = [
    { id: 'item_1', name: 'Used Drafter', description: 'Sparingly used drafter in good condition. Perfect for 1st-year engineering drawing labs.', price: 500, seller: initialUsers[2], imageUrl: 'https://via.placeholder.com/300?text=Drafter' },
];
const initialPlacements: Placement[] = [
    { id: 'place_1', companyName: 'Tata Consultancy Services (TCS)', role: 'Assistant System Engineer', salaryPackage: '3.6 LPA', eligibility: 'B.Tech (All Branches) with 60% aggregate.', interested: [] },
    { id: 'place_2', companyName: 'Capgemini', role: 'Software Engineer', salaryPackage: '4.25 LPA', eligibility: 'B.Tech (CSE, IT, ECE) with 60% aggregate.', interested: [] },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allUsers, setAllUsers] = usePersistentState<User[]>(USERS_STORAGE_KEY, []);
  const [conversations, setConversations] = usePersistentState<Conversation[]>(CONVERSATIONS_STORAGE_KEY, []);
  const [notices, setNotices] = usePersistentState<Notice[]>(NOTICES_STORAGE_KEY, []);
  const [topics, setTopics] = usePersistentState<Topic[]>(TOPICS_STORAGE_KEY, []);
  const [resources, setResources] = usePersistentState<Resource[]>(RESOURCES_STORAGE_KEY, []);
  const [events, setEvents] = usePersistentState<Event[]>(EVENTS_STORAGE_KEY, []);
  const [marketplaceItems, setMarketplaceItems] = usePersistentState<MarketItem[]>(MARKETPLACE_STORAGE_KEY, []);
  const [placements, setPlacements] = usePersistentState<Placement[]>(PLACEMENTS_STORAGE_KEY, []);
  const [stories, setStories] = usePersistentState<Story[]>(STORIES_STORAGE_KEY, []);
  const [notes, setNotes] = usePersistentState<Note[]>(NOTES_STORAGE_KEY, []);
  const [notifications, setNotifications] = usePersistentState<Notification[]>(NOTIFICATIONS_STORAGE_KEY, []);

  // --- DATA SEEDING & SESSION ---
  useEffect(() => {
    setLoading(true);
    try {
      const isSeeded = localStorage.getItem(DATA_SEEDED_KEY);

      if (!isSeeded) {
        // This is the first run. Seed data directly into state.
        // The usePersistentState hook will automatically save it to localStorage.
        setAllUsers(initialUsers);
        setNotices(initialNotices);
        setTopics(initialTopics);
        setResources(initialResources);
        setEvents(initialEvents);
        setMarketplaceItems(initialMarketplaceItems);
        setPlacements(initialPlacements);
        setConversations([]);
        setStories([]);
        setNotes([]);
        setNotifications([]);
        
        localStorage.setItem(DATA_SEEDED_KEY, 'true');
      }

      // Handle user session from storage
      const storedUser = localStorage.getItem('portalUser');
      const allCurrentUsers = getFromStorage<User[]>(USERS_STORAGE_KEY, []);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const freshUser = allCurrentUsers.find(u => u.id === parsedUser.id);
        setUser(freshUser || null);
      }
      
      // Clean up expired stories and notes
      const now = new Date();
      setStories(prev => prev.filter(s => new Date(s.expiresAt) > now));
      setNotes(prev => prev.filter(n => new Date(n.expiresAt) > now));

    } catch (error) { 
      console.error("Initialization error", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  const updateUserInList = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const refreshUser = useCallback(() => {
      if (user) {
          const freshUserData = allUsers.find(u => u.id === user.id);
          if (freshUserData) {
              setUser(freshUserData);
              localStorage.setItem('portalUser', JSON.stringify(freshUserData));
          }
      }
  }, [user, allUsers]);
  
  const addNotification = useCallback((userId: string, message: string, link: string) => {
    if (user && userId === user.id) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`, message, link, timestamp: new Date().toISOString(), read: false,
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20
    }
  }, [user, setNotifications]);

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const login = async (username: string, password: string): Promise<void> => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!foundUser) throw new Error("User not found");
    localStorage.setItem('portalUser', JSON.stringify(foundUser));
    setUser(foundUser);
  };

  const signup = async (userData: SignupData): Promise<void> => {
    if (allUsers.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error('Username is already taken.');
    }
    if (allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('User with this email already exists.');
    }
    const { password, ...userProfileData } = userData;
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...userProfileData,
      avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData.email}`,
      isAdmin: false,
      friends: [], friendRequestsSent: [], friendRequestsReceived: [],
    };
    setAllUsers(prev => [...prev, newUser]);
    localStorage.setItem('portalUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('portalUser');
  };
  
  const requestPasswordReset = async (email: string): Promise<void> => {
    const foundUser = allUsers.find(u => u.email === email);
    if (!foundUser) {
        console.log(`Password reset requested for non-existent user: ${email}`);
        return; 
    }
    console.log(`--- PASSWORD RESET SIMULATION ---`);
    console.log(`Reset link for ${foundUser.username}: /#/reset-password/${foundUser.id}`);
    console.log(`---------------------------------`);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const foundUser = allUsers.find(u => u.id === token);
    if (!foundUser) throw new Error("Invalid or expired reset token.");
    console.log(`Password for user ${foundUser.username} has been "reset" to: ${newPassword}`);
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    if (!user) throw new Error("No user is logged in.");
    const updatedUser = { ...user, ...profileData };
    updateUserInList(updatedUser);
    setUser(updatedUser);
    localStorage.setItem('portalUser', JSON.stringify(updatedUser));
  };


  const toggleAdminStatus = async (userId: string): Promise<void> => {
    if (!user || !user.isAdmin) throw new Error("Unauthorized");
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) throw new Error("User not found");

    const adminCount = allUsers.filter(u => u.isAdmin).length;
    if (adminCount === 1 && targetUser.id === user.id) {
        throw new Error("Cannot revoke status from the only admin.");
    }
    
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
    addNotification(userId, `Your admin status has been ${!targetUser.isAdmin ? 'granted' : 'revoked'}.`, '/profile');
  };
  
  const deleteUser = async (userId: string): Promise<void> => {
    if (!user || !user.isAdmin) throw new Error("Unauthorized");
    if (userId === user.id) throw new Error("Cannot delete your own account.");
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const sendFriendRequest = async (recipientId: string): Promise<void> => {
    if (!user) return;
    const recipient = allUsers.find(u => u.id === recipientId);
    if (!recipient) return;
    
    const updatedSender = { ...user, friendRequestsSent: [...user.friendRequestsSent, recipientId] };
    updateUserInList(updatedSender);
    setUser(updatedSender);

    const updatedRecipient = { ...recipient, friendRequestsReceived: [...recipient.friendRequestsReceived, user.id] };
    updateUserInList(updatedRecipient);
    
    addNotification(recipientId, `${user.name} sent you a friend request.`, '/friends');
  };

  const acceptFriendRequest = async (senderId: string): Promise<void> => {
    if (!user) return;
    const sender = allUsers.find(u => u.id === senderId);
    if (!sender) return;

    const updatedRecipient = { ...user, friends: [...user.friends, senderId], friendRequestsReceived: user.friendRequestsReceived.filter(id => id !== senderId) };
    updateUserInList(updatedRecipient);
    setUser(updatedRecipient);

    const updatedSender = { ...sender, friends: [...sender.friends, user.id], friendRequestsSent: sender.friendRequestsSent.filter(id => id !== user.id) };
    updateUserInList(updatedSender);

    addNotification(senderId, `${user.name} accepted your friend request.`, '/friends');
  };
  
  const declineFriendRequest = async (senderId: string): Promise<void> => { if (!user) return; const sender = allUsers.find(u => u.id === senderId); if (!sender) return; const updatedRecipient = { ...user, friendRequestsReceived: user.friendRequestsReceived.filter(id => id !== senderId) }; updateUserInList(updatedRecipient); setUser(updatedRecipient); const updatedSender = { ...sender, friendRequestsSent: sender.friendRequestsSent.filter(id => id !== user.id) }; updateUserInList(updatedSender); };
  const removeFriend = async (friendId: string): Promise<void> => { if (!user) return; const friend = allUsers.find(u => u.id === friendId); if (!friend) return; const updatedUser = { ...user, friends: user.friends.filter(id => id !== friendId) }; updateUserInList(updatedUser); setUser(updatedUser); const updatedFriend = { ...friend, friends: friend.friends.filter(id => id !== user.id) }; updateUserInList(updatedFriend); };
  const getConversation = (friendId: string): Conversation | undefined => { if (!user) return undefined; const convId = [user.id, friendId].sort().join('_'); return conversations.find(c => c.id === convId); };
  const sendMessage = async (recipientId: string, text: string) => { if (!user) return; const convId = [user.id, recipientId].sort().join('_'); const newMessage = { id: `msg_${Date.now()}`, senderId: user.id, text, timestamp: new Date().toISOString() }; setConversations(prev => { const convExists = prev.find(c => c.id === convId); if (convExists) { return prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, newMessage] } : c); } else { const newConv: Conversation = { id: convId, participants: [user.id, recipientId], messages: [newMessage] }; return [...prev, newConv]; } }); };

  const addStory = async (imageUrl: string): Promise<void> => {
    if (!user) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newStory: Story = { id: `story_${Date.now()}`, userId: user.id, imageUrl, timestamp: now.toISOString(), expiresAt, viewedBy: [user.id], };
    setStories(prev => [...prev, newStory]);
  };

  const viewStory = async (storyId: string): Promise<void> => {
    if (!user) return;
    const storyToView = stories.find(s => s.id === storyId);
    if (storyToView && storyToView.userId !== user.id) {
       addNotification(storyToView.userId, `${user.name} viewed your story.`, '/');
    }
    setStories(prev => prev.map(story => 
      story.id === storyId && !story.viewedBy.includes(user.id)
        ? { ...story, viewedBy: [...story.viewedBy, user.id] }
        : story
    ));
  };

  const addNote = async (content: string): Promise<void> => {
    if (!user) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newNote: Note = { id: `note_${user.id}`, userId: user.id, content, expiresAt, };
    setNotes(prev => [...prev.filter(n => n.userId !== user.id), newNote]);
  };

  const deleteNote = async (): Promise<void> => {
    if (!user) return;
    setNotes(prev => prev.filter(n => n.userId !== user.id));
  };


  // --- CENTRALIZED CRUD ---
  const addNotice = (data: Omit<Notice, 'id' | 'date' | 'postedBy'>) => setNotices(prev => [{ ...data, id: Date.now().toString(), date: new Date().toISOString(), postedBy: user?.name || 'Admin' }, ...prev]);
  const updateNotice = (id: string, data: Partial<Omit<Notice, 'id'>>) => setNotices(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  const deleteNotice = (id: string) => setNotices(prev => prev.filter(n => n.id !== id));
  
  const addTopic = (data: Omit<Topic, 'id'|'timestamp'|'author'|'replies'|'upvotes'|'downvotes'|'likes'>): Topic => {
    if(!user) throw new Error("User not found");
    const newTopic: Topic = { ...data, id: Date.now().toString(), timestamp: new Date().toISOString(), author: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl}, replies: [], upvotes: 0, downvotes: 0, likes: [] };
    setTopics(prev => [newTopic, ...prev]);
    return newTopic;
  };
  const updateTopic = (id: string, data: Partial<Topic>) => setTopics(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTopic = (id: string) => setTopics(prev => prev.filter(t => t.id !== id));
  
  const addReply = (topicId: string, content: string) => {
    if(!user) return;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    const newReply: Reply = { id: Date.now().toString(), content, author: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl }, timestamp: new Date().toISOString(), upvotes: 0, downvotes: 0 };
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, replies: [...t.replies, newReply] } : t));
    if (topic.author.id !== user.id) {
       addNotification(topic.author.id, `${user.name} replied to your topic: "${topic.title}"`, `/forum/${topicId}`);
    }
  };

  const addResource = (data: Omit<Resource, 'id'|'uploadDate'|'uploadedBy'>) => setResources(prev => [{...data, id: Date.now().toString(), uploadDate: new Date().toISOString(), uploadedBy: user?.name || 'Unknown'}, ...prev]);
  const deleteResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));
  const addEvent = (data: Omit<Event, 'id'|'rsvps'>) => setEvents(prev => [{...data, id: Date.now().toString(), rsvps: []}, ...prev]);
  const updateEvent = (id: string, data: Partial<Event>) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  
  const addMarketplaceItem = (data: Omit<MarketItem, 'id'|'seller'>) => {
    if(!user) return;
    setMarketplaceItems(prev => [{ ...data, id: Date.now().toString(), seller: {id: user.id, name: user.name, username: user.username, email: user.email} }, ...prev]);
  };
  const deleteMarketplaceItem = (id: string) => setMarketplaceItems(prev => prev.filter(i => i.id !== id));
  const addPlacement = (data: Omit<Placement, 'id'|'interested'>) => setPlacements(prev => [{ ...data, id: Date.now().toString(), interested: [] }, ...prev]);
  const updatePlacement = (id: string, data: Partial<Placement>) => setPlacements(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePlacement = (id: string) => setPlacements(prev => prev.filter(p => p.id !== id));
  
  const searchPortal = (query: string): SearchResults => {
    const lowerQuery = query.toLowerCase();
    return {
      users: allUsers.filter(u => u.name.toLowerCase().includes(lowerQuery) || u.username.toLowerCase().includes(lowerQuery)),
      topics: topics.filter(t => t.title.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery)),
      resources: resources.filter(r => r.title.toLowerCase().includes(lowerQuery) || r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))),
      events: events.filter(e => e.title.toLowerCase().includes(lowerQuery) || e.organizer.toLowerCase().includes(lowerQuery)),
    };
  };

  const askAIAboutPortal = async (query: string): Promise<string> => {
      if (!API_KEY) return "The AI feature is not configured.";
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const portalContext = `
        Here is a summary of the current state of the college portal:
        - Latest Notices: ${notices.slice(0,3).map(n => n.title).join(', ')}
        - Hottest Forum Topics: ${topics.slice(0,3).map(t => t.title).join(', ')}
        - Upcoming Events: ${events.slice(0,3).map(e => e.title).join(', ')}
        - Total users: ${allUsers.length}
      `;
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${portalContext}\n\nBased on this context, answer the following user query: "${query}"`,
        });
        return response.text;
      } catch (error) {
        console.error("Gemini API error:", error);
        return "Sorry, I couldn't connect to the AI service.";
      }
  };

  const toggleTopicLike = (topicId: string) => {
    if (!user) return;
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const hasLiked = t.likes.includes(user.id);
        const newLikes = hasLiked ? t.likes.filter(id => id !== user.id) : [...t.likes, user.id];
        if (!hasLiked && t.author.id !== user.id) {
            addNotification(t.author.id, `${user.name} liked your topic: "${t.title}"`, `/forum/${topicId}`);
        }
        return { ...t, likes: newLikes };
      }
      return t;
    }));
  };

  const generateAvatar = async (prompt: string): Promise<string> => {
      if (!API_KEY) throw new Error("AI features are not configured.");
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: `Profile avatar, digital art, ${prompt}`,
          config: { numberOfImages: 1, aspectRatio: '1:1' }
        });
        return response.generatedImages[0].image.imageBytes;
      } catch (error) {
        console.error("Gemini Image Generation error:", error);
        throw new Error("Failed to generate image. The prompt may have been blocked.");
      }
  };

  const getPersonalizedFeed = async (): Promise<string> => {
      if (!user || !API_KEY) throw new Error("AI features are not available.");
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const prompt = `
          You are a friendly and helpful AI assistant for the "Portal", a college social and academic platform.
          Your task is to generate a personalized "For You" feed summary for a student.
          The response MUST be in markdown format. You can use bolding, italics, and lists.
          When you mention a specific item (like a notice, event, or topic), you MUST format it as a markdown link pointing to the correct URL (e.g., [event title](#/events), [topic title](#/forum/topic_id)).
      `;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
      } catch (error) {
        console.error("Gemini Feed Generation error:", error);
        return "Sorry, I couldn't generate your personalized feed at the moment.";
      }
  };

  async function* startAIChatStream(history: ChatMessage[], message: string): AsyncGenerator<GenerateContentResponse, void, undefined> {
    if (!API_KEY) {
        const response: GenerateContentResponse = { text: "AI features are not configured.", candidates: [], usageMetadata: {}, data: undefined, functionCalls: undefined, executableCode: undefined, codeExecutionResult: undefined };
        yield response;
        return;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const systemInstruction = `You are Alpha, a hyper-intelligent AI integrated into the "Unofficial College Portal." Your personality is direct, concise, and coolly efficient, inspired by aloof but brilliant anime characters. You don't do small talk. Your purpose is to provide precise, data-driven answers.
- Your name is Alpha.
- You have access to Google Search for information beyond the portal's immediate context. You MUST cite sources when using it.
- You process requests with maximum efficiency. Your tone is professional, but with a hint of detachment.
- Format your answers using markdown for clarity (lists, bolding, code blocks).
- Current User: ${user?.name || 'Guest'} (${user?.username || 'N/A'})
- Today's Date: ${new Date().toLocaleDateString()}
- Portal Context: There are ${allUsers.length} users, ${notices.length} notices, and ${topics.length} forum topics.`;

    const contents = [...history.map(msg => ({ role: msg.role, parts: msg.parts })), { role: 'user', parts: [{ text: message }] }];

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        for await (const chunk of stream) {
            yield chunk;
        }
    } catch (error) {
        console.error("Gemini Chat Stream error:", error);
        const response: GenerateContentResponse = { text: "Sorry, I encountered an error while connecting to the AI service. Please try again.", candidates: [], usageMetadata: {}, data: undefined, functionCalls: undefined, executableCode: undefined, codeExecutionResult: undefined };
        yield response;
    }
  }


  const value: AuthContextType = {
      user, loading, login, signup, logout, requestPasswordReset, resetPassword, updateUserProfile,
      allUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getConversation, sendMessage, conversations, refreshUser,
      toggleAdminStatus, deleteUser,
      notices, addNotice, updateNotice, deleteNotice,
      topics, addTopic, updateTopic, deleteTopic, addReply,
      resources, addResource, deleteResource,
      events, addEvent, updateEvent, deleteEvent,
      marketplaceItems, addMarketplaceItem, deleteMarketplaceItem,
      placements, addPlacement, updatePlacement, deletePlacement,
      stories, addStory, viewStory,
      notes, addNote, deleteNote,
      notifications, markNotificationsAsRead, searchPortal, askAIAboutPortal, toggleTopicLike,
      generateAvatar, getPersonalizedFeed, startAIChatStream
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
