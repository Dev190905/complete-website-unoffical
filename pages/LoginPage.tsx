import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 auth-container">
      <div className="w-full max-w-md">
        <div className="pixel-box">
          <h1 className="text-5xl text-center mb-2">PORTAL</h1>
          <p className="text-xl text-center mb-8">User Authentication</p>
        
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="pixel-error">{error}</div>}
            <div>
              <label htmlFor="username" className="pixel-label">Username:</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <label htmlFor="password"  className="pixel-label">Password:</label>
                <Link to="/forgot-password" className="pixel-link text-lg">
                    Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pixel-input"
              />
            </div>
            <button type="submit" className="pixel-button">
              Sign In
            </button>
          </form>
          <p className="text-center text-xl mt-6">
            No account?{' '}
            <Link to="/signup" className="pixel-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;