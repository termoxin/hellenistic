import React, { useState } from 'react';
import { VideoInfo, Subtitle } from '@/types';

interface YoutubeFormProps {
  onSuccess: (info: VideoInfo, subtitles: Subtitle[]) => void;
  onError: (error: string) => void;
}

export default function YoutubeForm({ onSuccess, onError }: YoutubeFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First, fetch video info
      const infoResponse = await fetch(`/api/youtube/info?url=${encodeURIComponent(youtubeUrl)}`);
      if (!infoResponse.ok) {
        const errorData = await infoResponse.json();
        throw new Error(errorData.error || 'Failed to fetch video info');
      }
      
      const videoInfo: VideoInfo = await infoResponse.json();
      
      // Then, fetch subtitles
      const subtitlesResponse = await fetch(`/api/youtube/subtitles?url=${encodeURIComponent(youtubeUrl)}`);
      if (!subtitlesResponse.ok) {
        const errorData = await subtitlesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch subtitles');
      }
      
      const subtitlesData = await subtitlesResponse.json();
      
      // Call the success callback with the data
      onSuccess(videoInfo, subtitlesData.subtitles);
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 mb-8 border-l-4 border-indigo-500">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        Video Source
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={youtubeUrl}
              onChange={handleUrlChange}
              placeholder="Enter YouTube URL"
              className="w-full px-4 py-3 bg-indigo-950/50 border border-indigo-800/50 rounded-lg text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Fetch Subtitles
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 text-red-400">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-4 py-2.5 px-4 bg-indigo-900/40 rounded-lg text-center">
        <p className="text-indigo-200 text-sm flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Enter a YouTube URL to fetch Greek subtitles. Video loading is disabled; only subtitles will be loaded.
        </p>
      </div>
    </div>
  );
} 