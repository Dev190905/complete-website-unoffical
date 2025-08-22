import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Placement } from '../types';

const PlacementsPage: React.FC = () => {
    const { user, placements, addPlacement, updatePlacement, deletePlacement } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlacement, setCurrentPlacement] = useState<Partial<Placement> | null>(null);
    
    const handleInterest = (placementId: string) => {
        if (!user) return;
        const placement = placements.find(p => p.id === placementId);
        if(!placement) return;
        
        const interested = placement.interested.includes(user.id);
        const newInterested = interested ? placement.interested.filter(id => id !== user.id) : [...placement.interested, user.id];
        updatePlacement(placementId, { interested: newInterested });
    };

    const openModal = (placement: Partial<Placement> | null = null) => {
        setCurrentPlacement(placement || { companyName: '', role: '', salaryPackage: '', eligibility: '' });
        setIsModalOpen(true);
    };

    const handleSave = (data: Omit<Placement, 'id' | 'interested'>) => {
        if (currentPlacement?.id) {
            updatePlacement(currentPlacement.id, data);
        } else {
            addPlacement(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this placement opportunity?')) {
            deletePlacement(id);
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Placement Corner</h1>
                {user?.isAdmin && <button onClick={() => openModal()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">Add Company</button>}
            </div>
            <div className="bg-slate-800/80 rounded-lg border border-slate-700 overflow-hidden">
                <div className="grid grid-cols-5 p-4 font-bold text-slate-400 border-b border-slate-700 hidden md:grid">
                    <div>Company</div>
                    <div>Role</div>
                    <div>Package</div>
                    <div>Eligibility</div>
                    <div>Action</div>
                </div>
                {placements.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <h2 className="text-2xl font-semibold text-slate-300">No Placements Listed</h2>
                        <p className="mt-2">The data set is not currently available and will be added soon.</p>
                    </div>
                ) : (
                    placements.map(p => (
                        <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 p-4 border-b border-slate-700 last:border-b-0 items-center gap-y-2">
                            <div className="font-semibold text-white"><span className="md:hidden text-slate-400 font-bold">Company: </span>{p.companyName}</div>
                            <div><span className="md:hidden text-slate-400 font-bold">Role: </span>{p.role}</div>
                            <div><span className="md:hidden text-slate-400 font-bold">Package: </span>{p.salaryPackage}</div>
                            <div className="text-sm"><span className="md:hidden text-slate-400 font-bold">Eligibility: </span>{p.eligibility}</div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleInterest(p.id)} className={`w-full md:w-auto px-3 py-1.5 text-sm font-semibold rounded-full ${user && p.interested.includes(user.id) ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {user && p.interested.includes(user.id) ? '✓ Interested' : 'I\'m Interested'}
                                </button>
                                {user?.isAdmin && (
                                    <>
                                        <button onClick={() => openModal(p)} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">EDIT</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">DELETE</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {isModalOpen && <PlacementModal placement={currentPlacement} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const PlacementModal: React.FC<{placement: Partial<Placement> | null, onSave: (data: any) => void, onClose: () => void}> = ({ placement, onSave, onClose }) => {
    const [companyName, setCompanyName] = useState(placement?.companyName || '');
    const [role, setRole] = useState(placement?.role || '');
    const [pkg, setPkg] = useState(placement?.salaryPackage || '');
    const [eligibility, setEligibility] = useState(placement?.eligibility || '');
    
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ companyName, role, salaryPackage: pkg, eligibility }); };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg border border-slate-700 animate-modal-pop-in">
                <h2 className="text-2xl font-bold mb-4">{placement?.id ? 'Edit' : 'Add'} Placement Opportunity</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="text" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="text" placeholder="Package (e.g., 25 LPA)" value={pkg} onChange={e => setPkg(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <input type="text" placeholder="Eligibility" value={eligibility} onChange={e => setEligibility(e.target.value)} required className="input-glow-effect w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md"/>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PlacementsPage;
