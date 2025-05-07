import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TranslationResult } from '@/types';

interface TranslationTooltipProps {
  isVisible: boolean;
  data: TranslationResult | null;
  position: { x: number; y: number };
  onClose: () => void;
  onSaveToVocabulary: () => void;
  isLoading?: boolean;
  originalText?: string;
}

export default function TranslationTooltip({
  isVisible,
  data,
  position,
  onClose,
  onSaveToVocabulary,
  isLoading = false,
  originalText = ''
}: TranslationTooltipProps) {
  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // Prevent default behavior for click events inside the tooltip
  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Build the tooltip's style with dynamic positioning
  const tooltipStyle: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    maxWidth: '320px',
    zIndex: 10000, // Very high z-index to ensure it's on top of everything
    transform: 'translate(-50%, -100%)',
    marginTop: '-10px',
    position: 'fixed',
  };
  
  // Adjust position based on screen edges
  useEffect(() => {
    if (!isVisible) return;
    
    const tooltipElement = document.querySelector('.tooltip') as HTMLElement;
    if (!tooltipElement) return;
    
    const rect = tooltipElement.getBoundingClientRect();
    const isFullscreen = document.fullscreenElement !== null;
    
    // Check if tooltip is outside viewport and adjust
    let newTransform = 'translate(-50%, -100%)';
    let marginTopValue = '-10px';
    
    // Check if tooltip is too close to top
    if (position.y - rect.height < 20) {
      // Position below instead of above
      newTransform = 'translate(-50%, 0)';
      marginTopValue = '10px';
    }
    
    // Apply new styles
    tooltipElement.style.transform = newTransform;
    tooltipElement.style.marginTop = marginTopValue;
    
    // Ensure tooltip is visible in fullscreen mode
    if (isFullscreen) {
      tooltipElement.style.zIndex = '10000';
    }
  }, [isVisible, position]);

  // Create the tooltip content
  const tooltipContent = (
    <div 
      className="tooltip visible fixed p-5 bg-indigo-900/90 rounded-xl shadow-xl border border-indigo-700/70 backdrop-blur-sm"
      style={tooltipStyle}
      onClick={handleTooltipClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-indigo-200 mb-2">Translation</h3>
        <button 
          onClick={onClose}
          className="text-indigo-300 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="mb-3">
        <span className="text-indigo-200 font-medium">Original:</span>
        <p className="text-white font-medium mt-1 bg-indigo-950/50 p-2 rounded-md">
          {data?.original || originalText}
        </p>
      </div>
      
      <div className="mb-3">
        <span className="text-indigo-200 font-medium">Translation:</span>
        <p className="text-white font-medium mt-1 bg-indigo-950/50 p-2 rounded-md">
          {isLoading || !data ? (
            <span className="flex items-center text-indigo-300">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Translating...
            </span>
          ) : (
            data.translation
          )}
        </p>
      </div>
      
      {/* Alternative translations - only show when data is available */}
      {data?.alternatives && data.alternatives.length > 0 && (
        <div className="mt-3 pt-2 border-t border-indigo-700/70">
          <span className="text-indigo-200 text-sm font-medium">Alternative translations:</span>
          <ul className="text-sm text-gray-200 mt-1 space-y-1 bg-indigo-950/50 p-2 rounded-md">
            {data.alternatives.map((alt, index) => (
              <li key={index}>{alt}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Examples - only show when data is available */}
      {data?.examples && data.examples.length > 0 && (
        <div className="mt-3 pt-2 border-t border-indigo-700/70">
          <span className="text-indigo-200 text-sm font-medium">Examples:</span>
          <ul className="text-sm text-gray-200 mt-1 space-y-1 bg-indigo-950/50 p-2 rounded-md">
            {data.examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Save to vocabulary button - only show when data is available */}
      {data && (
        <div className="mt-4 pt-3 border-t border-indigo-700/70">
          <button 
            onClick={onSaveToVocabulary}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors font-medium"
            disabled={isLoading || !data}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Save to Vocabulary
          </button>
        </div>
      )}
    </div>
  );

  // Use React Portal to render the tooltip directly in the document body
  // This ensures it's outside the video container and won't be affected by fullscreen mode
  return ReactDOM.createPortal(
    tooltipContent,
    document.body
  );
} 