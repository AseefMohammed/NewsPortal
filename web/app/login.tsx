"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string|null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/dashboard');
    }, 2000);
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    // TODO: Implement OAuth authentication
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      <div className="w-full max-w-sm sm:max-w-md h-full min-h-screen flex flex-col justify-center px-4 py-8 sm:p-8 rounded-xl shadow-lg bg-white border-t border-l border-r border-black">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-black">PulseWire</h1>
          <p className="text-gray-700">Stay informed. Stay connected.</p>
        </div>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className={`mt-1 block w-full rounded-md bg-white border border-black px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${focusedInput === 'email' ? 'ring-2 ring-black' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              className={`mt-1 block w-full rounded-md bg-white border border-black px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${focusedInput === 'password' ? 'ring-2 ring-black' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md bg-black text-white font-semibold shadow-md border border-black transition-opacity font-sans ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'}`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {/* Removed OAuth icons and forgot password for minimal look */}
      </div>
    </div>
  );
}