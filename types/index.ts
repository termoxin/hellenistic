// Subtitle interface
export interface Subtitle {
  id?: number;
  start: number;
  dur: number;
  text: string;
}

// VideoInfo interface
export interface VideoInfo {
  videoId: string;
  title?: string;
  thumbnails: { url: string }[];
  formats?: any[];
  videoLoadingDisabled?: boolean;
}

// Vocabulary item interface
export interface VocabularyItem {
  id: string;
  original: string;
  translation: string;
  context?: string;
  timestamp?: number;
  videoId?: string;
  dateAdded: string;
  reviewCount: number;
  lastReviewed?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  notes?: string;
}

// Translation result interface
export interface TranslationResult {
  original: string;
  translation: string;
  alternatives?: string[];
  type?: 'word' | 'phrase';
  heading?: string;
  summary?: string;
  glosbe?: string;
  audio?: string[];
  examples?: string[];
  pronunciation?: string;
  partOfSpeech?: string;
}

// VideoPlayer props
export interface VideoPlayerProps {
  videoUrl?: string;
  subtitles: Subtitle[];
  onSubtitleClick: (text: string) => void;
}

// SubtitleDisplay props
export interface SubtitleDisplayProps {
  text: string;
  translatedText?: string;
  isActive: boolean;
  onClick: (text: string) => void;
}

// TranslationTooltip props
export interface TranslationTooltipProps {
  isVisible: boolean;
  data: TranslationResult | null;
  position: { x: number; y: number };
  onClose: () => void;
  onSaveToVocabulary: () => void;
}

// YoutubeForm props
export interface YoutubeFormProps {
  onSuccess: (info: VideoInfo, subtitles: Subtitle[]) => void;
  onError: (error: string) => void;
}

// VocabularyList props
export interface VocabularyListProps {
  items: VocabularyItem[];
  onDelete: (id: string) => void;
  onEdit: (item: VocabularyItem) => void;
}

// Toast notification props
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}

// App settings interface
export interface AppSettings {
  dualSubtitles: boolean;
  autoPause: boolean;
  autoTranslate: boolean;
  playbackRate: number;
} 