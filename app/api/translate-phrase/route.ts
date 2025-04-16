import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    
    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }
    
    // First try with Google Translate (this gives better results for phrases)
    try {
      const translationResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=el&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      
      if (!translationResponse.ok) {
        throw new Error('Google translation service error');
      }
      
      const translationData = await translationResponse.json();
      
      // Extract the translation from the response
      if (translationData && translationData[0] && translationData[0][0]) {
        const translation = translationData[0][0][0];
        
        // Log the successful translation
        console.log(`Translated "${text}" to "${translation}"`);
        
        return NextResponse.json({ 
          original: text,
          translation: translation,
          alternatives: translationData[5] ? translationData[5][0][2].map((alt: any) => alt[0]) : []
        });
      }
    } catch (googleError) {
      console.error('Google translation error:', googleError);
      // Continue to fallback
    }
    
    // Fallback to MyMemory as a backup
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=el|en`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Translation service error');
    }
    
    const data = await response.json();
    
    if (data.responseData) {
      return NextResponse.json({ 
        original: text,
        translation: data.responseData.translatedText,
        alternatives: data.matches ? data.matches.slice(0, 3).map((m: any) => m.translation) : []
      });
    } else {
      throw new Error('No translation available');
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ 
      error: 'Translation failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 