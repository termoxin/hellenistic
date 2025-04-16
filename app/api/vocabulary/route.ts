import { NextRequest, NextResponse } from 'next/server';
import { VocabularyItem } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// Path to the vocabulary file
const vocabFilePath = path.join(process.cwd(), 'public', 'data', 'vocabulary.json');

// Helper function to read vocabulary data
async function readVocabularyData(): Promise<VocabularyItem[]> {
  try {
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(path.join(process.cwd(), 'public', 'data'), { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
    
    const data = await fs.readFile(vocabFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty array if file doesn't exist
    return [];
  }
}

// Helper function to save vocabulary data
async function saveVocabularyData(data: VocabularyItem[]): Promise<void> {
  // Create data directory if it doesn't exist
  try {
    await fs.mkdir(path.join(process.cwd(), 'public', 'data'), { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
  
  await fs.writeFile(vocabFilePath, JSON.stringify(data, null, 2));
}

// GET all vocabulary items
export async function GET() {
  try {
    const vocabularyItems = await readVocabularyData();
    return NextResponse.json(vocabularyItems);
  } catch (error) {
    console.error('Error reading vocabulary data:', error);
    return NextResponse.json({ error: 'Failed to read vocabulary data' }, { status: 500 });
  }
}

// POST a new vocabulary item or update an existing one
export async function POST(request: NextRequest) {
  try {
    const { original, translation, context, timestamp, videoId } = await request.json();
    
    if (!original || !translation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Read existing vocabulary items
    const vocabularyItems = await readVocabularyData();
    
    // Check if word already exists
    const existingIndex = vocabularyItems.findIndex(item => 
      item.original.toLowerCase() === original.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing entry
      vocabularyItems[existingIndex] = {
        ...vocabularyItems[existingIndex],
        translation,
        context: context || vocabularyItems[existingIndex].context,
        timestamp: timestamp || vocabularyItems[existingIndex].timestamp,
        videoId: videoId || vocabularyItems[existingIndex].videoId,
        reviewCount: (vocabularyItems[existingIndex].reviewCount || 0) + 1,
        lastReviewed: new Date().toISOString()
      };
      
      await saveVocabularyData(vocabularyItems);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Vocabulary updated', 
        item: vocabularyItems[existingIndex] 
      });
    }
    
    // Add new vocabulary item
    const newItem: VocabularyItem = {
      id: Date.now().toString(),
      original,
      translation,
      context: context || '',
      timestamp: timestamp || 0,
      videoId: videoId || '',
      dateAdded: new Date().toISOString(),
      reviewCount: 0,
    };
    
    vocabularyItems.push(newItem);
    await saveVocabularyData(vocabularyItems);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vocabulary added', 
      item: newItem 
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json({ error: 'Failed to update vocabulary' }, { status: 500 });
  }
}

// DELETE a vocabulary item
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing vocabulary ID' }, { status: 400 });
    }
    
    // Read existing vocabulary items
    const vocabularyItems = await readVocabularyData();
    
    // Filter out the item to delete
    const updatedItems = vocabularyItems.filter(item => item.id !== id);
    
    // If the lengths are the same, the item wasn't found
    if (vocabularyItems.length === updatedItems.length) {
      return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 });
    }
    
    await saveVocabularyData(updatedItems);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vocabulary deleted'
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json({ error: 'Failed to delete vocabulary' }, { status: 500 });
  }
} 