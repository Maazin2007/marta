'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function ResearcherLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/marta/api/v1/auth/researcher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, pin }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        setError(data?.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (data?.token) {
        localStorage.setItem('researcher_token', data.token);
      }
      
      router.push('/researcher-dashboard');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-[8px] text-[14px] text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-[#141312] border border-[#e6e6e6] dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all"
            placeholder="researcher@university.edu"
            required
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-[#141312] border border-[#e6e6e6] dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 pr-10 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a39e98] hover:text-[#31302e] dark:text-[#5a5652] dark:hover:text-[#c9c4be] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[#31302e] dark:text-[#c9c4be] mb-1">
            Access PIN
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-white dark:bg-[#141312] border border-[#e6e6e6] dark:border-[#2e2c2a] rounded-[4px] px-3 py-1.5 pr-10 text-[15px] text-black dark:text-[#f0ede9] placeholder:text-[#a39e98] dark:placeholder:text-[#5a5652] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all"
              placeholder="System access PIN"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a39e98] hover:text-[#31302e] dark:text-[#5a5652] dark:hover:text-[#c9c4be] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0075de] text-white rounded-full py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating...' : 'Sign In as Researcher'}
        </button>
      </form>
    </div>
  );
}
