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
}

// Create the context
const IndexedDBContext = createContext<IndexedDBContextType | undefined>(undefined);

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

  // Create the context value
  const contextValue: IndexedDBContextType = {
    vocabularyItems,
    isLoading,
    error,
    addVocabularyItem,
    updateVocabularyItem,
    removeVocabularyItem,
    updateReviewStatus,
    initialized
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