import React, { useRef, useState, useEffect } from 'react';
import { Subtitle } from '@/types';
import SubtitleDisplay from '@/components/SubtitleDisplay';

interface VideoPlayerProps {
  videoUrl?: string;
  youtubeId?: string;
  subtitles: Subtitle[];
  onSubtitleClick: (text: string, event?: React.MouseEvent) => void;
  dualSubtitles?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  youtubeId,
  subtitles,
  onSubtitleClick,
  dualSubtitles = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [translatedSubtitle, setTranslatedSubtitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Function to find the current subtitle based on video time
  const findCurrentSubtitle = (time: number) => {
    for (const subtitle of subtitles) {
      if (time >= subtitle.start && time <= subtitle.start + subtitle.dur) {
        return subtitle.text;
      }
    }
    return '';
  };

  // Handle time update to display the correct subtitle
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);
      
      const text = findCurrentSubtitle(currentTime);
      setCurrentSubtitle(text);
      
      // If dual subtitles are enabled, fetch the translation
      if (dualSubtitles && text && text !== currentSubtitle) {
        fetchTranslation(text);
      } else if (!dualSubtitles) {
        setTranslatedSubtitle('');
      }
    }
  };

  // Fetch translation for subtitle text
  const fetchTranslation = async (text: string) => {
    try {
      const response = await fetch(`/api/translate-phrase?text=${encodeURIComponent(text)}`);
      if (response.ok) {
        const data = await response.json();
        setTranslatedSubtitle(data.translation || '');
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
    }
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle playback rate change
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Skip to a specific time
  const skipToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      
      // Also update the current subtitle
      const text = findCurrentSubtitle(time);
      setCurrentSubtitle(text);
      
      // If dual subtitles are enabled, fetch the translation
      if (dualSubtitles && text) {
        fetchTranslation(text);
      }
    }
  };

  useEffect(() => {
    // Set up event listeners when the component mounts
    const video = videoRef.current;
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      
      // Clean up event listeners when the component unmounts
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, [subtitles, dualSubtitles]);

  return (
    <div id="video-container" className="relative">
      {youtubeId ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        ></iframe>
      ) : (
        <video ref={videoRef} controls src={videoUrl} className="w-full aspect-video bg-black"></video>
      )}
      
      {/* Greek subtitle */}
      <SubtitleDisplay
        text={currentSubtitle}
        isActive={!!currentSubtitle}
        onClick={onSubtitleClick}
      />
      
      {/* English subtitle (if dual subtitles enabled) */}
      {dualSubtitles && (
        <SubtitleDisplay
          text={translatedSubtitle}
          isActive={!!translatedSubtitle}
          onClick={(_text, _event) => {}}
          className="bottom-10 text-gray-300 text-base"
        />
      )}
      
      {/* Playback controls */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => changePlaybackRate(0.75)}
          className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          0.75x
        </button>
        <button
          onClick={() => changePlaybackRate(1)}
          className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          1x
        </button>
        <button
          onClick={togglePlayPause}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors text-sm"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
} 