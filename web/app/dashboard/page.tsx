"use client";
import React, { useState, useEffect } from "react";
import MobileTabBar from "../components/MobileTabBar";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const NEWS_GROUPS = [
  "general",
  "business",
  "technology",
  "politics",
  "entertainment",
  "sports",
  "health",
];

interface Article {
  id: number;
  title: string;
  summary: string;
  image: string;
  category: string;
  source?: string;
  publishedAt?: string;
  aiSummary?: string;
  sentiment?: "positive" | "neutral" | "negative";
  trending?: boolean;
  readingTime?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-900 text-white",
  business: "bg-blue-900 text-white",
  technology: "bg-purple-900 text-white",
  politics: "bg-red-900 text-white",
  entertainment: "bg-pink-900 text-white",
  sports: "bg-green-900 text-white",
  health: "bg-yellow-700 text-white",
};

function formatTimeAgo(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function DashboardContent() {
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(NEWS_GROUPS);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [savedArticles, setSavedArticles] = useState<number[]>([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setArticles([
        {
          id: 1,
          title: "Breaking News: Next.js Migration!",
          summary: "Your dashboard is now running on the web.",
          image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
          category: "technology",
          source: "TechCrunch",
          publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          aiSummary: "Migration completed successfully. Enjoy blazing fast web experience!",
          sentiment: "positive",
          trending: true,
          readingTime: "2 min read",
        },
        {
          id: 2,
          title: "React Native to Web",
          summary: "How to convert mobile screens to web pages.",
          image: "https://react.dev/images/og-home.png",
          category: "general",
          source: "React Dev",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          aiSummary: "Learn how to migrate your mobile app to web using React and Next.js.",
          sentiment: "neutral",
          trending: false,
          readingTime: "3 min read",
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveArticle = (id: number) => {
    setSavedArticles((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const filteredArticles = articles.filter(
    (a) =>
      (!search || a.title.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategories.length === 0 || selectedCategories.includes(a.category))
  );

  return (
    <div className={`min-h-screen pb-20 relative ${theme === "dark" ? "bg-black" : "bg-offwhite"}`}>
      <div className={`max-w-4xl mx-auto rounded-xl p-0 pb-24 ${theme === "dark" ? "bg-black" : "bg-offwhite"}`}>
        {/* Search & Category Area - Contemporary Mixed Look */}
        <div className="sticky top-0 z-30 w-full px-2 pt-4 pb-2" style={{backdropFilter: 'blur(12px)'}}>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-3">
              {/* Glassmorphism Search */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search news, topics..."
                  className={`w-full pl-12 pr-12 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg transition ${theme === "dark" ? "bg-white/10 text-white" : "bg-white/80 text-black"}`}
                  style={{ boxSizing: 'border-box', backdropFilter: 'blur(6px)' }}
                />
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-blue-300" : "text-blue-500"} pointer-events-none`}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8"/><line x1="18" y1="18" x2="22" y2="22" strokeWidth="2"/></svg>
                </span>
                {search && (
                  <button onClick={() => setSearch("")} className={`absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full hover:bg-gray-200 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="5" x2="13" y2="13"/><line x1="13" y1="5" x2="5" y2="13"/></svg>
                  </button>
                )}
                {/* Theme Toggle removed, now only in Profile page */}
              </div>
              {/* Category Chips - Modern Scrollable */}
              <div className="overflow-x-auto w-full">
                <div className="flex gap-2 px-1">
                  <button
                    className={`px-5 py-2 rounded-full text-sm font-bold border shadow-sm transition ${selectedCategories.length === 0 ? (theme === "dark" ? "bg-blue-900 text-white border-blue-900" : "bg-blue-100 text-blue-900 border-blue-900") : (theme === "dark" ? "bg-black text-white" : "bg-white text-black")}`}
                    onClick={() => setSelectedCategories([])}
                  >All</button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-bold border shadow-sm transition ${selectedCategories.includes(cat) ? CATEGORY_COLORS[cat] + " border-black scale-105" : (theme === "dark" ? "bg-black text-white hover:bg-gray-900" : "bg-white text-black hover:bg-gray-100")}`}
                    >{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className={theme === "dark" ? "text-white" : "text-black"}>Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-16">
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-500 text-lg"}>No articles found.</span>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className={`rounded-2xl shadow-xl border relative flex flex-col h-full transition hover:scale-[1.02] hover:shadow-2xl duration-150 ${theme === "dark" ? "bg-gray-900 border-white" : "bg-white border-black"}`}>
                  {/* Image */}
                  <div className="relative">
                    <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-t-2xl" />
                    {/* Category Badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow ${CATEGORY_COLORS[article.category]}`}>{article.category.toUpperCase()}</span>
                    {/* Trending Badge */}
                    {article.trending && (
                      <span className="absolute top-4 right-4 px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow flex items-center gap-1">
                        <svg width="14" height="14" fill="none" stroke="white"><path d="M2 12L12 2M2 2h10v10" strokeWidth="2"/></svg> Trending
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-between flex-1 p-5 gap-2">
                    <h2 className={`text-lg md:text-xl font-bold mb-1 leading-tight line-clamp-2 ${theme === "dark" ? "text-white" : "text-black"}`}>{article.title}</h2>
                    <p className={`text-sm mb-2 line-clamp-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>{article.summary}</p>
                    {/* AI Summary */}
                    {article.aiSummary && (
                      <div className={`my-2 p-3 rounded-xl border-l-4 ${theme === "dark" ? "bg-gray-800 border-white" : "bg-gray-100 border-black"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg width="16" height="16" fill="none" stroke="#222"><circle cx="8" cy="8" r="7" strokeWidth="2"/><path d="M8 4v4l3 2" strokeWidth="2"/></svg>
                          <span className={`text-xs font-bold uppercase ${theme === "dark" ? "text-white" : "text-black"}`}>AI Summary</span>
                        </div>
                        <p className={`text-sm italic line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{article.aiSummary}</p>
                      </div>
                    )}
                    {/* Meta Info & Feature Buttons - Single Line */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className={`flex flex-wrap items-center gap-3 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {article.source && <span className="font-semibold">{article.source}</span>}
                        {article.publishedAt && <span>{formatTimeAgo(article.publishedAt)}</span>}
                        {article.readingTime && <span>{article.readingTime}</span>}
                        {article.sentiment && (
                          <span className={`px-2 py-1 rounded-full font-bold ${article.sentiment === "positive" ? "bg-green-200 text-green-800" : article.sentiment === "negative" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-800"}`}>
                            {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveArticle(article.id)}
                          className={`p-2 rounded-full border transition ${savedArticles.includes(article.id) ? (theme === "dark" ? "bg-white text-black border-white" : "bg-black text-white border-black") : (theme === "dark" ? "bg-gray-900 text-white border-white hover:bg-gray-800" : "bg-white text-black border-black hover:bg-gray-100")}`}
                          title={savedArticles.includes(article.id) ? "Unsave" : "Save"}
                        >
                          {savedArticles.includes(article.id) ? (
                            <svg width="20" height="20" fill={theme === "dark" ? "white" : "black"} stroke={theme === "dark" ? "black" : "white"}><path d="M5 3h10a2 2 0 012 2v12l-7-4-7 4V5a2 2 0 012-2z"/></svg>
                          ) : (
                            <svg width="20" height="20" fill="none" stroke={theme === "dark" ? "white" : "black"}><path d="M5 3h10a2 2 0 012 2v12l-7-4-7 4V5a2 2 0 012-2z"/></svg>
                          )}
                        </button>
                        <button className={`p-2 rounded-full border transition ${theme === "dark" ? "bg-gray-900 text-white border-white hover:bg-gray-800" : "bg-white text-black border-black hover:bg-gray-100"}`} title="Share">
                          <svg width="20" height="20" fill="none" stroke={theme === "dark" ? "white" : "black"}><path d="M15 8a3 3 0 10-6 0v4a3 3 0 106 0V8z"/><path d="M12 2v6" strokeWidth="2"/></svg>
                        </button>
                        <button className={`p-2 rounded-full border transition ${theme === "dark" ? "bg-gray-900 text-white border-white hover:bg-gray-800" : "bg-white text-black border-black hover:bg-gray-100"}`} title="More">
                          <svg width="20" height="20" fill="none" stroke={theme === "dark" ? "white" : "black"}><circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <MobileTabBar />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
