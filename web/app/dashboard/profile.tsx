"use client";
import React, { useState } from "react";
import MobileTabBar from "../components/MobileTabBar";

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);
  // Dummy user info
  const user = {
    name: "Aseef Mohammed",
    email: "aseef@example.com",
    avatar: "https://ui-avatars.com/api/?name=Aseef+Mohammed&background=0D8ABC&color=fff",
  };

  return (
    <div className={`min-h-screen pb-20 relative ${darkMode ? 'bg-black' : 'bg-offwhite'}`}>
      <div className="max-w-md mx-auto rounded-xl p-0 pb-24">
        <div className="flex flex-col items-center pt-10 pb-6">
          <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full shadow-lg mb-4" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{user.name}</h2>
          <span className={`text-gray-500 mb-2 ${darkMode ? 'text-gray-300' : ''}`}>{user.email}</span>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className={`mt-4 px-6 py-2 rounded-full font-bold shadow transition ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
          >
            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
        <div className="px-6">
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Profile Actions</h3>
          <ul className="space-y-3">
            <li>
              <button className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700">Edit Profile</button>
            </li>
            <li>
              <button className="w-full px-4 py-3 rounded-xl bg-gray-200 text-black font-bold shadow hover:bg-gray-300">View Saved Articles</button>
            </li>
            <li>
              <button className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700">Logout</button>
            </li>
          </ul>
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}
