import { useState, useRef, useEffect } from 'react';
import { Heart, Menu, ChevronDown, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  src: string;
  color: string;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const playlist: Song[] = [
    {
      id: 1,
      title: "I See Fire",
      artist: "Ed Sheeran",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
      src: "/songs/sample1.mp3",
      color: "#f8b4d9"
    },
    {
      id: 2,
      title: "Midnight Dreams",
      artist: "Luna Rose",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
      src: "/songs/sample2.mp3",
      color: "#a8c5e8"
    },
    {
      id: 3,
      title: "Summer Breeze",
      artist: "Ocean Waves",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop",
      src: "/songs/sample3.mp3",
      color: "#ffd4a3"
    }
  ];

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSongIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePrevious = () => {
    setCurrentSongIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const toggleFavorite = (songId: number) => {
    setFavorites(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const selectSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setShowQueue(false);
    setTimeout(() => audioRef.current?.play(), 100);
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
        background: `linear-gradient(135deg, ${currentSong.color} 0%, ${currentSong.color}dd 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        transition: 'background 0.6s ease',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <audio ref={audioRef} src={currentSong.src} />

      {/* Queue Overlay */}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>Next in Queue</h2>
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
            {playlist.map((song, index) => (
              <div
                key={song.id}
                onClick={() => selectSong(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: index === currentSongIndex ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  transition: 'background 0.2s',
                  marginBottom: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = index === currentSongIndex ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
              >
                <img 
                  src={song.cover} 
                  alt={song.title}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: '0.25rem' }}>{song.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>{song.artist}</div>
                </div>
                {index === currentSongIndex && isPlaying && (
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          background: song.color,
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

      {/* Main Player Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '32px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setShowQueue(false)}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ChevronDown size={20} color="#718096" />
          </button>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2d3748', letterSpacing: '1px' }}>
            Hot Song
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>
          </button>
        </div>

        {/* Album Art */}
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}
        >
          <img 
            src={currentSong.cover} 
            alt={currentSong.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: isPlaying ? 'pulse 3s ease-in-out infinite' : 'none'
            }}
          />
        </div>

        {/* Song Info */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            margin: '0 0 0.5rem 0', 
            color: '#2d3748',
            letterSpacing: '-0.5px'
          }}>
            {currentSong.title}
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#718096', 
            margin: 0,
            fontWeight: 500
          }}>
            {currentSong.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              height: '4px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '2px',
              position: 'relative',
              marginBottom: '0.5rem'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercentage}%`,
                background: currentSong.color,
                borderRadius: '2px',
                transition: 'width 0.1s linear'
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'transform 0.2s'
            }}
          >
            <Heart 
              size={24} 
              fill={favorites.includes(currentSong.id) ? currentSong.color : 'none'}
              color={favorites.includes(currentSong.id) ? currentSong.color : '#718096'}
              style={{ transition: 'all 0.2s' }}
            />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handlePrevious}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <SkipBack size={20} color="#2d3748" fill="#2d3748" />
            </button>

            <button
              onClick={togglePlay}
              style={{
                background: currentSong.color,
                border: 'none',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${currentSong.color}80`,
                transition: 'all 0.2s'
              }}
            >
              {isPlaying ? <Pause size={28} color="white" fill="white" /> : <Play size={28} color="white" fill="white" />}
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <SkipForward size={20} color="#2d3748" fill="#2d3748" />
            </button>
          </div>

          <button
            onClick={() => setShowQueue(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'transform 0.2s'
            }}
          >
            <Menu size={24} color="#718096" />
          </button>
        </div>

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={20} color="#718096" /> : <Volume2 size={20} color="#718096" />}
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                height: '4px',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '2px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${volume * 100}%`,
                  background: currentSong.color,
                  borderRadius: '2px',
                  transition: 'width 0.1s'
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
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