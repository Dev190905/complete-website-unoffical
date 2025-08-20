import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { MarketItem } from '../types';

const MarketplacePage: React.FC = () => {
    const { marketplaceItems, addMarketplaceItem } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data: Omit<MarketItem, 'id' | 'seller'>) => {
        addMarketplaceItem(data);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Student Marketplace</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">List an Item</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {marketplaceItems.map(item => (
                    <div key={item.id} className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden flex flex-col group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl card-hover-effect">
                        <div className="relative">
                           <img src={item.imageUrl || `https://via.placeholder.com/300?text=${encodeURIComponent(item.name)}`} alt={item.name} className="w-full h-48 object-cover"/>
                           <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white text-lg font-bold p-2 rounded-lg">₹{item.price}</div>
                        </div>
                        <div className="p-4 flex flex-col flex-1 bg-gradient-to-t from-slate-900/50 to-transparent">
                            <h2 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">{item.name}</h2>
                            <p className="text-sm text-slate-400 mb-3 flex-1">{item.description}</p>
                            <a href={`mailto:${item.seller.email}`} className="w-full mt-2 text-center block px-3 py-2 text-sm bg-slate-700 hover:bg-primary-600 rounded-md transition-colors">Contact Seller</a>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <ItemModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ItemModal: React.FC<{onSave: (data: any) => void, onClose: () => void}> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description, price: Number(price), imageUrl: imageUrl || `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`});
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700">
                <h2 className="text-2xl font-bold mb-4">List New Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="number" placeholder="Price (₹)" value={price} onChange={e => setPrice(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="text" placeholder="Image URL (Optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md h-24"/>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg">List Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MarketplacePage;