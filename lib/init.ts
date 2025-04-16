import fs from 'fs';
import path from 'path';

/**
 * Initializes the required directories for the application
 */
export function initializeDirectories() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Create data directory
  const dataDir = path.join(publicDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }
  
  // Create subtitles directory
  const subtitlesDir = path.join(publicDir, 'subtitles');
  if (!fs.existsSync(subtitlesDir)) {
    fs.mkdirSync(subtitlesDir, { recursive: true });
    console.log('✅ Created subtitles directory');
  }
  
  // Create empty vocabulary file if it doesn't exist
  const vocabFile = path.join(dataDir, 'vocabulary.json');
  if (!fs.existsSync(vocabFile)) {
    fs.writeFileSync(vocabFile, '[]');
    console.log('✅ Created empty vocabulary file');
  }
  
  // Create empty bookmarks file if it doesn't exist
  const bookmarksFile = path.join(dataDir, 'bookmarks.json');
  if (!fs.existsSync(bookmarksFile)) {
    fs.writeFileSync(bookmarksFile, '[]');
    console.log('✅ Created empty bookmarks file');
  }
  
  console.log('🚀 Application initialized successfully!');
} 