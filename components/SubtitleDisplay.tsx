import React from 'react';

interface SubtitleDisplayProps {
  text: string;
  translatedText?: string;
  isActive: boolean;
  onClick: (text: string, event?: React.MouseEvent) => void;
  className?: string;
}

export default function SubtitleDisplay({
  text,
  translatedText,
  isActive,
  onClick,
  className = '',
}: SubtitleDisplayProps) {
  // Split text into words for individual word handling
  const words = text.split(' ').filter(word => word.trim() !== '');

  // Handle click on a single word
  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onClick(word, event);
  };

  // Handle click on the entire subtitle
  const handleSubtitleClick = (event: React.MouseEvent) => {
    onClick(text, event);
  };

  return (
    <div 
      className={`subtitle ${!isActive ? 'opacity-0' : ''} ${className}`}
      onClick={handleSubtitleClick}
    >
      {words.map((word, index) => (
        <span 
          key={index} 
          className="word"
          onClick={(e) => handleWordClick(word, e)}
        >
          {word}{' '}
        </span>
      ))}
      {translatedText && (
        <div className="text-gray-300 text-sm mt-2">
          {translatedText}
        </div>
      )}
    </div>
  );
} 