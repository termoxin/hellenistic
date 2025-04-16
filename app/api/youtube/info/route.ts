import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

interface VideoInfo {
  videoId: string;
  thumbnails: { url: string }[];
  title?: string;
  formats?: any[];
  videoLoadingDisabled?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }
    
    // Extract video ID
    let videoID;
    try {
      videoID = ytdl.getVideoID(videoUrl);
    } catch (idErr) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Get basic video info first
    const basicInfo: VideoInfo = {
      videoId: videoID,
      thumbnails: [
        { url: `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg` },
        { url: `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` }
      ]
    };
    
    // Try to get detailed info, but don't fail if it doesn't work
    try {
      const info = await ytdl.getBasicInfo(videoUrl);
      basicInfo.title = info.videoDetails.title;
      
      // Video formats functionality hidden for now
      basicInfo.formats = [];
    } catch (infoErr) {
      console.error('Error getting detailed video info:', infoErr);
      basicInfo.title = 'YouTube Video';
      basicInfo.formats = [];
    }
    
    // Set videoLoadingDisabled flag to true
    basicInfo.videoLoadingDisabled = true;
    
    return NextResponse.json(basicInfo);
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    return NextResponse.json({ error: 'Failed to get video info' }, { status: 500 });
  }
} 