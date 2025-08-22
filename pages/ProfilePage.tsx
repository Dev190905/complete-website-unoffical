
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, Topic } from '../types';
import { Link } from 'react-router-dom';
import AIImageGeneratorModal from '../components/AIImageGeneratorModal';


const ProfilePage: React.FC = () => {
    const { user, updateUserProfile, topics } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<Partial<User>>({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                branch: user.branch,
                year: user.year,
                avatarUrl: user.avatarUrl
            });
        }
    }, [user]);
    
    const userTopics = useMemo(() => {
        return topics
            .filter(topic => topic.author.id === user?.id)
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [topics, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: name === 'year' ? Number(value) : value }));
    };

    const handleAvatarGenerated = (base64Image: string) => {
        setProfileData(prev => ({ ...prev, avatarUrl: `data:image/png;base64,${base64Image}` }));
        setIsAiModalOpen(false);
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            await updateUserProfile(profileData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError((err as Error).message || 'Failed to update profile.');
        }
    };

    if (!user) {
        return <p>Loading profile...</p>;
    }
    
    const EditField: React.FC<{ label: string; name: string; value: string | number | undefined; onChange: any, type?: string, children?: React.ReactNode, extraButton?: React.ReactNode }> = ({ label, name, value, onChange, type = 'text', children, extraButton }) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
            <div className="flex items-center space-x-2">
              {type === 'select' ? (
                  <select id={name} name={name} value={value} onChange={onChange} className="input-glow-effect mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2">
                      {children}
                  </select>
              ) : (
                  <input
                      id={name} name={name} type={type}
                      value={value || ''}
                      onChange={onChange}
                      className="input-glow-effect mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2"
                  />
              )}
              {extraButton}
            </div>
        </div>
    );

    return (
        <>
            {isAiModalOpen && <AIImageGeneratorModal onImageGenerated={handleAvatarGenerated} onClose={() => setIsAiModalOpen(false)} />}
            <div className="max-w-4xl mx-auto">
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-lg text-center mb-4">{error}</p>}
                {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-lg text-center mb-4 animate-fade-in">{success}</p>}
                
                {/* Profile Header */}
                <div className="premium-glass-card rounded-t-lg p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                        <img 
                            src={profileData.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 flex-shrink-0"
                        />
                        <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                            <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
                            <p className="text-lg text-slate-400">@{user.username}</p>
                            <p className="text-slate-300 mt-2">{profileData.branch} - {profileData.year}{['st', 'nd', 'rd', 'th'][profileData.year! - 1]} Year</p>
                            <div className="flex justify-center sm:justify-start items-center space-x-6 mt-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{user.friends.length}</p>
                                    <p className="text-sm text-slate-400">Friends</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{userTopics.length}</p>
                                    <p className="text-sm text-slate-400">Topics</p>
                                </div>
                            </div>
                        </div>
                         <button onClick={() => setIsEditing(prev => !prev)} className="mt-4 sm:mt-0 px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors flex-shrink-0">
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                         </button>
                    </div>
                </div>

                {isEditing ? (
                    // Edit Form
                    <div className="premium-glass-card rounded-b-lg border-t-0 p-6 md:p-8 space-y-4 animate-fade-in-down">
                        <EditField label="Name" name="name" value={profileData.name} onChange={handleInputChange} />
                        <EditField label="Branch" name="branch" value={profileData.branch} onChange={handleInputChange} />
                        <EditField label="Year" name="year" value={profileData.year} onChange={handleInputChange} type="select">
                            <option value={1}>1st</option>
                            <option value={2}>2nd</option>
                            <option value={3}>3rd</option>
                            <option value={4}>4th</option>
                        </EditField>
                        <EditField 
                            label="Avatar URL" 
                            name="avatarUrl" 
                            value={profileData.avatarUrl} 
                            onChange={handleInputChange}
                            extraButton={
                                <button onClick={() => setIsAiModalOpen(true)} className="mt-1 h-[50px] px-4 bg-primary-600 hover:bg-primary-700 rounded-md font-semibold text-sm transition-colors" title="Generate with AI">
                                    ✨ AI
                                </button>
                            }
                        />
                         <div className="pt-4">
                            <button onClick={handleSave} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    // Activity Feed
                    <div className="premium-glass-card rounded-b-lg border-t-0 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {userTopics.length > 0 ? userTopics.map(topic => (
                                 <Link key={topic.id} to={`/forum/${topic.id}`} className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                                    <p className="font-semibold text-primary-400">{topic.title}</p>
                                    <p className="text-xs text-slate-400">Posted on {new Date(topic.timestamp).toLocaleDateString()}</p>
                                 </Link>
                            )) : (
                                <p className="text-slate-500">No recent activity to show.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProfilePage;