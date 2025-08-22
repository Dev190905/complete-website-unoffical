
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('If an account with that email exists, a password reset link has been logged to the developer console.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to get a reset link.</p>
          {message ? (
            <div className="text-center">
              <p className="text-green-400 bg-green-500/10 p-4 rounded-lg">{message}</p>
              <p className="mt-4 text-sm text-slate-400">Check the developer console (F12) for the simulated reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="auth-error">{error}</div>}
              <div>
                <label htmlFor="email" className="auth-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="auth-button">
                Send Reset Link
              </button>
            </form>
          )}
          <p className="text-center text-sm text-slate-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;