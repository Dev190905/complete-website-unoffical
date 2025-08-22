// Existing types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  branch: string;
  year: number;
  avatarUrl?: string;
  isAdmin: boolean;
  friends: string[]; // array of user IDs
  friendRequestsSent: string[]; // array of user IDs
  friendRequestsReceived: string[]; // array of user IDs
}

export type SignupData = Omit<User, 'id' | 'isAdmin' | 'friends' | 'friendRequestsSent' | 'friendRequestsReceived' > & { password: string };

// Step 2: Notices
export type NoticeCategory = 'Exam' | 'Event' | 'General' | 'Scholarship' | 'Club';
export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  date: string; // ISO string
  postedBy: string; // User name
}

// Step 3: Forums
export interface Reply {
  id: string;
  content: string;
  author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl'>;
  timestamp: string; // ISO string
  upvotes: number;
  downvotes: number;
}
export interface Topic {
  id: string;
  title: string;
  description: string;
  author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl'>;
  timestamp: string; // ISO string
  replies: Reply[];
  likes: string[]; // array of user IDs
  upvotes: number;
  downvotes: number;
}

// Step 4: Resources
export interface Resource {
  id: string;
  title: string;
  description: string;
  link?: string;
  fileName?: string;
  tags: string[];
  uploadedBy: string; // User name
  uploadDate: string; // ISO string
}

// Step 5: Events
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  organizer: string;
  rsvps: string[]; // array of user IDs
}

// Step 6: Marketplace
export interface MarketItem {
  id:string;
  name: string;
  description: string;
  price?: number;
  seller: Pick<User, 'id' | 'name' | 'email' | 'username'>;
  imageUrl?: string;
}

// Step 7: Placements
export interface Placement {
  id: string;
  companyName: string;
  role: string;
  salaryPackage: string;
  eligibility: string;
  interested: string[]; // array of user IDs
}

// Step 8: Map
export interface MapMarker {
  id: string;
  name: string;
  description: string;
  position: { top: string; left: string };
}

// Generic Chatbot Types
export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

// New types for social features
export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string; // formed by sorting and joining two user IDs
  participants: string[]; // array of two user IDs
  messages: DirectMessage[];
}

// New types for Stories and Notes
export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: string; // ISO string
  expiresAt: string; // ISO string
  viewedBy: string[]; // array of user IDs
}

export interface Note {
  userId: string;
  content: string;
  expiresAt: string; // ISO string
}

// BEST UPDATES TYPES
export interface Notification {
  id: string;
  message: string;
  link: string;
  timestamp: string;
  read: boolean;
}

export interface SearchResults {
  users: User[];
  topics: Topic[];
  resources: Resource[];
  events: Event[];
}


// --- CENTRALIZED AUTH CONTEXT TYPE ---
export interface AuthContextType {
  // Auth & User
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  
  // Social
  allUsers: User[];
  sendFriendRequest: (recipientId: string) => Promise<void>;
  acceptFriendRequest: (senderId: string) => Promise<void>;
  declineFriendRequest: (senderId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getConversation: (friendId: string) => Conversation | undefined;
  sendMessage: (recipientId: string, text: string) => Promise<void>;
  conversations: Conversation[];
  refreshUser: () => void;

  // Admin Controls
  toggleAdminStatus: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Centralized State
  notices: Notice[];
  addNotice: (data: Omit<Notice, 'id' | 'date' | 'postedBy'>) => void;
  updateNotice: (id: string, data: Partial<Omit<Notice, 'id' | 'date' | 'postedBy'>>) => void;
  deleteNotice: (id: string) => void;

  topics: Topic[];
  addTopic: (data: Omit<Topic, 'id' | 'timestamp' | 'author' | 'replies' | 'upvotes' | 'downvotes' | 'likes'>) => Topic;
  updateTopic: (id: string, data: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  addReply: (topicId: string, content: string) => void;

  resources: Resource[];
  addResource: (data: Omit<Resource, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  deleteResource: (id: string) => void;

  events: Event[];
  addEvent: (data: Omit<Event, 'id' | 'rsvps'>) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  marketplaceItems: MarketItem[];
  addMarketplaceItem: (data: Omit<MarketItem, 'id' | 'seller'>) => void;
  deleteMarketplaceItem: (id: string) => void;
  
  placements: Placement[];
  addPlacement: (data: Omit<Placement, 'id' | 'interested'>) => void;
  updatePlacement: (id: string, data: Partial<Placement>) => void;
  deletePlacement: (id: string) => void;

  // Stories & Notes
  stories: Story[];
  notes: Note[];
  addStory: (imageUrl: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  addNote: (content: string) => Promise<void>;
  deleteNote: () => Promise<void>;
  
  // BEST UPDATES
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  searchPortal: (query: string) => SearchResults;
  askAIAboutPortal: (query: string) => Promise<string>;
  toggleTopicLike: (topicId: string) => void;
}

// Theme context types
export type Theme = 'default-blue' | 'forest-green' | 'deep-purple';

export interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}