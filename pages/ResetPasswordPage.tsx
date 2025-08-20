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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 auth-container">
      <div className="w-full max-w-md">
        <div className="pixel-box">
          <h1 className="text-5xl text-center mb-2">NEW PASSWORD</h1>
          <p className="text-xl text-center mb-8">Enter your new password</p>
          {message ? (
            <div className="text-center">
                <p className="text-xl">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="pixel-error">{error}</div>}
              <div>
                <label htmlFor="password"  className="pixel-label">New Password:</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pixel-input"
                />
              </div>
              <div>
                <label htmlFor="confirm-password"  className="pixel-label">Confirm New Password:</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pixel-input"
                />
              </div>
              <button type="submit" className="pixel-button">
                Set New Password
              </button>
            </form>
          )}
           <p className="text-center text-xl mt-6">
            <Link to="/login" className="pixel-link">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;