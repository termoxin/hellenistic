import React, { useState } from 'react';
import { VocabularyItem } from '@/types';

interface VocabularyListProps {
  items: VocabularyItem[];
  onDelete: (id: string) => void;
  onEdit: (item: VocabularyItem) => void;
}

export default function VocabularyList({ items, onDelete, onEdit }: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  
  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.partOfSpeech && item.partOfSpeech.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort items based on selected option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'date-asc':
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      case 'alpha-asc':
        return a.original.localeCompare(b.original);
      case 'alpha-desc':
        return b.original.localeCompare(a.original);
      case 'review-count-asc':
        return a.reviewCount - b.reviewCount;
      case 'review-count-desc':
        return b.reviewCount - a.reviewCount;
      case 'last-reviewed-asc':
        if (!a.lastReviewed) return 1;
        if (!b.lastReviewed) return -1;
        return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
      case 'last-reviewed-desc':
        if (!a.lastReviewed) return 1;
        if (!b.lastReviewed) return -1;
        return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime();
      case 'part-of-speech':
        if (!a.partOfSpeech) return 1;
        if (!b.partOfSpeech) return -1;
        return a.partOfSpeech.localeCompare(b.partOfSpeech);
      default:
        return 0;
    }
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your vocabulary..."
            className="block w-full pl-10 pr-3 py-2.5 bg-indigo-950/50 border border-indigo-800/50 rounded-lg text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex-shrink-0">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-indigo-950/50 border border-indigo-800/50 rounded-lg text-white px-3 py-2.5 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <optgroup label="Date Added">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </optgroup>
            <optgroup label="Alphabetical">
              <option value="alpha-asc">A-Z</option>
              <option value="alpha-desc">Z-A</option>
            </optgroup>
            <optgroup label="Study Progress">
              <option value="review-count-desc">Most Reviewed</option>
              <option value="review-count-asc">Least Reviewed</option>
              <option value="last-reviewed-desc">Recently Reviewed</option>
              <option value="last-reviewed-asc">Least Recently Reviewed</option>
            </optgroup>
            <optgroup label="Grammar">
              <option value="part-of-speech">Part of Speech</option>
            </optgroup>
          </select>
        </div>
      </div>
      
      {sortedItems.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4a1 1 0 01-1-1V2a1 1 0 011-1h7a1 1 0 011 1v1a1 1 0 01-1 1H7zM3 6a1 1 0 00-1 1v1a1 1 0 001 1h11a1 1 0 001-1V7a1 1 0 00-1-1H3zM2 11a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6z" />
            </svg>
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No vocabulary items match your search' : 'Your saved vocabulary will appear here'}
            </p>
            <p className="text-gray-500 mt-2 text-sm">Click on words in the video to save them to your collection</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {sortedItems.map(item => (
            <div 
              key={item.id} 
              className="bg-indigo-900/20 p-4 rounded-lg mb-4 border-l-4 border-indigo-500 transition-all hover:bg-indigo-900/30"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{item.original}</h3>
                  <p className="text-gray-300">{item.translation}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-indigo-300 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {item.context && (
                <div className="mt-2 text-sm text-gray-400 bg-indigo-950/30 p-2 rounded italic">
                  "{item.context}"
                </div>
              )}
              
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="bg-indigo-900/70 px-2 py-1 rounded text-indigo-200">
                  Added: {formatDate(item.dateAdded)}
                </span>
                <span className="bg-indigo-900/70 px-2 py-1 rounded text-indigo-200">
                  Reviewed: {item.reviewCount} times
                </span>
                {item.lastReviewed && (
                  <span className="bg-indigo-900/70 px-2 py-1 rounded text-indigo-200">
                    Last: {formatDate(item.lastReviewed)}
                  </span>
                )}
                {item.partOfSpeech && (
                  <span className="bg-indigo-900/70 px-2 py-1 rounded text-indigo-200">
                    {item.partOfSpeech}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-indigo-900/30 flex justify-between items-center text-sm text-indigo-300">
        <div>
          <span>{filteredItems.length}</span> of <span>{items.length}</span> words
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Learn 10-20 new words per day for best results
        </div>
      </div>
    </div>
  );
} 