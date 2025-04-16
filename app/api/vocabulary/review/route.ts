import { NextRequest, NextResponse } from 'next/server';
import { VocabularyItem } from '@/types';

// POST to update a vocabulary item's review status
export async function POST(request: NextRequest) {
  try {
    const { id, reviewCount, lastReviewed } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing vocabulary item ID' }, { status: 400 });
    }
    
    // Indicate this needs to be handled on the client side with IndexedDB
    return NextResponse.json({
      clientStorage: true,
      id,
      reviewCount,
      lastReviewed: lastReviewed || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return NextResponse.json({ error: 'Failed to update vocabulary item' }, { status: 500 });
  }
}

// GET to retrieve daily study items
export async function GET() {
  try {
    // For client-side processing, we return a special response
    // The client should use the getStudyItems function from the IndexedDBProvider
    // In environments without IndexedDB support, this endpoint could be expanded
    // to provide server-side calculated study items as a fallback
    return NextResponse.json({
      clientStorage: true,
      message: 'Study items should be calculated on the client using IndexedDB'
    });
  } catch (error) {
    console.error('Error retrieving study items:', error);
    return NextResponse.json({ error: 'Failed to retrieve study items' }, { status: 500 });
  }
} 