'use client';

import { VocabularyItem } from '@/types';
import { 
  getAllVocabulary, 
  importVocabularyFromJSON,
  initDB
} from './indexedDB';

// Function to initialize the database and migrate data if needed
export const initializeClientDatabase = async (): Promise<boolean> => {
  try {
    // Initialize the database
    await initDB();
    
    // Check if we already have data
    const existingItems = await getAllVocabulary();
    
    // If we already have data, no need to migrate
    if (existingItems.length > 0) {
      console.log('IndexedDB already contains data. Skipping migration.');
      return true;
    }
    
    // Try to migrate data from the server (file-based storage)
    try {
      const response = await fetch('/api/vocabulary');
      if (!response.ok) {
        console.log('No server data to migrate or server returned an error.');
        return true;
      }
      
      const data = await response.json();
      
      // Check if we got data with clientStorage flag (new API) or actual data (old API)
      if (data.clientStorage) {
        console.log('Using client-side storage. No data to migrate.');
        return true;
      }
      
      // If we have array data, import it
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Migrating ${data.length} vocabulary items from server to IndexedDB.`);
        await importVocabularyFromJSON(data);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error during data migration:', error);
      // Continue even if migration fails - just start with empty data
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize client database:', error);
    return false;
  }
}; 