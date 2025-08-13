import React from 'react';

interface AISummaryComponentProps {
  newsItem: { title: string; summary: string };
  onToggle: () => void;
}

const AISummaryComponent: React.FC<AISummaryComponentProps> = ({ newsItem, onToggle }) => {
  return (
    <div className="overflow-y-auto p-4">
      <div className="font-bold text-lg mb-2">{newsItem.title}</div>
      <div className="mb-4 text-gray-700 dark:text-gray-300">{newsItem.summary}</div>
      <button onClick={onToggle} className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        <span>Expand</span>
      </button>
    </div>
  );
};

export default AISummaryComponent;
