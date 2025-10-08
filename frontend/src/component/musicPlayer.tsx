import { useState, useRef, useEffect } from 'react';
import { Heart, Menu, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import type { Track } from '../pages/home';

interface MusicPlayerProps {
  currentTrack: Track;
  playlist: Track[];
  onNext: () => void;
  onPrevious: () => void;
  onTrackSelect: (track: Track) => void;
  onFavorite: (trackId: string) => void;
}

export default function MusicPlayer({ 
  currentTrack, 
  playlist, 
  onNext, 
  onPrevious, 
  onTrackSelect,
  onFavorite 
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => onNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, onNext]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error('Playback failed:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFavorite = () => {
    onFavorite(currentTrack.id);
    setIsFavorited(!isFavorited);
  };

  const selectSong = (track: Track) => {
    onTrackSelect(track);
    setShowQueue(false);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      style={{
        background: `linear-gradient(135deg, #f8b4d9 0%, #f8b4d9dd 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem' : '2rem',
        paddingTop: isMobile ? '10rem' : '12rem',
        transition: 'background 0.6s ease',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <audio ref={audioRef} src={currentTrack.audioUrl} />

      {showQueue && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setShowQueue(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxHeight: '70vh',
              overflowY: 'auto',
              padding: '2rem',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>Queue</h2>
              <button
                onClick={() => setShowQueue(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: 0
                }}
              >×</button>
            </div>
            {playlist.map((track) => (
              <div
                key={track.id}
                onClick={() => selectSong(track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: track.id === currentTrack.id ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  transition: 'background 0.2s',
                  marginBottom: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = track.id === currentTrack.id ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
              >
                <img 
                  src={track.cover || 'https://via.placeholder.com/50'} 
                  alt={track.title}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: '0.25rem' }}>{track.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>{track.artist}</div>
                </div>
                {track.id === currentTrack.id && isPlaying && (
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          background: '#f8b4d9',
                          borderRadius: '2px',
                          animation: `bounce 1s ease-in-out infinite ${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '24px' : '32px',
          padding: isMobile ? '1.5rem' : '2.5rem',
          width: '100%',
          maxWidth: isMobile ? '360px' : '480px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: isMobile ? '16px' : '20px',
            overflow: 'hidden',
            marginBottom: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <img 
            src={currentTrack.cover || 'https://via.placeholder.com/500'}
            alt={currentTrack.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: isPlaying ? 'pulse 3s ease-in-out infinite' : 'none'
            }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.25rem' : '1.5rem', 
            fontWeight: 700, 
            margin: '0 0 0.5rem 0', 
            color: 'white',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>
            {currentTrack.title}
          </h2>
          <p style={{ 
            fontSize: isMobile ? '0.9rem' : '1rem', 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: 0,
            fontWeight: 500
          }}>
            {currentTrack.artist}
          </p>
        </div>

        <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <div
            style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              position: 'relative',
              marginBottom: '0.5rem'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercentage}%`,
                background: 'white',
                borderRadius: '2px',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                position: 'absolute',
                top: '-6px',
                left: 0,
                width: '100%',
                height: '16px',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: isMobile ? '0.7rem' : '0.75rem', 
            color: 'rgba(255, 255, 255, 0.7)' 
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={toggleFavorite}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'transform 0.2s',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart 
              size={isMobile ? 22 : 24} 
              fill={isFavorited ? 'white' : 'none'}
              color="white"
              style={{ 
                transition: 'all 0.2s',
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
              }}
            />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
            <button
              onClick={onPrevious}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: isMobile ? '44px' : '52px',
                height: isMobile ? '44px' : '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <SkipBack size={isMobile ? 18 : 20} color="white" fill="white" />
            </button>

            <button
              onClick={togglePlay}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: isMobile ? '56px' : '68px',
                height: isMobile ? '56px' : '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={isMobile ? 24 : 28} color="#f8b4d9" fill="#f8b4d9" /> : <Play size={isMobile ? 24 : 28} color="#f8b4d9" fill="#f8b4d9" />}
            </button>

            <button
              onClick={onNext}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: isMobile ? '44px' : '52px',
                height: isMobile ? '44px' : '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <SkipForward size={isMobile ? 18 : 20} color="white" fill="white" />
            </button>
          </div>

          <button
            onClick={() => setShowQueue(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'transform 0.2s',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={isMobile ? 22 : 24} color="white" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}