"use client";
import React, { useState } from "react";
import MobileTabBar from "../../components/MobileTabBar";

// Dummy data for saved articles
const initialSaved = [
  {
    id: 1,
    title: "Breaking News: Next.js Migration!",
    summary: "Your dashboard is now running on the web.",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    category: "technology",
    source: "TechCrunch",
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "React Native to Web",
    summary: "How to convert mobile screens to web pages.",
    image: "https://react.dev/images/og-home.png",
    category: "general",
    source: "React Dev",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

function formatTimeAgo(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function SavesPage() {
  const [saved, setSaved] = useState(initialSaved);
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = () => {
    setSaved((prev) => prev.filter((a) => !selected.includes(a.id)));
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-black pb-20 relative">
      <div className="max-w-2xl mx-auto bg-offwhite rounded-xl p-0 pb-24">
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h1 className="text-xl font-bold text-black">Saved Articles</h1>
          {selected.length > 0 && (
            <button
              onClick={handleRemoveSelected}
              className="px-4 py-2 rounded-full bg-red-600 text-white font-bold shadow hover:bg-red-700"
            >
              Remove Selected
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 px-4">
          {saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-gray-500 text-lg">No saved articles.</span>
            </div>
          ) : (
            saved.map((article) => (
              <div key={article.id} className={`bg-white rounded-2xl shadow-xl border border-black relative flex flex-col h-full transition hover:scale-[1.02] hover:shadow-2xl duration-150 ${selected.includes(article.id) ? 'ring-4 ring-blue-400' : ''}`}>
                <div className="flex items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(article.id)}
                    onChange={() => handleSelect(article.id)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <img src={article.image} alt={article.title} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-black leading-tight line-clamp-1">{article.title}</h2>
                    <p className="text-gray-800 text-sm line-clamp-2">{article.summary}</p>
                    <div className="flex gap-2 text-xs text-gray-700 mt-1">
                      {article.source && <span className="font-semibold">{article.source}</span>}
                      {article.publishedAt && <span>{formatTimeAgo(article.publishedAt)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}
