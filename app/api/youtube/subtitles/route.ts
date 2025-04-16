import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import ytdl from 'ytdl-core';
import { promises as fs } from 'fs';
import path from 'path';
import { Subtitle } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');
    const languageCode = searchParams.get('lang') || 'el';
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }
    
    let videoID;
    try {
      videoID = ytdl.getVideoID(videoUrl);
    } catch (idErr) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    let subtitles: Subtitle[] = [];
    let error = null;
    
    // Try to get subtitles directly from basic info
    try {
      const info = await ytdl.getBasicInfo(videoUrl);
      
      // Check for captions in the video details
      const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (captionTracks && captionTracks.length > 0) {
        // Look for Greek captions or auto-generated captions
        let captionTrack = captionTracks.find((track: any) => 
          track.languageCode === languageCode || 
          track.name?.simpleText?.toLowerCase().includes('greek')
        );
        
        // If no specific Greek captions found, try to get auto-generated ones
        if (!captionTrack) {
          captionTrack = captionTracks.find((track: any) => 
            track.kind === 'asr' || // Auto-generated
            track.name?.simpleText?.toLowerCase().includes('auto') // Auto-generated
          );
        }
        
        if (captionTrack) {
          console.log('Found caption track:', captionTrack.name?.simpleText);
          
          // Fetch the subtitle content from the baseUrl
          const captionResponse = await fetch(captionTrack.baseUrl);
          if (!captionResponse.ok) throw new Error('Failed to fetch caption content');
          
          const captionXml = await captionResponse.text();
          
          // Parse the XML content
          const dom = new JSDOM(captionXml, { contentType: 'text/xml' });
          const transcript = dom.window.document.querySelector('transcript');
          
          if (transcript) {
            // Extract individual caption elements
            const textElements = Array.from(transcript.querySelectorAll('text'));
            
            subtitles = textElements.map((text: Element) => {
              const start = parseFloat(text.getAttribute('start') || '0');
              const dur = parseFloat(text.getAttribute('dur') || '5');
              return {
                start,
                dur,
                text: text.textContent?.trim() || ''
              };
            });
          }
        } else {
          error = 'No Greek or auto-generated subtitles found for this video';
        }
      } else {
        error = 'No captions available for this video';
      }
    } catch (err) {
      console.error('Error fetching subtitles from YouTube:', err);
      error = 'Could not fetch subtitles automatically';
    }
    
    // Provide sample subtitles for testing if real ones can't be fetched
    if (subtitles.length === 0) {
      console.log('Using sample subtitles for development');
      subtitles = [
        { start: 0, dur: 5, text: 'Γεια σας και καλώς ήρθατε' },
        { start: 5, dur: 5, text: 'Αυτό είναι ένα δείγμα υπότιτλου' },
        { start: 10, dur: 5, text: 'για δοκιμή της εφαρμογής μετάφρασης' },
        { start: 15, dur: 5, text: 'Ελπίζω να σας αρέσει!' },
        { start: 20, dur: 5, text: 'Ευχαριστώ πολύ για την προσοχή σας' }
      ];
    }
    
    // Convert to SRT format
    let srtContent = '';
    subtitles.forEach((caption, index) => {
      const startTime = formatTime(caption.start);
      const endTime = formatTime(caption.start + caption.dur);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${caption.text}\n\n`;
    });
    
    // Create the subtitles directory and srt file
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const subtitlesDir = path.join(publicDir, 'subtitles');
      
      try {
        await fs.mkdir(subtitlesDir, { recursive: true });
      } catch (mkdirErr) {
        console.error('Error creating subtitles directory:', mkdirErr);
      }
      
      const srtPath = path.join(subtitlesDir, `${videoID}_${languageCode}.srt`);
      await fs.writeFile(srtPath, srtContent);
    } catch (fsError) {
      console.error('Error saving SRT file:', fsError);
    }
    
    return NextResponse.json({ 
      success: true, 
      srtUrl: `/subtitles/${videoID}_${languageCode}.srt`,
      subtitles,
      warning: error ? 'Using sample subtitles due to: ' + error : null,
      videoLoadingDisabled: true
    });
  } catch (error) {
    console.error('Error handling YouTube subtitles:', error);
    return NextResponse.json({ error: 'Failed to handle subtitles' }, { status: 500 });
  }
}

// Helper function to format time for SRT
function formatTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const secs = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${secs},${ms}`;
} 