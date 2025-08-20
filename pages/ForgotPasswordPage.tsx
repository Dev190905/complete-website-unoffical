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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 auth-container">
      <div className="w-full max-w-md">
        <div className="pixel-box">
            <h1 className="text-5xl text-center mb-2">RESET</h1>
            <p className="text-xl text-center mb-8">Recover your account</p>
          {message ? (
            <div className="text-center">
              <p className="text-xl">{message}</p>
              <p className="mt-4 text-lg text-gray-400">Check the console (F12) for the simulated reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="pixel-error">{error}</div>}
              <div>
                <label htmlFor="email" className="pixel-label">Email Address:</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pixel-input"
                />
              </div>
              <button type="submit" className="pixel-button">
                Send Reset Link
              </button>
            </form>
          )}
          <p className="text-center text-xl mt-6">
            Remember it?{' '}
            <Link to="/login" className="pixel-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;