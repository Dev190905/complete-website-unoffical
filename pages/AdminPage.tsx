import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, Notice, Topic, Resource, Event, MarketItem, Placement } from '../types';

type Tab = 'analytics' | 'users' | 'notices' | 'topics' | 'resources' | 'events' | 'marketplace' | 'placements';

const AdminPage: React.FC = () => {
    const { 
        user: currentUser, allUsers, toggleAdminStatus, deleteUser,
        notices, deleteNotice,
        topics, deleteTopic,
        resources, deleteResource,
        events, deleteEvent,
        marketplaceItems, deleteMarketplaceItem,
        placements, deletePlacement
    } = useAuth();
    
    const [activeTab, setActiveTab] = useState<Tab>('analytics');

    const handleDelete = (type: string, id: string, deleteFunc: (id: string) => void) => {
        if (window.confirm(`Are you sure you want to delete this ${type}? This action is irreversible.`)) {
            try {
                deleteFunc(id);
            } catch (err) {
                alert((err as Error).message);
            }
        }
    };
    
    const handleToggleAdmin = async (userId: string) => {
        if (window.confirm('Are you sure you want to change this user\'s admin status?')) {
            try {
                await toggleAdminStatus(userId);
            } catch (err) {
                alert((err as Error).message);
            }
        }
    };

    const renderTabs = () => (
        <div className="mb-6 border-b border-slate-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {([ 'analytics', 'users', 'notices', 'topics', 'resources', 'events', 'marketplace', 'placements' ] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'analytics': return <AnalyticsTab />;
            case 'users': return <UsersTab onToggleAdmin={handleToggleAdmin} onDeleteUser={handleDelete} />;
            case 'notices': return <ContentTab title="Notices" items={notices} onDelete={(id) => handleDelete('notice', id, deleteNotice)} displayKey="title" />;
            case 'topics': return <ContentTab title="Forum Topics" items={topics} onDelete={(id) => handleDelete('topic', id, deleteTopic)} displayKey="title" />;
            case 'resources': return <ContentTab title="Resources" items={resources} onDelete={(id) => handleDelete('resource', id, deleteResource)} displayKey="title" />;
            case 'events': return <ContentTab title="Events" items={events} onDelete={(id) => handleDelete('event', id, deleteEvent)} displayKey="title" />;
            case 'marketplace': return <ContentTab title="Marketplace Items" items={marketplaceItems} onDelete={(id) => handleDelete('item', id, deleteMarketplaceItem)} displayKey="name" />;
            case 'placements': return <ContentTab title="Placements" items={placements} onDelete={(id) => handleDelete('placement', id, deletePlacement)} displayKey="companyName" />;
            default: return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h1>
            {renderTabs()}
            {renderContent()}
        </div>
    );
};

const AnalyticsTab: React.FC = () => {
    const { allUsers, notices, topics, resources } = useAuth();
    
    const StatCard: React.FC<{title: string, value: number}> = ({title, value}) => (
         <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-5 rounded-xl border border-slate-700 card-hover-effect">
            <h2 className="text-lg font-semibold text-slate-400">{title}</h2>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={allUsers.length} />
            <StatCard title="Total Notices" value={notices.length} />
            <StatCard title="Total Topics" value={topics.length} />
            <StatCard title="Total Resources" value={resources.length} />
        </div>
    );
};

const UsersTab: React.FC<{onToggleAdmin: (id: string) => void, onDeleteUser: (type: string, id: string, deleteFunc: (id: string) => void) => void}> = ({onToggleAdmin, onDeleteUser}) => {
    const { user: currentUser, allUsers, deleteUser } = useAuth();
    const adminCount = allUsers.filter(u => u.isAdmin).length;

    return (
        <div className="bg-slate-800/80 rounded-lg border border-slate-700 overflow-hidden">
            {allUsers.map(user => (
                <div key={user.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-slate-700 last:border-b-0">
                    <div>
                        <p className="font-semibold text-white">{user.name} ({user.username})</p>
                        <p className="text-sm text-slate-400">{user.email} - {user.isAdmin ? <span className="text-green-400">Admin</span> : 'Student'}</p>
                    </div>
                    <div className="flex space-x-2 mt-2 md:mt-0 flex-shrink-0">
                        <button onClick={() => onToggleAdmin(user.id)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={adminCount === 1 && user.isAdmin}>
                           {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button onClick={() => onDeleteUser('user', user.id, deleteUser)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={user.id === currentUser?.id}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

const ContentTab: React.FC<{title: string, items: any[], onDelete: (id: string) => void, displayKey: string}> = ({title, items, onDelete, displayKey}) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-white mb-4">{`Manage ${title}`}</h2>
            <div className="bg-slate-800/80 rounded-lg border border-slate-700">
                {items.length === 0 ? <p className="p-4 text-slate-500">No content to display.</p> :
                    items.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 border-b border-slate-700 last:border-b-0">
                            <p className="truncate pr-4">{item[displayKey]}</p>
                            <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300 text-sm flex-shrink-0">
                                Delete
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};


export default AdminPage;