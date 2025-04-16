import React, { useState, useRef } from 'react';
import { Subtitle } from '@/types';
import SrtParser from 'srt-parser-2';

interface LocalMediaFormProps {
  onVideoSelected: (url: string) => void;
  onSubtitlesLoaded: (subtitles: Subtitle[]) => void;
  onError: (error: string) => void;
}

export default function LocalMediaForm({ onVideoSelected, onSubtitlesLoaded, onError }: LocalMediaFormProps) {
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [srtFileName, setSrtFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setVideoFileName(file.name);
    
    // Create a local URL for the video file
    const videoUrl = URL.createObjectURL(file);
    onVideoSelected(videoUrl);
  };
  
  const handleSrtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setIsLoading(true);
    try {
      const file = e.target.files[0];
      setSrtFileName(file.name);
      
      // Read the SRT file
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Failed to read SRT file');
        }
        
        const parser = new SrtParser();
        const parsedSubtitles = parser.fromSrt(event.target.result);
        
        // Convert to our Subtitle format
        const subtitles: Subtitle[] = parsedSubtitles.map(item => ({
          start: timeToSeconds(item.startTime),
          dur: timeToSeconds(item.endTime) - timeToSeconds(item.startTime),
          text: item.text
        }));
        
        onSubtitlesLoaded(subtitles);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read SRT file');
      };
      
      reader.readAsText(file);
    } catch (error) {
      setIsLoading(false);
      onError(error instanceof Error ? error.message : 'Failed to parse subtitles');
    }
  };
  
  // Convert SRT time format (00:00:00,000) to seconds
  const timeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':');
    const seconds = parseFloat(parts[2].replace(',', '.'));
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
  };
  
  return (
    <div className="card p-6 mb-8 border-l-4 border-indigo-500">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
        </svg>
        Local Media Files
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video file selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-indigo-200 font-medium">Select Video File</label>
            <span className="text-xs text-indigo-300 bg-indigo-900/40 px-2 py-1 rounded">MP4, WebM, etc.</span>
          </div>
          
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
              <div className="flex">
                <input 
                  type="text" 
                  value={videoFileName} 
                  readOnly 
                  placeholder="No file selected"
                  className="w-full px-4 py-3 bg-indigo-950/50 border border-indigo-800/50 rounded-l-lg text-white placeholder-indigo-300/70 focus:outline-none"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-all"
                >
                  Browse
                </button>
              </div>
            </div>
            {videoFileName && (
              <p className="text-green-400 text-sm mt-2">
                Video file selected: {videoFileName}
              </p>
            )}
          </div>
        </div>
        
        {/* SRT file selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-indigo-200 font-medium">Select Subtitles File</label>
            <span className="text-xs text-indigo-300 bg-indigo-900/40 px-2 py-1 rounded">SRT format only</span>
          </div>
          
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="file"
                ref={srtInputRef}
                onChange={handleSrtChange}
                accept=".srt"
                className="hidden"
              />
              <div className="flex">
                <input 
                  type="text" 
                  value={srtFileName} 
                  readOnly 
                  placeholder="No file selected"
                  className="w-full px-4 py-3 bg-indigo-950/50 border border-indigo-800/50 rounded-l-lg text-white placeholder-indigo-300/70 focus:outline-none"
                />
                <button
                  onClick={() => srtInputRef.current?.click()}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-all"
                >
                  Browse
                </button>
              </div>
            </div>
            {srtFileName && (
              <p className="text-green-400 text-sm mt-2">
                Subtitles file selected: {srtFileName}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 py-3 px-4 bg-indigo-900/40 rounded-lg text-center">
        <p className="text-indigo-200 text-sm flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Select both a video file and a corresponding SRT subtitle file. The video will be played locally and not uploaded to any server.
        </p>
      </div>
      
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-indigo-300">Loading subtitles...</span>
          </div>
        </div>
      )}
    </div>
  );
} 