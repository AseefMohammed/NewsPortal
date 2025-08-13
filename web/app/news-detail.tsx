import React from 'react';

interface NewsDetailProps {
  title: string;
  ai_summary?: string;
  key_points?: string[];
  content?: string;
  url?: string;
}

// Example props for demo purposes
const exampleProps: NewsDetailProps = {
  title: 'Breaking News: Next.js Migration!',
  ai_summary: 'Your dashboard is now running on the web.',
  key_points: ['Migration is complete', 'All screens are now web pages', 'Enjoy your new experience!'],
  content: 'This is the full content of the article. You can now read your news in a modern web interface.',
  url: 'https://nextjs.org',
};

export default function NewsDetailPage(props: Partial<NewsDetailProps>) {
  // Use props if provided, otherwise use exampleProps
  const { title, ai_summary, key_points, content, url } = { ...exampleProps, ...props };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 flex justify-center">
      <div className="max-w-2xl w-full bg-gray-950 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        {ai_summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">AI Enhanced Summary</h2>
            <p className="text-gray-300 mb-2">{ai_summary}</p>
          </div>
        )}
        {key_points && key_points.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">Key Points</h2>
            <ul className="list-disc list-inside text-gray-400">
              {key_points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">Full Article</h2>
          <p className="text-gray-200 mb-4">{content ? content : 'ERROR: Content is undefined, null, or empty.'}</p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Read more
          </a>
        )}
      </div>
    </div>
  );
}
