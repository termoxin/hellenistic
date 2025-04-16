import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '@/types';

interface StudyModeProps {
  items: VocabularyItem[];
  onUpdateItem: (item: VocabularyItem) => void;
}

// Spaced repetition intervals in days
const INTERVALS = [1, 3, 7, 14, 30, 90, 180];

export default function StudyMode({ items, onUpdateItem }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [studyItems, setStudyItems] = useState<VocabularyItem[]>([]);
  const [studyCompleted, setStudyCompleted] = useState<boolean>(false);
  const [stats, setStats] = useState({ total: 0, studied: 0, mastered: 0 });

  useEffect(() => {
    // Sort items by priority for study
    const sortedItems = [...items].sort((a, b) => {
      // First priority: items never reviewed (reviewCount === 0)
      if (a.reviewCount === 0 && b.reviewCount !== 0) return -1;
      if (a.reviewCount !== 0 && b.reviewCount === 0) return 1;
      
      // If both have been reviewed, prioritize by due date
      if (a.lastReviewed && b.lastReviewed) {
        const aDate = new Date(a.lastReviewed);
        const bDate = new Date(b.lastReviewed);
        
        // Calculate due dates based on interval
        const aInterval = INTERVALS[Math.min(a.reviewCount, INTERVALS.length - 1)];
        const bInterval = INTERVALS[Math.min(b.reviewCount, INTERVALS.length - 1)];
        
        const aDueDate = new Date(aDate);
        aDueDate.setDate(aDueDate.getDate() + aInterval);
        
        const bDueDate = new Date(bDate);
        bDueDate.setDate(bDueDate.getDate() + bInterval);
        
        // If one is overdue and one isn't, prioritize the overdue one
        const now = new Date();
        if (aDueDate <= now && bDueDate > now) return -1;
        if (aDueDate > now && bDueDate <= now) return 1;
        
        // Otherwise sort by due date (oldest first)
        return aDueDate.getTime() - bDueDate.getTime();
      }
      
      // If only one has been reviewed, prioritize the unreviewed one
      if (!a.lastReviewed && b.lastReviewed) return -1;
      if (a.lastReviewed && !b.lastReviewed) return 1;
      
      // Default: sort by date added (oldest first)
      return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    });
    
    // Limit to 10-20 items for daily study
    const dailyLimit = Math.min(15, Math.max(sortedItems.length, 5));
    setStudyItems(sortedItems.slice(0, dailyLimit));
    
    // Calculate stats
    const mastered = items.filter(item => item.reviewCount >= 5).length;
    setStats({
      total: items.length,
      studied: items.filter(item => item.reviewCount > 0).length,
      mastered
    });
  }, [items]);

  const handleResponse = (quality: number) => {
    if (currentIndex >= studyItems.length) return;
    
    // Update the current item
    const currentItem = { ...studyItems[currentIndex] };
    const newReviewCount = (currentItem.reviewCount || 0) + 1;
    
    const updatedItem = {
      ...currentItem,
      reviewCount: newReviewCount,
      lastReviewed: new Date().toISOString()
    };
    
    // Save to API
    onUpdateItem(updatedItem);
    
    // Move to next card
    const nextIndex = currentIndex + 1;
    if (nextIndex >= studyItems.length) {
      setStudyCompleted(true);
    } else {
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudyCompleted(false);
  };

  if (studyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">No vocabulary items to study</h3>
        <p className="text-gray-400">Add some words to your vocabulary to start studying</p>
      </div>
    );
  }

  if (studyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">Study session completed!</h3>
        <p className="text-gray-400 mb-6">You've reviewed {studyItems.length} items. Come back tomorrow for more.</p>
        <button
          onClick={resetStudy}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  const currentItem = studyItems[currentIndex];

  return (
    <div className="flex flex-col">
      {/* Study progress */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-indigo-300 text-sm">
          Card {currentIndex + 1} of {studyItems.length}
        </div>
        <div className="bg-indigo-900/30 rounded-full h-2 flex-1 mx-4">
          <div 
            className="bg-indigo-500 rounded-full h-2"
            style={{ width: `${(currentIndex / studyItems.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-indigo-300 text-sm">
          {Math.round((currentIndex / studyItems.length) * 100)}%
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-300">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Words</div>
        </div>
        <div className="bg-indigo-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-300">{stats.studied}</div>
          <div className="text-xs text-gray-400">In Learning</div>
        </div>
        <div className="bg-indigo-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-300">{stats.mastered}</div>
          <div className="text-xs text-gray-400">Mastered</div>
        </div>
      </div>
      
      {/* Flashcard */}
      <div className="bg-indigo-900/30 rounded-xl p-6 mb-6 min-h-[220px] flex flex-col justify-between">
        <div className="mb-6">
          <div className="text-sm text-indigo-300 mb-2">
            {showAnswer ? 'Translation' : 'Greek Word'}
          </div>
          <div className="text-2xl font-bold text-white">
            {showAnswer ? currentItem.translation : currentItem.original}
          </div>
          
          {showAnswer && currentItem.context && (
            <div className="mt-4 text-sm text-gray-400 italic">
              Context: "{currentItem.context}"
            </div>
          )}
        </div>
        
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Show Translation
          </button>
        ) : (
          <div className="mt-4">
            <div className="text-sm text-indigo-300 mb-3">How well did you know this word?</div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleResponse(1)}
                className="py-2 px-4 bg-red-600/70 hover:bg-red-600 text-white rounded transition-colors"
              >
                Again
              </button>
              <button
                onClick={() => handleResponse(2)}
                className="py-2 px-4 bg-orange-600/70 hover:bg-orange-600 text-white rounded transition-colors"
              >
                Hard
              </button>
              <button
                onClick={() => handleResponse(3)}
                className="py-2 px-4 bg-indigo-600/70 hover:bg-indigo-600 text-white rounded transition-colors"
              >
                Good
              </button>
              <button
                onClick={() => handleResponse(4)}
                className="py-2 px-4 bg-green-600/70 hover:bg-green-600 text-white rounded transition-colors"
              >
                Easy
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-indigo-300 bg-indigo-900/20 p-3 rounded-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Using spaced repetition to help you remember. Words will reappear based on how well you know them.
        </span>
      </div>
    </div>
  );
} 