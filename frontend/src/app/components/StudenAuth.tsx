'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentAuth() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [participantId, setParticipantId] = useState('');
  
  // Register fields
  const [yearOfStudy, setYearOfStudy] = useState('3');
  const [sex, setSex] = useState('MALE');
  const [confidence, setConfidence] = useState<number>(50); // 0-100 UI, 0.0-1.0 API
  const [pin, setPin] = useState('');

  // Shared fields
  const [password, setPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ pin?: string; password?: string }>({});
  const [registeredId, setRegisteredId] = useState('');

  const resetForm = () => {
    setIsLogin(true);
    setParticipantId('');
    setPassword('');
    setYearOfStudy('3');
    setSex('MALE');
    setConfidence(50);
    setPin('');
    setError('');
    setFieldErrors({});
    setRegisteredId('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const res = await fetch('/marta/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('participant_id', data.participantId);
      router.push('/student-dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const payload = {
        yearOfStudy: parseInt(yearOfStudy, 10),
        sex,
        selfReportedConfidence: confidence / 100, // normalize to 0.0 - 1.0
        password,
        pin,
      };

      const res = await fetch('/marta/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.pin || data.password) {
          setFieldErrors({ pin: data.pin, password: data.password });
          return;
        }
        throw new Error(data.error || 'Registration failed');
      }

      setRegisteredId(data.participantId);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (registeredId) {
    return (
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-medium text-white mb-2">Registration Successful</h2>
          <p className="text-zinc-400 mb-6">Please save your Participant ID. You will need it to login.</p>
          
          <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 mb-8">
            <span className="block text-sm font-medium text-zinc-500 mb-1">Participant ID</span>
            <span className="text-2xl font-mono text-white tracking-wider">{registeredId}</span>
          </div>

          <button
            onClick={resetForm}
            className="w-full bg-white text-black font-medium py-2 px-4 rounded-md hover:bg-zinc-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-medium text-white mb-1">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm text-zinc-400">
          {isLogin 
            ? 'Enter your credentials to access your dashboard' 
            : 'Register to participate in the dental education program'}
        </p>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
        {isLogin && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5" htmlFor="participantId">
              Participant ID
            </label>
            <input
              id="participantId"
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-150"
              required
            />
          </div>
        )}

        {!isLogin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5" htmlFor="yearOfStudy">
                  Year of Study
                </label>
                <div className="relative">
                  <select
                    id="yearOfStudy"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-150 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(year => (
                      <option key={year} value={year}>Year {year}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5" htmlFor="sex">
                  Sex
                </label>
                <div className="relative">
                  <select
                    id="sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-150 appearance-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-zinc-400" htmlFor="confidence">
                  Self-Reported Confidence
                </label>
                <span className="text-xs font-medium text-white bg-zinc-800 px-2 py-0.5 rounded">
                  {confidence}%
                </span>
              </div>
              <input
                id="confidence"
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5" htmlFor="pin">
                6-Digit PIN
              </label>
              <input
                id="pin"
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full bg-zinc-950 border ${fieldErrors.pin ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-blue-500'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-150`}
                placeholder="123456"
                required
              />
              {fieldErrors.pin && (
                <p className="mt-1.5 text-sm text-red-500">{fieldErrors.pin}</p>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5" htmlFor="password">
            Password {isLogin ? '' : <span className="text-zinc-500 font-normal">(min 8 characters)</span>}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-zinc-950 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-blue-500'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-150`}
            required
            minLength={isLogin ? undefined : 8}
          />
          {fieldErrors.password && (
            <p className="mt-1.5 text-sm text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-500 text-sm py-2.5 px-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-medium py-2.5 px-4 rounded-md transition-all duration-150 mt-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLogin 
              ? 'bg-white text-black hover:bg-zinc-100 focus:ring-zinc-400' 
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFieldErrors({});
          }}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors duration-150"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}