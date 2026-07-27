'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [participantId, setParticipantId] = useState('');
  const [password, setPassword] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [sex, setSex] = useState('');
  const [confidence, setConfidence] = useState<number>(50);
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetForm = () => {
    setParticipantId('');
    setPassword('');
    setYearOfStudy('');
    setSex('');
    setConfidence(50);
    setPin('');
    setError(null);
    setFieldErrors({});
    setResetSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/marta/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        if (data?.errors) {
          setFieldErrors(data.errors);
        } else {
          setError(data?.message || 'Login failed. Please check your credentials.');
        }
        return;
      }

      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('participant_id', data.participantId);
      router.push('/student-dashboard');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/marta/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          yearOfStudy: parseInt(yearOfStudy, 10),
          sex,
          selfReportedConfidence: confidence / 100,
          pin,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        if (data?.errors) {
          setFieldErrors(data.errors);
        } else {
          setError(data?.message || 'Registration failed. Please check your inputs.');
        }
        return;
      }

      if (data?.participantId) {
        setRegisteredId(data.participantId);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    let hasErrors = false;
    const newFieldErrors: Record<string, string> = {};

    if (!participantId.trim()) {
      newFieldErrors.participantId = 'Participant ID is required';
      hasErrors = true;
    }
    if (!/^\d{6}$/.test(pin)) {
      newFieldErrors.pin = 'PIN must be exactly 6 digits';
      hasErrors = true;
    }
    if (password.length < 8) {
      newFieldErrors.password = 'Password must be at least 8 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/marta/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, pin, newPassword: password }),
      });

      if (!res.ok) {
        setError('Invalid Participant ID or PIN. Please try again.');
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setIsForgot(false);
        setIsLogin(true);
        resetForm();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredId) {
    return (
      <div className="w-full text-center py-4">
        <h2 className="text-[26px] font-bold tracking-[-0.625px] text-black mb-2">
          Registration Successful
        </h2>
        <p className="text-[15px] text-[#615d59] mb-6">
          Please save your Participant ID to sign in.
        </p>
        
        <div className="bg-[#f6f5f4] border border-[#e6e6e6] rounded-[12px] p-6 mb-6">
          <p className="text-[12px] font-semibold tracking-[0.125px] text-[#a39e98] uppercase mb-2">
            Your Participant ID
          </p>
          <p className="text-[32px] font-bold tracking-widest text-black font-mono">
            {registeredId}
          </p>
        </div>

        <button
          onClick={() => {
            setRegisteredId(null);
            setIsLogin(true);
            resetForm();
          }}
          className="w-full bg-[#0075de] text-white rounded-full py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  if (isForgot) {
    return (
      <div className="w-full">
        {resetSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[16px] text-green-800 font-medium dark:text-[#f0ede9]">Password reset! You can now sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-[17px] font-semibold text-black dark:text-[#f0ede9] mb-1">Reset Password</h2>
              <p className="text-[14px] text-[#615d59] dark:text-[#8a8480]">Enter your Participant ID and 6-digit PIN to set a new password.</p>
            </div>
            
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[14px] text-red-600 mb-4">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Participant ID
              </label>
              <input
                type="text"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.participantId
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                required
              />
              {fieldErrors.participantId && (
                <p className="mt-1 text-[13px] text-red-500 dark:text-[#8a8480]">{fieldErrors.participantId}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                PIN
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="6-digit PIN"
                className={`w-full bg-white dark:bg-[#141312] border dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.pin
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                required
              />
              {fieldErrors.pin && (
                <p className="mt-1 text-[13px] text-red-500 dark:text-[#8a8480]">{fieldErrors.pin}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[13px] text-red-500 dark:text-[#8a8480]">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0075de] text-white rounded-full py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Reset Password'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setIsLogin(true);
                  resetForm();
                }}
                className="text-[13px] text-[#615d59] hover:text-black dark:text-[#8a8480] dark:hover:text-[#f0ede9]"
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        {error && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-[8px] text-[14px] text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {isLogin ? (
          <>
            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Participant ID
              </label>
              <input
                type="text"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.participantId
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                placeholder="Enter your ID"
                required
              />
              {fieldErrors.participantId && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.participantId}</p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.password}</p>
              )}
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(true);
                    resetForm();
                  }}
                  className="text-[13px] text-[#0075de] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                placeholder="Choose a strong password"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Year of Study
              </label>
              <div className="relative">
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className={`appearance-none w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] focus:outline-none transition-all ${
                    fieldErrors.yearOfStudy
                      ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                      : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                  }`}
                  required
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                  <option value="6">Year 6</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98] dark:text-[#5a5652] w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldErrors.yearOfStudy && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.yearOfStudy}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Sex
              </label>
              <div className="relative">
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className={`appearance-none w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] focus:outline-none transition-all ${
                    fieldErrors.sex
                      ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                      : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                  }`}
                  required
                >
                  <option value="" disabled>Select Sex</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98] dark:text-[#5a5652] w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldErrors.sex && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.sex}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be]">
                  Diagnostic Confidence
                </label>
                <span className="px-2 py-0.5 bg-[#f6f5f4] dark:bg-[#141312] border border-[#e6e6e6] dark:border-[#2e2c2a] rounded-[4px] text-[12px] font-semibold text-[#31302e] dark:text-[#c9c4be]">
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0075de] bg-[#e6e6e6] dark:bg-[#2e2c2a] mt-2"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
                Course PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className={`w-full bg-white dark:bg-[#141312] border rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none transition-all ${
                  fieldErrors.pin
                    ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                    : 'border-[#e6e6e6] dark:border-[#2e2c2a] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20'
                }`}
                placeholder="6-digit PIN used for password reset"
                required
              />
              {fieldErrors.pin && (
                <p className="mt-1 text-[13px] text-red-500">{fieldErrors.pin}</p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0075de] text-white rounded-full py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p className="mt-4 text-center text-[14px] text-[#615d59] dark:text-[#8a8480]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            className="text-[#0075de] hover:underline cursor-pointer"
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </span>
        </p>
      </form>
    </div>
  );
}