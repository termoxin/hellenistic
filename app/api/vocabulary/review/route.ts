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
    // Read all vocabulary items
    const vocabularyItems = await readVocabularyData();
    
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
    
    // Return study data with limited items
    const dailyLimit = Math.min(20, Math.max(5, Math.ceil(sortedItems.length / 5)));
    
    return NextResponse.json({
      totalItems: vocabularyItems.length,
      dueItems: sortedItems.filter(item => item.isDue).length,
      masteredItems: vocabularyItems.filter(item => (item.reviewCount || 0) >= 5).length,
      studyItems: sortedItems.slice(0, dailyLimit)
    });
  } catch (error) {
    console.error('Error retrieving study items:', error);
    return NextResponse.json({ error: 'Failed to retrieve study items' }, { status: 500 });
  }
} 