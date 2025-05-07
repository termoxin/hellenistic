import React, { useRef, useState, useEffect } from 'react';
import { Subtitle } from '@/types';
import SubtitleDisplay from '@/components/SubtitleDisplay';

// YouTube API type declarations
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoUrl?: string;
  youtubeId?: string;
  subtitles: Subtitle[];
  onSubtitleClick: (text: string, event?: React.MouseEvent) => void;
  dualSubtitles?: boolean;
}

interface TranslatedSubtitle extends Subtitle {
  translation: string;
}

export default function VideoPlayer({
  videoUrl,
  youtubeId,
  subtitles,
  onSubtitleClick,
  dualSubtitles = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [translatedSubtitle, setTranslatedSubtitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [wasPlayingBeforePause, setWasPlayingBeforePause] = useState<boolean>(false);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [translatedSubtitles, setTranslatedSubtitles] = useState<TranslatedSubtitle[]>([]);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [translationTimes, setTranslationTimes] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Preload all subtitle translations when component mounts
  useEffect(() => {
    if (dualSubtitles && subtitles.length > 0) {
      preloadSubtitleTranslations();
    }
  }, [subtitles, dualSubtitles]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return 'calculating...';
    }
    
    // Cap at reasonable values
    seconds = Math.min(seconds, 3600); // Max 1 hour
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} min ${secs} sec`;
  };

  // Calculate estimated time remaining
  const calculateTimeRemaining = (progress: number, elapsedTime: number, averageTimePerItem: number): string => {
    if (progress <= 0 || !isFinite(progress)) {
      return 'calculating...';
    }
    
    // Two methods to calculate estimated time
    const method1 = ((1 - progress) / progress) * elapsedTime;
    
    // Method 2: based on average time per item
    const itemsRemaining = subtitles.length * (1 - progress);
    const method2 = itemsRemaining * averageTimePerItem;
    
    // Use the more conservative (larger) estimate between the two methods
    // but favor method2 as it tends to be more accurate as more items are processed
    const weightMethod1 = progress < 0.2 ? 0.8 : (progress < 0.5 ? 0.5 : 0.2);
    const weightMethod2 = 1 - weightMethod1;
    
    const estimatedTime = (method1 * weightMethod1) + (method2 * weightMethod2);
    
    return formatTime(estimatedTime);
  };

  // Function to preload all subtitle translations
  const preloadSubtitleTranslations = async () => {
    setIsLoadingTranslations(true);
    setLoadingProgress(0);
    setStartTime(Date.now());
    setTranslationTimes([]);
    
    const translatedSubs: TranslatedSubtitle[] = [];
    const totalSubtitles = subtitles.length;
    let completedSubtitles = 0;
    
    try {
      // Create batches of 5 translations to avoid overwhelming the API
      const batchSize = 5;
      
      for (let i = 0; i < totalSubtitles; i += batchSize) {
        const batchStartTime = Date.now();
        
        const batch = subtitles.slice(i, i + batchSize);
        const batchPromises = batch.map(async (subtitle) => {
          try {
            const translation = await fetchTranslationText(subtitle.text);
            return {
              ...subtitle,
              translation
            };
          } catch (error) {
            console.error(`Error translating subtitle: ${subtitle.text}`, error);
            return {
              ...subtitle,
              translation: ''
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        translatedSubs.push(...batchResults);
        
        // Record batch processing time
        const batchTime = (Date.now() - batchStartTime) / 1000; // in seconds
        const timePerItem = batchTime / batch.length;
        setTranslationTimes(prev => [...prev, timePerItem]);
        
        // Update progress
        completedSubtitles = Math.min(i + batchSize, totalSubtitles);
        const progress = completedSubtitles / totalSubtitles;
        setLoadingProgress(progress * 100);
        
        // Calculate estimated time remaining
        const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
        const averageTimePerItem = translationTimes.length > 0 
          ? translationTimes.reduce((sum, time) => sum + time, 0) / translationTimes.length 
          : timePerItem;
        
        const timeRemaining = calculateTimeRemaining(progress, elapsedTime, averageTimePerItem);
        setEstimatedTimeRemaining(timeRemaining);
      }
      
      setTranslatedSubtitles(translatedSubs);
    } catch (error) {
      console.error('Error preloading translations:', error);
    } finally {
      setIsLoadingTranslations(false);
      setLoadingProgress(100);
    }
  };

  // Fetch translation text only (helper function)
  const fetchTranslationText = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`/api/translate-phrase?text=${encodeURIComponent(text)}`);
      if (response.ok) {
        const data = await response.json();
        return data.translation || '';
      }
      return '';
    } catch (error) {
      console.error('Error fetching translation:', error);
      return '';
    }
  };

  // Initialize YouTube player when component mounts
  useEffect(() => {
    if (youtubeId && iframeRef.current) {
      // Load YouTube iframe API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Initialize YouTube player when API is ready
      window.onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player(iframeRef.current, {
          playerVars: {
            controls: isFullscreen ? 0 : 1,
            showinfo: 0,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: (event: any) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              
              // Handle time updates for YouTube player
              if (event.data === window.YT.PlayerState.PLAYING) {
                const interval = setInterval(() => {
                  const currentTime = player.getCurrentTime();
                  handleYouTubeTimeUpdate(currentTime);
                }, 100);
                return () => clearInterval(interval);
              }
            }
          }
        });
        setYoutubePlayer(player);
      };
    }
  }, [youtubeId, isFullscreen]);

  // Function to find the current subtitle based on video time
  const findCurrentSubtitle = (time: number) => {
    for (const subtitle of subtitles) {
      if (time >= subtitle.start && time <= subtitle.start + subtitle.dur) {
        return subtitle.text;
      }
    }
    return '';
  };

  // Function to find the preloaded translation for current subtitle
  const findTranslationForSubtitle = (text: string): string => {
    if (!text) return '';
    
    const translatedSub = translatedSubtitles.find(sub => sub.text === text);
    return translatedSub?.translation || '';
  };

  // Handle time update for HTML5 video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);
      
      const text = findCurrentSubtitle(currentTime);
      setCurrentSubtitle(text);
      
      // Use preloaded translations instead of fetching on-the-fly
      if (dualSubtitles && text && text !== currentSubtitle) {
        const translation = findTranslationForSubtitle(text);
        setTranslatedSubtitle(translation);
        
        // If translation isn't in the preloaded cache (fallback)
        if (!translation && translatedSubtitles.length > 0) {
          fetchTranslation(text);
        }
      } else if (!dualSubtitles) {
        setTranslatedSubtitle('');
      }
    }
  };

  // Handle time update for YouTube video
  const handleYouTubeTimeUpdate = (time: number) => {
    setCurrentTime(time);
    const text = findCurrentSubtitle(time);
    setCurrentSubtitle(text);
    
    // Use preloaded translations instead of fetching on-the-fly
    if (dualSubtitles && text && text !== currentSubtitle) {
      const translation = findTranslationForSubtitle(text);
      setTranslatedSubtitle(translation);
      
      // If translation isn't in the preloaded cache (fallback)
      if (!translation && translatedSubtitles.length > 0) {
        fetchTranslation(text);
      }
    } else if (!dualSubtitles) {
      setTranslatedSubtitle('');
    }
  };

  // Fetch translation for subtitle text (fallback)
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
    if (youtubeId && youtubePlayer) {
      if (isPlaying) {
        youtubePlayer.pauseVideo();
      } else {
        youtubePlayer.playVideo();
      }
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle hover on subtitles
  const handleSubtitleMouseEnter = () => {
    if (youtubeId && youtubePlayer) {
      if (isPlaying) {
        setWasPlayingBeforePause(true);
        youtubePlayer.pauseVideo();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } else if (videoRef.current && !videoRef.current.paused) {
      setWasPlayingBeforePause(true);
      videoRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleSubtitleMouseLeave = () => {
    if (youtubeId && youtubePlayer) {
      if (isPaused && wasPlayingBeforePause) {
        youtubePlayer.playVideo();
        setIsPlaying(true);
        setIsPaused(false);
        setWasPlayingBeforePause(false);
      }
    } else if (videoRef.current && isPaused && wasPlayingBeforePause) {
      videoRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      setWasPlayingBeforePause(false);
    }
  };

  // Handle playback rate change
  const changePlaybackRate = (rate: number) => {
    if (youtubeId && youtubePlayer) {
      // Make sure the player is initialized and has the setPlaybackRate method
      if (youtubePlayer.setPlaybackRate) {
        try {
          youtubePlayer.setPlaybackRate(rate);
          console.log(`YouTube playback rate set to ${rate}x`);
        } catch (error) {
          console.error('Error setting YouTube playback rate:', error);
        }
      } else {
        console.warn('YouTube player not fully initialized or does not support setPlaybackRate');
      }
    } else if (videoRef.current) {
      try {
        videoRef.current.playbackRate = rate;
        console.log(`HTML5 video playback rate set to ${rate}x`);
      } catch (error) {
        console.error('Error setting HTML5 video playback rate:', error);
      }
    }
  };

  // Skip to a specific time
  const skipToTime = (time: number) => {
    if (youtubeId && youtubePlayer) {
      youtubePlayer.seekTo(time);
      
      // Update the current subtitle
      const text = findCurrentSubtitle(time);
      setCurrentSubtitle(text);
      
      // If dual subtitles are enabled, use preloaded translation
      if (dualSubtitles && text) {
        const translation = findTranslationForSubtitle(text);
        setTranslatedSubtitle(translation);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
      
      // Also update the current subtitle
      const text = findCurrentSubtitle(time);
      setCurrentSubtitle(text);
      
      // If dual subtitles are enabled, use preloaded translation 
      if (dualSubtitles && text) {
        const translation = findTranslationForSubtitle(text);
        setTranslatedSubtitle(translation);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Hide controls when entering fullscreen
        if (videoRef.current) {
          videoRef.current.controls = false;
        }
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        // Show controls when exiting fullscreen
        if (videoRef.current) {
          videoRef.current.controls = true;
        }
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      
      // Update video controls based on fullscreen state
      if (videoRef.current) {
        videoRef.current.controls = !isFullscreenNow;
      }
      
      // Update YouTube player controls if available
      if (youtubePlayer && youtubePlayer.setOption) {
        try {
          youtubePlayer.setOption('controls', isFullscreenNow ? 0 : 1);
        } catch (error) {
          console.error('Error updating YouTube controls:', error);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [youtubePlayer]);

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
  }, [subtitles, dualSubtitles, translatedSubtitles]);

  return (
    <div id="video-container" className="relative" ref={containerRef}>
      {youtubeId ? (
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&controls=${isFullscreen ? '0' : '1'}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        ></iframe>
      ) : (
        <video 
          ref={videoRef} 
          controls={!isFullscreen} 
          src={videoUrl} 
          className="w-full aspect-video bg-black"
        ></video>
      )}
      
      {isLoadingTranslations && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-40">
          <div className="text-white text-lg mb-4">Loading English translations...</div>
          
          <div className="w-3/4 max-w-md bg-gray-800 rounded-full h-4 mb-3 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <div className="text-white text-sm flex justify-between w-3/4 max-w-md">
            <span>{Math.round(loadingProgress)}% complete</span>
            <span>
              Subtitles: {Math.min(Math.round(subtitles.length * (loadingProgress/100)), subtitles.length)}/{subtitles.length}
            </span>
          </div>
          
          <div className="text-gray-400 text-xs mt-6">
            Processing subtitle translations...
          </div>
        </div>
      )}
      
      {/* Subtitles container - positioned at the bottom of the screen */}
      <div 
        onMouseEnter={handleSubtitleMouseEnter}
        onMouseLeave={handleSubtitleMouseLeave}
        className="subtitle-container absolute bottom-[120px] left-0 right-0 z-30 pointer-events-auto"
      >
        {/* Greek subtitle */}
        <SubtitleDisplay
          text={currentSubtitle}
          isActive={!!currentSubtitle}
          onClick={onSubtitleClick}
          className="subtitle-greek text-green-400 font-semibold text-center"
        />
        
        {/* English subtitle */}
        {dualSubtitles && (
          <SubtitleDisplay
            text={translatedSubtitle}
            isActive={!!translatedSubtitle}
            onClick={(_text, _event) => {}}
            className="subtitle-english text-white text-base text-center"
          />
        )}
      </div>
      
      {/* Help tooltip */}
      <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-full pointer-events-none">
        Hover over subtitles to pause video
      </div>
      
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
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm flex items-center"
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          )}
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );
} 