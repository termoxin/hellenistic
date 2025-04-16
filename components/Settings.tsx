import React from 'react';
import { AppSettings } from '@/types';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onSaveSettings: () => void;
}

export default function Settings({ settings, onSettingsChange, onSaveSettings }: SettingsProps) {
  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="card p-6 mb-8 border-l-4 rounded-lg" style={{ borderColor: 'var(--accent-primary)' }}>
      <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--accent-primary)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        Application Settings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Playback settings */}
        <div className="card p-5 rounded-xl" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Playback
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'var(--text-secondary)' }}>Default Playback Rate</label>
              <select
                value={settings.playbackRate}
                onChange={(e) => handleSettingChange('playbackRate', parseFloat(e.target.value))}
                className="rounded-lg px-4 py-2 w-full border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Auto-pause after subtitle</span>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoPause} 
                  onChange={(e) => handleSettingChange('autoPause', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Keyboard shortcuts */}
        <div className="card p-5 rounded-xl" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <kbd className="bg-indigo-700 px-2 py-1 rounded text-white font-semibold">Space</kbd>
              <span style={{ color: 'var(--text-secondary)' }}>Play/Pause</span>
            </div>
            <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <kbd className="bg-indigo-700 px-2 py-1 rounded text-white font-semibold">B</kbd>
              <span style={{ color: 'var(--text-secondary)' }}>Add Bookmark</span>
            </div>
            <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <kbd className="bg-indigo-700 px-2 py-1 rounded text-white font-semibold">S</kbd>
              <span style={{ color: 'var(--text-secondary)' }}>Toggle Subtitles</span>
            </div>
            <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <kbd className="bg-indigo-700 px-2 py-1 rounded text-white font-semibold">T</kbd>
              <span style={{ color: 'var(--text-secondary)' }}>Translate</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button 
          onClick={onSaveSettings}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Save Settings
        </button>
      </div>
    </div>
  );
} 