import React, { useState, useEffect } from 'react';

interface Suggestion {
  text: string;
  type?: string;
}

interface SmartSearchComponentProps {
  onSearchResults: (results: any) => void;
  onClose: () => void;
}

const SmartSearchComponent: React.FC<SmartSearchComponentProps> = ({ onSearchResults, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword'>('semantic');

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:9100/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const endpoint = searchMode === 'semantic' 
        ? `/search/semantic?q=${encodeURIComponent(query)}`
        : `/search/keyword?q=${encodeURIComponent(query)}`;
      const response = await fetch(`http://localhost:9100${endpoint}`);
      const results = await response.json();
      setRecentSearches((prev: string[]) => {
        const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return updated;
      });
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = (item: Suggestion) => (
    <button 
      className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded"
      onClick={() => {
        setSearchQuery(item.text);
        performSearch(item.text);
      }}
      type="button"
    >
      <span className="mr-2">
        <svg width="16" height="16" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <span className="flex-1 text-gray-700 dark:text-gray-200">{item.text}</span>
      {item.type && (
        <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{item.type}</span>
      )}
    </button>
  );

  const renderRecentSearch = (item: string) => (
    <button 
      className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded"
      onClick={() => {
        setSearchQuery(item);
        performSearch(item);
      }}
      type="button"
    >
      <span className="mr-2">
        <svg width="16" height="16" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <span className="flex-1 text-gray-700 dark:text-gray-200">{item}</span>
    </button>
  );

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 rounded shadow max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        />
        <button onClick={onClose} className="ml-2 px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" type="button">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="mb-2 flex gap-2">
        <button
          className={`px-3 py-1 rounded ${searchMode === 'semantic' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
          onClick={() => setSearchMode('semantic')}
          type="button"
        >Semantic</button>
        <button
          className={`px-3 py-1 rounded ${searchMode === 'keyword' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
          onClick={() => setSearchMode('keyword')}
          type="button"
        >Keyword</button>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Suggestions</div>
          <div className="space-y-1">
            {suggestions.map((item, idx) => (
              <React.Fragment key={idx}>{renderSuggestion(item)}</React.Fragment>
            ))}
          </div>
        </div>
      )}
      {recentSearches.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Recent Searches</div>
          <div className="space-y-1">
            {recentSearches.map((item, idx) => (
              <React.Fragment key={idx}>{renderRecentSearch(item)}</React.Fragment>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => performSearch()}
        className="w-full mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        type="button"
      >Search</button>
    </div>
  );
};

export default SmartSearchComponent;
