
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData } from './types';
import VideoPlayer from './components/VideoPlayer';

// Using more standard, reliable sample MP4s from public CDNs to prevent "unsupported source" errors.
const MOCK_DATA: PlayerData = {
  contents: [
    {
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      subtitleText: 'A story about a large, friendly rabbit encountering mischievous forest creatures in a vibrant meadow.',
      title: 'Big Buck Bunny'
    },
    {
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      subtitleText: 'Exploring a strange mechanical world filled with wonder and surreal architecture.',
      title: 'Elephant\'s Dream'
    },
    {
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      subtitleText: 'Experience the heat and energy of a roaring flame, a powerful force of nature captured in high definition.',
      title: 'Blazing Trails'
    },
    {
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      subtitleText: 'Breaking free and finding solitude in the great outdoors. The ultimate escape from the city.',
      title: 'Great Escape'
    },
    {
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      subtitleText: 'Celebrating the small moments of joy and playfulness that make life truly wonderful.',
      title: 'Moments of Joy'
    }
  ]
};

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<PlayerData | null>(null);

  useEffect(() => {
    setData(MOCK_DATA);
  }, []);

  const handleNext = useCallback(() => {
    if (data && currentIndex < data.contents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [data, currentIndex]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  if (!data) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center text-white/40 text-[10px] tracking-[0.5em] uppercase font-bold">
      VocalStream
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div 
          className="absolute inset-[-50%] opacity-15 blur-[160px] transition-all duration-1000 animate-pulse"
          style={{
            background: currentIndex % 2 === 0 
              ? 'radial-gradient(circle at top right, #4338ca, transparent)' 
              : 'radial-gradient(circle at bottom left, #db2777, transparent)'
          }}
        />
      </div>

      <div className="video-wrapper">
        <VideoPlayer 
          content={data.contents[currentIndex]} 
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentIndex === 0}
          isLast={currentIndex === data.contents.length - 1}
        />
        
        {/* Progress Navigation */}
        <div className="absolute top-8 left-0 right-0 px-8 flex gap-1.5 z-50">
          {data.contents.map((_, idx) => (
            <div 
              key={idx}
              className="h-[3px] flex-1 rounded-full bg-white/10 overflow-hidden"
            >
              <div 
                className={`h-full bg-white transition-all duration-500 ease-in-out ${
                  idx === currentIndex ? 'w-full opacity-100' : idx < currentIndex ? 'w-full opacity-20' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
