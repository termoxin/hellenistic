'use client';

import { VocabularyItem } from '@/types';

// Constants
const DB_NAME = 'greek-english-app';
const DB_VERSION = 1;
const VOCABULARY_STORE = 'vocabulary';

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Open the database
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (called when the database is created or version changes)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the vocabulary object store if it doesn't exist
      if (!db.objectStoreNames.contains(VOCABULARY_STORE)) {
        const store = db.createObjectStore(VOCABULARY_STORE, { keyPath: 'id' });
        
        // Create indexes for searching and sorting
        store.createIndex('original', 'original', { unique: false });
        store.createIndex('dateAdded', 'dateAdded', { unique: false });
        store.createIndex('reviewCount', 'reviewCount', { unique: false });
        store.createIndex('lastReviewed', 'lastReviewed', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Get all vocabulary items from IndexedDB
 */
export const getAllVocabulary = async (): Promise<VocabularyItem[]> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VOCABULARY_STORE, 'readonly');
      const store = transaction.objectStore(VOCABULARY_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting vocabulary from IndexedDB:', error);
    return [];
  }
};

/**
 * Add or update a vocabulary item in IndexedDB
 */
export const saveVocabularyItem = async (
  item: VocabularyItem
): Promise<VocabularyItem> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VOCABULARY_STORE, 'readwrite');
      const store = transaction.objectStore(VOCABULARY_STORE);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error saving vocabulary to IndexedDB:', error);
    throw error;
  }
};

/**
 * Delete a vocabulary item from IndexedDB
 */
export const deleteVocabularyItem = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VOCABULARY_STORE, 'readwrite');
      const store = transaction.objectStore(VOCABULARY_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error deleting vocabulary from IndexedDB:', error);
    throw error;
  }
};

/**
 * Get a vocabulary item by ID
 */
export const getVocabularyItem = async (id: string): Promise<VocabularyItem | null> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VOCABULARY_STORE, 'readonly');
      const store = transaction.objectStore(VOCABULARY_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting vocabulary item from IndexedDB:', error);
    return null;
  }
};

/**
 * Check if a vocabulary item exists by original text
 */
export const findVocabularyItemByOriginal = async (
  original: string
): Promise<VocabularyItem | null> => {
  try {
    const allItems = await getAllVocabulary();
    return allItems.find(
      item => item.original.toLowerCase() === original.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error finding vocabulary by original text:', error);
    return null;
  }
};

/**
 * Import vocabulary from JSON data (for migration from file-based storage)
 */
export const importVocabularyFromJSON = async (items: VocabularyItem[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(VOCABULARY_STORE, 'readwrite');
    const store = transaction.objectStore(VOCABULARY_STORE);
    
    // Add each item to the store
    for (const item of items) {
      store.put(item);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error importing vocabulary to IndexedDB:', error);
    throw error;
  }
};

/**
 * Export all vocabulary items to JSON
 */
export const exportVocabularyToJSON = async (): Promise<VocabularyItem[]> => {
  return getAllVocabulary();
}; 