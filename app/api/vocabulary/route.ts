import { NextRequest, NextResponse } from 'next/server';
import { VocabularyItem } from '@/types';
import {
  getAllVocabulary,
  saveVocabularyItem,
  findVocabularyItemByOriginal,
  deleteVocabularyItem
} from '@/lib/indexedDB';

// GET all vocabulary items
export async function GET() {
  try {
    // Get data from IndexedDB on the client side
    return NextResponse.json({ clientStorage: true });
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
    
    // Create the base item
    const baseItem = {
      original,
      translation,
      context: context || '',
      timestamp: timestamp || 0,
      videoId: videoId || '',
    };
    
    // Indicate this needs to be handled on the client side with IndexedDB
    return NextResponse.json({
      clientStorage: true,
      item: baseItem
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
    
    // Indicate this needs to be handled on the client side with IndexedDB
    return NextResponse.json({
      clientStorage: true,
      id
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json({ error: 'Failed to delete vocabulary' }, { status: 500 });
  }
} 