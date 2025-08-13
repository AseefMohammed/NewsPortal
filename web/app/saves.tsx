import React, { useState } from 'react';

interface Article {
  id: number;
  title: string;
  summary: string;
  image: string;
  category: string;
  publishedAt?: string;
}

const initialSavedArticles: Article[] = [
  {
    id: 1,
    title: 'How to Save Articles in NewsPortal',
    summary: 'Bookmark your favorite news for easy access later.',
    image: 'https://nextjs.org/static/twitter-cards/next-twitter-card.png',
    category: 'general',
    publishedAt: '2025-08-13T10:00:00Z',
  },
  {
    id: 2,
    title: 'Web Migration Success!',
    summary: 'Your saved articles are now available on the web.',
    image: 'https://react.dev/images/og-home.png',
    category: 'technology',
    publishedAt: '2025-08-12T09:00:00Z',
  },
];

function formatTimeAgo(publishedAt?: string) {
  if (!publishedAt) return '';
  const date = new Date(publishedAt);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function SavesPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>(initialSavedArticles);

  const handleRemove = (id: number) => {
    setSavedArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Saved Articles</h1>
        {savedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-6xl mb-4">🔖</span>
            <h2 className="text-xl font-semibold text-white mb-2">No Saved Articles</h2>
            <p className="text-gray-400 mb-6 text-center">Articles you bookmark will appear here for easy access later.</p>
            <a href="/dashboard" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Explore News</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedArticles.map(article => (
              <div key={article.id} className="bg-gray-950 rounded-xl shadow-lg overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
                  <p className="text-gray-400 mb-2">{article.summary}</p>
                  <span className="inline-block px-2 py-1 rounded bg-blue-600 text-white text-xs mr-2">{article.category}</span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(article.publishedAt)}</span>
                  <button
                    onClick={() => handleRemove(article.id)}
                    className="ml-4 px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition"
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}