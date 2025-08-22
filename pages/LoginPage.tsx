
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
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-title">Portal Login</h1>
        <p className="auth-subtitle">Welcome back, please sign in.</p>
      
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="auth-error">{error}</div>}
          <div>
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password"  className="auth-label !mb-0">Password</label>
              <Link to="/forgot-password" className="text-sm auth-link">
                  Forgot password?
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
              className="auth-input"
            />
          </div>
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;