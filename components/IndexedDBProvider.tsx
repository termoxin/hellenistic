'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { VocabularyItem } from '@/types';
import {
  initDB,
  getAllVocabulary,
  saveVocabularyItem,
  deleteVocabularyItem,
  findVocabularyItemByOriginal,
  getVocabularyItem,
  importVocabularyFromJSON
} from '@/lib/indexedDB';
import { initializeClientDatabase } from '@/lib/clientDbInit';

// Define the context type
interface IndexedDBContextType {
  vocabularyItems: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  addVocabularyItem: (item: Partial<VocabularyItem>) => Promise<VocabularyItem>;
  updateVocabularyItem: (item: VocabularyItem) => Promise<VocabularyItem>;
  removeVocabularyItem: (id: string) => Promise<void>;
  updateReviewStatus: (id: string, reviewCount?: number, lastReviewed?: string) => Promise<VocabularyItem | null>;
  initialized: boolean;
  getStudyItems: () => StudyData;
}

// Create the context
const IndexedDBContext = createContext<IndexedDBContextType | undefined>(undefined);

// Add this interface to define study data
interface StudyData {
  totalItems: number;
  dueItems: number;
  masteredItems: number;
  studyItems: (VocabularyItem & { 
    dueDate: Date | null;
    isDue: boolean;
  })[];
}

// Create the provider component
export const IndexedDBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize the database and load data
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        
        // Use the utility to initialize and migrate data
        await initializeClientDatabase();
        
        // Fetch the vocabulary items
        const items = await getAllVocabulary();
        setVocabularyItems(items);
        setInitialized(true);
      } catch (e) {
        console.error('Failed to initialize IndexedDB:', e);
        setError('Failed to initialize local storage. Some features may not work correctly.');
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeDB();
    }
  }, []);

  // Add a new vocabulary item
  const addVocabularyItem = async (itemData: Partial<VocabularyItem>): Promise<VocabularyItem> => {
    try {
      // Check if item already exists
      const existingItem = itemData.original 
        ? await findVocabularyItemByOriginal(itemData.original)
        : null;

      if (existingItem) {
        // Update existing item
        const updatedItem: VocabularyItem = {
          ...existingItem,
          translation: itemData.translation || existingItem.translation,
          context: itemData.context || existingItem.context || '',
          timestamp: itemData.timestamp || existingItem.timestamp || 0,
          videoId: itemData.videoId || existingItem.videoId || '',
          reviewCount: (existingItem.reviewCount || 0) + 1,
          lastReviewed: new Date().toISOString()
        };

        await saveVocabularyItem(updatedItem);

        // Update state
        setVocabularyItems(current => 
          current.map(item => item.id === updatedItem.id ? updatedItem : item)
        );

        return updatedItem;
      } else {
        // Create new item
        const newItem: VocabularyItem = {
          id: Date.now().toString(),
          original: itemData.original || '',
          translation: itemData.translation || '',
          context: itemData.context || '',
          timestamp: itemData.timestamp || 0,
          videoId: itemData.videoId || '',
          dateAdded: new Date().toISOString(),
          reviewCount: 0,
        };

        await saveVocabularyItem(newItem);

        // Update state
        setVocabularyItems(current => [...current, newItem]);

        return newItem;
      }
    } catch (e) {
      console.error('Error adding vocabulary item:', e);
      setError('Failed to add vocabulary item');
      throw e;
    }
  };

  // Update an existing vocabulary item
  const updateVocabularyItem = async (item: VocabularyItem): Promise<VocabularyItem> => {
    try {
      await saveVocabularyItem(item);
      
      // Update state
      setVocabularyItems(current => 
        current.map(i => i.id === item.id ? item : i)
      );
      
      return item;
    } catch (e) {
      console.error('Error updating vocabulary item:', e);
      setError('Failed to update vocabulary item');
      throw e;
    }
  };

  // Remove a vocabulary item
  const removeVocabularyItem = async (id: string): Promise<void> => {
    try {
      await deleteVocabularyItem(id);
      
      // Update state
      setVocabularyItems(current => current.filter(item => item.id !== id));
    } catch (e) {
      console.error('Error removing vocabulary item:', e);
      setError('Failed to remove vocabulary item');
      throw e;
    }
  };

  // Update review status for a vocabulary item
  const updateReviewStatus = async (
    id: string,
    reviewCount?: number,
    lastReviewed?: string
  ): Promise<VocabularyItem | null> => {
    try {
      const item = await getVocabularyItem(id);
      
      if (!item) {
        return null;
      }
      
      const updatedItem: VocabularyItem = {
        ...item,
        reviewCount: reviewCount !== undefined ? reviewCount : (item.reviewCount || 0) + 1,
        lastReviewed: lastReviewed || new Date().toISOString()
      };
      
      await saveVocabularyItem(updatedItem);
      
      // Update state
      setVocabularyItems(current => 
        current.map(i => i.id === id ? updatedItem : i)
      );
      
      return updatedItem;
    } catch (e) {
      console.error('Error updating review status:', e);
      setError('Failed to update review status');
      return null;
    }
  };

  // Add this function to the provider component
  const getStudyItems = (): StudyData => {
    // Calculate due dates and sort by priority
    const now = new Date();
    const itemsWithDueDate = vocabularyItems.map(item => {
      // Calculate next review date based on last review and review count
      let dueDate: Date | null = null;
      
      if (item.lastReviewed) {
        const lastReviewed = new Date(item.lastReviewed);
        dueDate = new Date(lastReviewed);
        
        // Spaced repetition intervals in days (1, 3, 7, 14, 30, 90, 180)
        const intervals = [1, 3, 7, 14, 30, 90, 180];
        const interval = intervals[Math.min(item.reviewCount || 0, intervals.length - 1)];
        
        dueDate.setDate(dueDate.getDate() + interval);
      }
      
      return {
        ...item,
        dueDate,
        isDue: dueDate ? dueDate <= now : true // Never-reviewed words are always due
      };
    });
    
    // Sort items by priority
    const sortedItems = [...itemsWithDueDate].sort((a, b) => {
      // Priority 1: Due items first
      if (a.isDue && !b.isDue) return -1;
      if (!a.isDue && b.isDue) return 1;
      
      // Priority 2: Never reviewed items
      if (a.reviewCount === 0 && b.reviewCount !== 0) return -1;
      if (a.reviewCount !== 0 && b.reviewCount === 0) return 1;
      
      // Priority 3: Sort by due date (earliest first)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      // Priority 4: Sort by date added (oldest first)
      return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    });
    
    // Calculate daily limit
    const dailyLimit = Math.min(20, Math.max(5, Math.ceil(sortedItems.length / 5)));
    
    return {
      totalItems: vocabularyItems.length,
      dueItems: sortedItems.filter(item => item.isDue).length,
      masteredItems: vocabularyItems.filter(item => (item.reviewCount || 0) >= 5).length,
      studyItems: sortedItems.slice(0, dailyLimit)
    };
  };

  // Create the context value
  const contextValue: IndexedDBContextType = {
    vocabularyItems,
    isLoading,
    error,
    addVocabularyItem,
    updateVocabularyItem,
    removeVocabularyItem,
    updateReviewStatus,
    initialized,
    getStudyItems
  };

  return (
    <IndexedDBContext.Provider value={contextValue}>
      {children}
    </IndexedDBContext.Provider>
  );
};

// Custom hook to use the IndexedDB context
export const useIndexedDB = (): IndexedDBContextType => {
  const context = useContext(IndexedDBContext);
  if (context === undefined) {
    throw new Error('useIndexedDB must be used within an IndexedDBProvider');
  }
  return context;
}; 