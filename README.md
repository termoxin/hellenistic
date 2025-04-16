# Hellenistic - Greek Learning Companion

A Next.js application for learning the Greek language through videos with interactive subtitles, vocabulary building, and translation tools.

## Features

- **Video Learning**: Watch YouTube videos with Greek subtitles
- **Interactive Subtitles**: Click on words or sentences to see translations
- **Dual Subtitles**: Display both Greek and English translations simultaneously
- **Vocabulary Collection**: Save words and phrases to your personal vocabulary list
- **Bookmarks**: Create bookmarks at specific points in videos for later review
- **Translation Tools**: Translate Greek text with alternatives and examples

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks and Context
- **API**: Next.js API Routes
- **External APIs**: YouTube, Google Translate, MyMemory

## Project Structure

```
├── app/                # Next.js app directory
│   ├── api/            # API route handlers
│   ├── page.tsx        # Main application page
│   └── layout.tsx      # Root layout component
├── components/         # Reusable React components
├── lib/                # Utility functions and helpers
├── public/             # Static assets 
│   ├── data/           # JSON storage for vocabulary and bookmarks
│   └── subtitles/      # Downloaded SRT subtitle files
└── types/              # TypeScript type definitions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Watch Videos**: Enter a YouTube URL in the input field and click "Fetch Subtitles"
2. **Translate Text**: Click on any word or select a phrase in the subtitles to see its translation
3. **Save Words**: Use the "Save to Vocabulary" button to add words to your collection
4. **Create Bookmarks**: Click the "Add Bookmark" button to save important parts of the video
5. **Review Vocabulary**: Switch to the Vocabulary tab to see and manage your saved words

## Development

To work on this project:

1. Fork and clone the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT 