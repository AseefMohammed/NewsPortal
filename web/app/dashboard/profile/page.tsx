
"use client";
import MobileTabBar from "../../components/MobileTabBar";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";

import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../../services/api";

function ProfileContent() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const options = [
    { icon: "user", label: "Account" },
    { icon: "lock", label: "Privacy" },
    { icon: "bell", label: "Notifications" },
    { icon: "help-circle", label: "Help & Support" },
  ];

  useEffect(() => {
    async function getProfile() {
      const data = await fetchUserProfile();
      setUser(data);
      setLoading(false);
    }
    getProfile();
  }, []);

  return (
    <div className={`min-h-screen pb-20 relative ${theme === 'dark' ? 'bg-neutral-900' : 'bg-offwhite'}`}>
      <div className={`max-w-md mx-auto ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white'} border border-gray-200 dark:border-gray-700 p-6 pb-24`}>
        <div className="flex items-center gap-5 mb-6">
          <div className={`flex items-center justify-center w-20 h-20 rounded-full ${theme === 'dark' ? 'bg-blue-950' : 'bg-gray-100'} shadow`}>
            {/* Avatar or fallback icon */}
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <svg width="48" height="48" fill="none" stroke={theme === 'dark' ? '#fff' : '#222'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>
            )}
          </div>
          <div>
            <div className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{loading ? "Loading..." : user?.name || "No Name"}</div>
            <div className={`text-base ${theme === 'dark' ? 'text-blue-200' : 'text-gray-500'}`}>{loading ? "" : user?.email || "No Email"}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-8">
          <span className={`text-base font-semibold ${theme === 'dark' ? 'text-blue-100' : 'text-black'}`}>Dark Mode</span>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 flex items-center rounded-full border transition ${theme === 'dark' ? 'bg-blue-900 border-blue-900' : 'bg-gray-200 border-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            <span className={`inline-block w-5 h-5 rounded-full transition ${theme === 'dark' ? 'bg-blue-500 translate-x-6' : 'bg-white translate-x-1'}`}></span>
          </button>
        </div>
        <div className="space-y-3">
          {options.map(opt => (
            <button key={opt.label} className={`w-full flex items-center gap-4 px-5 py-4 border border-gray-200 dark:border-gray-700 ${theme === 'dark' ? 'bg-blue-950 hover:bg-blue-900' : 'bg-white hover:bg-gray-50'} shadow-sm transition`}>
              {opt.icon === "user" && <svg width="24" height="24" fill="none" stroke={theme === 'dark' ? '#fff' : '#222'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>}
              {opt.icon === "lock" && <svg width="24" height="24" fill="none" stroke={theme === 'dark' ? '#fff' : '#222'} strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2"/><path d="M12 14v2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>}
              {opt.icon === "bell" && <svg width="24" height="24" fill="none" stroke={theme === 'dark' ? '#fff' : '#222'} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 16v-5a6 6 0 10-12 0v5"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>}
              {opt.icon === "help-circle" && <svg width="24" height="24" fill="none" stroke={theme === 'dark' ? '#fff' : '#222'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 115.82 0c0 1.5-1.5 2.25-2.25 2.25"/><circle cx="12" cy="17" r="1"/></svg>}
              <span className={`font-medium text-base ${theme === 'dark' ? 'text-blue-100' : 'text-black'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider>
      <ProfileContent />
    </ThemeProvider>
  );
}
