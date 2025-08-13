import React, { useState } from 'react';

const user = {
  name: 'Aseef Mohammed',
  email: 'aseef@example.com',
};

const profileOptions = [
  { icon: '👤', label: 'Account' },
  { icon: '🔒', label: 'Privacy' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '❓', label: 'Help & Support' },
];

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8`}>  
      <div className="w-full max-w-lg bg-gray-950 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <span className="text-5xl mr-4">👤</span>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white text-lg">Dark Mode</span>
          <button
            className={`w-12 h-6 rounded-full bg-gray-700 flex items-center transition-colors duration-300 ${isDark ? 'bg-blue-600' : ''}`}
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
          >
            <span
              className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-300 ${isDark ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </div>
      <div className="w-full max-w-lg">
        {profileOptions.map((opt) => (
          <div
            key={opt.label}
            className="flex items-center bg-gray-950 rounded-xl p-4 mb-4 shadow hover:bg-gray-900 transition-colors cursor-pointer"
          >
            <span className="text-2xl mr-4">{opt.icon}</span>
            <span className="text-white text-lg">{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}