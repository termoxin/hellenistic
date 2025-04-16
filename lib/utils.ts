/**
 * Format a timestamp in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a timestamp in seconds to SRT format (HH:MM:SS,MS)
 */
export function formatSrtTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const secs = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${secs},${ms}`;
}

/**
 * Format a date for display (e.g., "Jan 12, 2023")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Split text into individual words
 */
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.trim() !== '');
}

/**
 * Generate a unique ID based on timestamp
 */
export function generateId(): string {
  return Date.now().toString();
}

/**
 * Safely encode a URI component
 */
export function safeEncode(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
} 