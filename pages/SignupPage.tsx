
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIImageGeneratorModal from '../components/AIImageGeneratorModal';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleAvatarGenerated = (base64Image: string) => {
      setAvatarUrl(`data:image/png;base64,${base64Image}`);
      setIsAiModalOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signup({ name, username, email, password, branch, year, avatarUrl });
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to create an account. Please try again.');
      console.error(err);
    }
  };

  return (
    <>
      {isAiModalOpen && <AIImageGeneratorModal onImageGenerated={handleAvatarGenerated} onClose={() => setIsAiModalOpen(false)} />}
      <div className="auth-page-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the portal to connect with peers.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="auth-error">{error}</div>}
            
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="auth-input" />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="auth-input" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" />
            <input type="text" placeholder="Branch (e.g., Computer Science)" value={branch} onChange={(e) => setBranch(e.target.value)} required className="auth-input" />
            
            <div>
                <label htmlFor="year" className="auth-label">Year</label>
                <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} required className="auth-select">
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                </select>
            </div>

            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label htmlFor="avatarUrl" className="auth-label">Avatar URL (Optional)</label>
                <input id="avatarUrl" type="text" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="auth-input" />
              </div>
              <button type="button" onClick={() => setIsAiModalOpen(true)} className="flex-shrink-0 h-[46px] px-3 bg-slate-600 hover:bg-slate-500 rounded-md text-white transition-colors" title="Generate with AI">
                ✨
              </button>
            </div>

            <button type="submit" className="auth-button !mt-6">
              Sign Up
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupPage;