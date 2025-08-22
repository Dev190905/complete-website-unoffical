
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid reset link. The token is missing.');
      return;
    }

    try {
      await resetPassword(token, password);
      setMessage('Password reset success! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password. The link may be invalid or expired.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Please enter your new password below.</p>
          {message ? (
            <div className="text-center text-green-400 bg-green-500/10 p-4 rounded-lg">
                <p>{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="auth-error">{error}</div>}
              <div>
                <label htmlFor="password"  className="auth-label">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
              </div>
              <div>
                <label htmlFor="confirm-password"  className="auth-label">Confirm New Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="auth-button !mt-6">
                Set New Password
              </button>
            </form>
          )}
           <p className="text-center text-sm text-slate-400 mt-6">
            <Link to="/login" className="auth-link">
              Back to Sign In
            </Link>
          </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;