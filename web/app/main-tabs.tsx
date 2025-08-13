import React from 'react';
import Link from 'next/link';

const tabs = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Saves', href: '/saves', icon: '🔖' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

export default function MainTabs() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-950 border-t border-gray-800 shadow-lg flex justify-center z-50">
      <nav className="flex gap-8 py-4">
        {tabs.map(tab => (
          <Link key={tab.name} href={tab.href} className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}