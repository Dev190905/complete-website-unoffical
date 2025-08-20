import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { User, AuthContextType, SignupData, Conversation, Notice, Topic, Reply, Resource, Event, MarketItem, Placement, Story, Note, SearchResults, Notification } from '../types';

// --- STORAGE KEYS ---
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

// --- INITIAL DATA SEEDING (PRODUCTION-READY) ---
const getInitialUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Seed with ONLY the primary admin account for a clean deployment.
    return [
        {
            id: 'admin_user_01', name: 'Devendar Dharmana', username: 'devendar', email: 'dharmanadevendar@gmail.com', branch: 'Computer Science', year: 4,
            avatarUrl: `https://i.pravatar.cc/150?u=devendar`, isAdmin: true,
            friends: [], friendRequestsSent: [], friendRequestsReceived: [],
        },
    ];
};
// All other initial data is now empty for a clean deployment.
const getInitialNotices = (): Notice[] => getFromStorage(NOTICES_STORAGE_KEY, []);
const getInitialTopics = (): Topic[] => getFromStorage(TOPICS_STORAGE_KEY, []);
const getInitialResources = (): Resource[] => getFromStorage(RESOURCES_STORAGE_KEY, []);
const getInitialEvents = (): Event[] => getFromStorage(EVENTS_STORAGE_KEY, []);
const getInitialMarketplaceItems = (): MarketItem[] => getFromStorage(MARKETPLACE_STORAGE_KEY, []);
const getInitialPlacements = (): Placement[] => getFromStorage(PLACEMENTS_STORAGE_KEY, []);


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Centralized Data States
  const [allUsers, setAllUsers] = useState<User[]>(getInitialUsers);
  const [conversations, setConversations] = useState<Conversation[]>(() => getFromStorage(CONVERSATIONS_STORAGE_KEY, []));
  const [notices, setNotices] = useState<Notice[]>(getInitialNotices);
  const [topics, setTopics] = useState<Topic[]>(getInitialTopics);
  const [resources, setResources] = useState<Resource[]>(getInitialResources);
  const [events, setEvents] = useState<Event[]>(getInitialEvents);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketItem[]>(getInitialMarketplaceItems);
  const [placements, setPlacements] = useState<Placement[]>(getInitialPlacements);
  const [stories, setStories] = useState<Story[]>(() => getFromStorage(STORIES_STORAGE_KEY, []));
  const [notes, setNotes] = useState<Note[]>(() => getFromStorage(NOTES_STORAGE_KEY, []));
  const [notifications, setNotifications] = useState<Notification[]>(() => getFromStorage(NOTIFICATIONS_STORAGE_KEY, []));

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(marketplaceItems)); }, [marketplaceItems]);
  useEffect(() => { localStorage.setItem(PLACEMENTS_STORAGE_KEY, JSON.stringify(placements)); }, [placements]);
  useEffect(() => { localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications)); }, [notifications]);

  // --- USER SESSION & DATA CLEANUP ---
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('portalUser');
      if (storedUser) {
        // Sync with latest user data from allUsers list
        const parsedUser = JSON.parse(storedUser);
        const freshUser = allUsers.find(u => u.id === parsedUser.id);
        setUser(freshUser || null);
      }
      // Cleanup expired stories and notes on load
      const now = new Date();
      const activeStories = getFromStorage<Story[]>(STORIES_STORAGE_KEY, []).filter(s => new Date(s.expiresAt) > now);
      setStories(activeStories);
      const activeNotes = getFromStorage<Note[]>(NOTES_STORAGE_KEY, []).filter(n => new Date(n.expiresAt) > now);
      setNotes(activeNotes);
    } catch (error) { console.error("Failed to parse user from localStorage", error); } 
    finally { setLoading(false); }
  }, []); // Only run on initial load

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
  
  // --- BEST UPDATES: NOTIFICATIONS ---
  const addNotification = useCallback((userId: string, message: string, link: string) => {
    // We only add notifications for the currently logged-in user for this simulation
    if (user && userId === user.id) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        message,
        link,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20
    }
  }, [user]);

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- AUTHENTICATION ---
  const login = async (username: string, password: string): Promise<void> => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!foundUser) throw new Error("User not found");
    // Password check is mocked
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
      isAdmin: false, // New users are never admins by default
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


  // --- ADMIN CONTROLS ---
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

  // --- SOCIAL FEATURES ---
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

  // --- STORIES & NOTES FEATURES ---
  const addStory = async (imageUrl: string): Promise<void> => {
    if (!user) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: user.id,
      imageUrl,
      timestamp: now.toISOString(),
      expiresAt,
      viewedBy: [user.id],
    };
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

  const addNote = async (content: string): Promise<void> => { if (!user) return; const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); const newNote: Note = { userId: user.id, content, expiresAt, }; setNotes(prev => { const otherNotes = prev.filter(n => n.userId !== user.id); return [...otherNotes, newNote]; }); };
  const deleteNote = async (): Promise<void> => { if (!user) return; setNotes(prev => prev.filter(n => n.userId !== user.id)); };

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
  
  // --- BEST UPDATES: SEARCH & LIKES & AI ---
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
      stories, notes, addStory, viewStory, addNote, deleteNote,
      notifications, markNotificationsAsRead, searchPortal, askAIAboutPortal, toggleTopicLike
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
