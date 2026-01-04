
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoContent, PlayerState } from '../types';

interface VideoPlayerProps {
  content: VideoContent;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, onNext, onBack, isFirst, isLast }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.LOADING);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || !audioRef.current || error) return;

    if (videoRef.current.paused) {
      const vPlay = videoRef.current.play();
      const aPlay = audioRef.current.play();
      
      Promise.all([vPlay, aPlay]).catch(err => {
        console.warn("Playback interaction restricted:", err.message || "User interaction required");
        setPlayerState(PlayerState.PAUSED);
      });
      setPlayerState(PlayerState.PLAYING);
    } else {
      videoRef.current.pause();
      audioRef.current.pause();
      setPlayerState(PlayerState.PAUSED);
    }
  }, [error]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !audioRef.current) return;
    videoRef.current.currentTime = 0;
    audioRef.current.currentTime = 0;
    togglePlay();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
    // Periodic Audio/Video Sync logic
    if (videoRef.current && audioRef.current && !videoRef.current.paused) {
      const diff = videoRef.current.currentTime - audioRef.current.currentTime;
      if (Math.abs(diff) > 0.2) {
        audioRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  // Fixed circular dependency by logging only safe error information
  const onMediaError = useCallback((e: any) => {
    const errorMsg = "Could not load video source. The URL might be restricted or unsupported.";
    console.error("Media Error Event:", e.type || "Error occurred");
    setError(errorMsg);
    setPlayerState(PlayerState.PAUSED);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    setError(null);
    setPlayerState(PlayerState.LOADING);
    setProgress(0);

    // Explicitly load sources to ensure clean state
    video.src = content.videoUrl;
    audio.src = content.voiceUrl;
    video.load();
    audio.load();

    const handleCanPlay = async () => {
      // Check if both elements are sufficiently loaded
      if (video.readyState >= 3 && audio.readyState >= 3) {
        try {
          await video.play();
          await audio.play();
          setPlayerState(PlayerState.PLAYING);
        } catch (err) {
          setPlayerState(PlayerState.PAUSED);
        }
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplay', handleCanPlay);
      video.pause();
      audio.pause();
      video.src = "";
      audio.src = "";
    };
  }, [content]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-center select-none" onClick={togglePlay}>
      
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayerState(PlayerState.ENDED)}
        onError={onMediaError}
      />

      <video
        ref={videoRef}
        className="w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: playerState === PlayerState.LOADING ? 0 : 1 }}
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlayerState(PlayerState.ENDED)}
        onError={onMediaError}
      />

      {/* Floating UI Header */}
      <div className="absolute top-16 left-0 right-0 px-8 z-20 pointer-events-none">
        <h1 className="text-white text-2xl font-bold text-shadow tracking-tight">
          {content.title}
        </h1>
        <div className="mt-2 inline-flex">
          <span className="px-2.5 py-1 rounded bg-white/10 backdrop-blur-xl text-[10px] font-black text-white/80 uppercase tracking-widest border border-white/5">
            Voice Over Active
          </span>
        </div>
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-12 text-center bg-black/90 backdrop-blur-2xl">
          <div className="flex flex-col items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
            <div className="space-y-3">
              <h3 className="text-white text-lg font-bold uppercase tracking-widest">Load Failure</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">{error}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
              className="w-full px-8 py-4 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-2xl"
            >
              Reload Player
            </button>
          </div>
        </div>
      )}

      {/* Subtitles Overlay */}
      <div className="absolute bottom-48 inset-x-0 flex flex-col items-center px-8 z-20 pointer-events-none">
        <div className="glass-panel rounded-2xl p-6 w-full text-center shadow-2xl">
          <p className="text-white text-base md:text-lg font-semibold leading-relaxed drop-shadow-lg">
            {content.subtitleText}
          </p>
        </div>
      </div>

      {/* Floating Bottom Controls */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-30 bg-gradient-to-t from-black via-black/60 to-transparent pt-40" onClick={(e) => e.stopPropagation()}>
        
        {/* Animated Progress Tracker */}
        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-10">
          <div 
            className="absolute left-0 top-0 h-full bg-white transition-all duration-150 ease-linear shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            disabled={isFirst}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl glass-panel text-white transition-all active:scale-90 ${
              isFirst ? 'opacity-10 cursor-not-allowed' : 'hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <i className="fas fa-chevron-left text-base"></i>
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleReplay}
              className="w-14 h-14 flex items-center justify-center rounded-2xl glass-panel text-white/50 hover:text-white transition-all active:scale-90"
            >
              <i className="fas fa-redo text-base"></i>
            </button>

            <button 
              onClick={togglePlay}
              className="w-24 h-24 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 active:scale-90 transition-all shadow-2xl ring-8 ring-white/5"
            >
              {playerState === PlayerState.PLAYING ? (
                <i className="fas fa-pause text-3xl"></i>
              ) : (
                <i className="fas fa-play text-3xl ml-1"></i>
              )}
            </button>
          </div>

          <button 
            onClick={onNext}
            disabled={isLast}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl glass-panel text-white transition-all active:scale-90 ${
              isLast ? 'opacity-10 cursor-not-allowed' : 'hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <i className="fas fa-chevron-right text-base"></i>
          </button>
        </div>
      </div>

      {/* Side Utilities */}
      <div className="absolute right-6 bottom-56 flex flex-col gap-4 z-40">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all glass-panel border-white/5 ${isMuted ? 'text-red-400' : 'text-white'}`}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`}></i>
        </button>
      </div>

      {/* Loading Screen Overlay */}
      {playerState === PlayerState.LOADING && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
               <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin" />
               <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-b-white/20 rounded-full animate-pulse" />
            </div>
            <span className="text-white/20 text-[9px] uppercase tracking-[0.5em] font-black">Syncing Stream</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
