import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import PillInput from '../ui/PillInput';
const PillInputAny = (PillInput as unknown) as React.FC<any>;

export const AuthCard = ({ mode = 'login' }: { mode?: 'login' | 'signup' | 'reset' }) => {
  const { login, signup, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <PillInputAny
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
        {mode !== 'reset' && (
          <PillInputAny
            type="password"
            placeholder="Password"
            value={password}
            onChange={(value: string) => setPassword(value)}
            required
          />
        )}
        <Button type="submit" className="mt-4">
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
        </Button>
      </form>
    </div>
  );
};

export default AuthCard;