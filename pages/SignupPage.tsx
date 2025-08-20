import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 auth-container">
      <div className="w-full max-w-lg">
         <div className="pixel-box">
            <h1 className="text-5xl text-center mb-2">REGISTER</h1>
            <p className="text-xl text-center mb-8">Create your new account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="pixel-error">{error}</div>}
            
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="pixel-input" />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="pixel-input" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="pixel-input" />
            <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required className="pixel-input" />
            <input type="text" placeholder="Branch (e.g., Computer Science)" value={branch} onChange={(e) => setBranch(e.target.value)} required className="pixel-input" />
            
            <div className="flex items-center space-x-4">
                <label htmlFor="year" className="pixel-label !mb-0">Year:</label>
                <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} required className="pixel-select">
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                </select>
            </div>

            <input type="text" placeholder="Avatar URL (Optional)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="pixel-input" />
            
            <button type="submit" className="pixel-button">
              Sign Up
            </button>
          </form>
          <p className="mt-6 text-center text-xl">
            Already have an account?{' '}
            <Link to="/login" className="pixel-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;