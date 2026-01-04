
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerData } from './types';
import { MOCK_DATA } from './data';
import VideoPlayer from './components/VideoPlayer';

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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-zinc-900">
      {/* Immersive 16:9 Cute Background Video */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover scale-110 opacity-90 brightness-90 transition-all duration-1000"
        >
          <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
        </video>
        {/* Subtle Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="video-wrapper z-10">
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
