'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import YoutubeForm from '@/components/YoutubeForm';
import VideoPlayer from '@/components/VideoPlayer';
import TranslationTooltip from '@/components/TranslationTooltip';
import VocabularyList from '@/components/VocabularyList';
import Toast from '@/components/Toast';
import Settings from '@/components/Settings';
import LocalMediaForm from '@/components/LocalMediaForm';
import StudyMode from '@/components/StudyMode';
import { VideoInfo, Subtitle, TranslationResult, VocabularyItem, AppSettings } from '@/types';
import { useIndexedDB } from '@/components/IndexedDBProvider';

export default function Home() {
  // App state
  const [activeTab, setActiveTab] = useState<string>('video-tab');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    dualSubtitles: false,
    autoPause: false,
    autoTranslate: false,
    playbackRate: 1
  });
  const [translationData, setTranslationData] = useState<TranslationResult | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isTranslationLoading, setIsTranslationLoading] = useState<boolean>(false);
  const [currentOriginalText, setCurrentOriginalText] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Get vocabulary from IndexedDB context instead of state
  const { 
    vocabularyItems, 
    addVocabularyItem, 
    removeVocabularyItem, 
    updateVocabularyItem,
    isLoading: isVocabularyLoading 
  } = useIndexedDB();

  // Fetch settings on mount (no need to fetch vocabulary anymore)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Don't override the theme from ThemeContext
          setSettings({
            dualSubtitles: parsedSettings.dualSubtitles ?? false,
            autoPause: parsedSettings.autoPause ?? false,
            autoTranslate: parsedSettings.autoTranslate ?? false,
            playbackRate: parsedSettings.playbackRate ?? 1
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Handle tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle YouTube form success
  const handleYoutubeSuccess = (info: VideoInfo, subs: Subtitle[]) => {
    setVideoInfo(info);
    setSubtitles(subs);
    setLocalVideoUrl(null);
    showToast('Video subtitles loaded successfully', 'success');
  };

  // Handle YouTube form error
  const handleYoutubeError = (error: string) => {
    showToast(`Error: ${error}`, 'error');
  };
  
  // Handle local video selection
  const handleLocalVideoSelected = (url: string) => {
    setLocalVideoUrl(url);
    setVideoInfo(null); // Clear any YouTube video info
    showToast('Local video loaded successfully', 'success');
  };
  
  // Handle local subtitles loaded
  const handleLocalSubtitlesLoaded = (subs: Subtitle[]) => {
    setSubtitles(subs);
    showToast('Subtitles loaded successfully', 'success');
  };

  // Handle subtitle click for translation
  const handleSubtitleClick = async (text: string, event?: React.MouseEvent) => {
    try {
      let xPos = window.innerWidth / 2;
      let yPos = window.innerHeight / 2;
      
      // If event is provided, position tooltip near the clicked element
      if (event) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        xPos = rect.left + (rect.width / 2);
        yPos = rect.top; // Position above the element
      }
      
      // Set tooltip position
      setTooltipPosition({ x: xPos, y: yPos });
      
      // Show tooltip immediately with loading state
      setIsTranslationLoading(true);
      setCurrentOriginalText(text);
      setIsTooltipVisible(true);
      setTranslationData(null);
      
      // Fetch translation
      const response = await fetch(`/api/translate-phrase?text=${encodeURIComponent(text)}`);
      if (response.ok) {
        const data = await response.json();
        setTranslationData(data);
      } else {
        showToast('Translation failed', 'error');
      }
    } catch (error) {
      console.error('Error translating text:', error);
      showToast('Translation failed', 'error');
    } finally {
      setIsTranslationLoading(false);
    }
  };

  // Update settings
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };
  
  // Save settings
  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');
  };

  // Handle saving a word/phrase to vocabulary - updated to use IndexedDB
  const saveToVocabulary = async () => {
    if (!translationData) return;
    
    try {
      const vocabItem = {
        original: translationData.original,
        translation: translationData.translation,
        context: '',
        timestamp: 0,
        videoId: videoInfo?.videoId,
      };
      
      const newItem = await addVocabularyItem(vocabItem);
      
      showToast('Saved to vocabulary', 'success');
      setIsTooltipVisible(false);
    } catch (error) {
      console.error('Error saving to vocabulary:', error);
      showToast('Failed to save to vocabulary', 'error');
    }
  };

  // Delete a vocabulary item - updated to use IndexedDB
  const deleteVocabularyItem = async (id: string) => {
    try {
      await removeVocabularyItem(id);
      showToast('Vocabulary item deleted', 'success');
    } catch (error) {
      console.error('Error deleting vocabulary item:', error);
      showToast('Failed to delete vocabulary item', 'error');
    }
  };

  // Edit a vocabulary item - updated to use IndexedDB
  const editVocabularyItem = (item: VocabularyItem) => {
    // In a real implementation, would open a modal or form to edit the item
    console.log('Edit item:', item);
    // When actually implementing the edit:
    // await updateVocabularyItem(editedItem);
  };

  // Helper to show toast notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, visible: true });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Update vocabulary item after review - updated to use IndexedDB
  const updateVocabularyItemAfterReview = async (item: VocabularyItem) => {
    try {
      const updatedItem = await updateVocabularyItem({
        ...item,
        reviewCount: item.reviewCount,
        lastReviewed: item.lastReviewed || new Date().toISOString()
      });
      
      showToast('Progress saved', 'success');
    } catch (error) {
      console.error('Error updating vocabulary item:', error);
      showToast('Failed to update progress', 'error');
    }
  };

  // Handle clear translation data
  const clearTranslationData = () => {
    setTranslationData(null);
    setIsTooltipVisible(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header />
      
      {/* Main navigation tabs */}
      <nav className="flex border-b border-indigo-900/70 mb-8 overflow-x-auto">
        <button 
          className={`tab-button group relative px-4 py-2 ${activeTab === 'video-tab' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400'}`}
          onClick={() => handleTabChange('video-tab')}
        >
          Video
        </button>
        <button 
          className={`tab-button group relative px-4 py-2 ${activeTab === 'vocabulary-tab' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400'}`}
          onClick={() => handleTabChange('vocabulary-tab')}
        >
          Vocabulary
        </button>
        <button 
          className={`tab-button group relative px-4 py-2 ${activeTab === 'study-tab' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400'}`}
          onClick={() => handleTabChange('study-tab')}
        >
          Study
        </button>
        <button 
          className={`tab-button group relative px-4 py-2 ${activeTab === 'settings-tab' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400'}`}
          onClick={() => handleTabChange('settings-tab')}
        >
          Settings
        </button>
      </nav>
      
      {/* Video Tab */}
      {activeTab === 'video-tab' && (
        <div>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Video source component temporarily disabled
            <YoutubeForm 
              onSuccess={handleYoutubeSuccess}
              onError={handleYoutubeError}
            />
            */}
            
            <LocalMediaForm
              onVideoSelected={handleLocalVideoSelected}
              onSubtitlesLoaded={handleLocalSubtitlesLoaded}
              onError={handleYoutubeError}
            />
          </div>
          
          {(videoInfo || localVideoUrl) && subtitles.length > 0 && (
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div>
                <VideoPlayer
                  videoUrl={localVideoUrl || undefined}
                  youtubeId={videoInfo?.videoId}
                  subtitles={subtitles}
                  onSubtitleClick={handleSubtitleClick}
                  dualSubtitles={settings.dualSubtitles}
                />
                
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setSettings({...settings, dualSubtitles: !settings.dualSubtitles})}
                    className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    {settings.dualSubtitles ? 'Hide English' : 'Show English'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Vocabulary Tab */}
      {activeTab === 'vocabulary-tab' && (
        <div className="card p-6 mb-8 border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-indigo-300 mb-6">Your Greek Vocabulary Collection</h2>
          <VocabularyList
            items={vocabularyItems}
            onDelete={deleteVocabularyItem}
            onEdit={editVocabularyItem}
          />
        </div>
      )}
      
      {/* Study Tab */}
      {activeTab === 'study-tab' && (
        <div className="card p-6 mb-8 border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-indigo-300 mb-6">Spaced Repetition Study Mode</h2>
          <StudyMode
            items={vocabularyItems}
            onUpdateItem={updateVocabularyItemAfterReview}
          />
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings-tab' && (
        <Settings 
          settings={settings} 
          onSettingsChange={handleSettingsChange}
          onSaveSettings={saveSettings}
        />
      )}
      
      {/* Translation tooltip */}
      <TranslationTooltip
        isVisible={isTooltipVisible}
        data={translationData}
        position={tooltipPosition}
        onClose={clearTranslationData}
        onSaveToVocabulary={saveToVocabulary}
        isLoading={isTranslationLoading}
        originalText={currentOriginalText}
      />
      
      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
} 