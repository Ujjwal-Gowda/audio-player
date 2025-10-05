import { useRef, useState, useEffect } from "react";
import "../styles/modernAudioPlayer.css";

interface Song {
  id: number;
  title: string;
  artist: string;
  src: string;
  cover?: string;
}

const ModernAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Sample playlist - replace with your actual songs
  const playlist: Song[] = [
    {
      id: 1,
      title: "Summer Vibes",
      artist: "Artist Name",
      src: "/songs/sample1.mp3",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Midnight Dreams",
      artist: "Another Artist",
      src: "/songs/sample2.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Chill Beats",
      artist: "Beat Maker",
      src: "/songs/sample3.mp3",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop"
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

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="modern-audio-player">
      <audio ref={audioRef} src={currentSong.src} />

      {/* Album Art */}
      <div className="album-art">
        <img 
          src={currentSong.cover || "https://via.placeholder.com/300"} 
          alt={currentSong.title}
          className={isPlaying ? "rotating" : ""}
        />
      </div>

      {/* Song Info */}
      <div className="song-info">
        <h2 className="song-title">{currentSong.title}</h2>
        <p className="song-artist">{currentSong.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <span className="time">{formatTime(currentTime)}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
          <input
            type="range"
            className="progress-input"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
          />
        </div>
        <span className="time">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          className="control-btn secondary" 
          onClick={handlePrevious}
          title="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 20L9 12l10-8v16zm-11 0V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button 
          className="control-btn primary" 
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button 
          className="control-btn secondary" 
          onClick={handleNext}
          title="Next"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 4l10 8-10 8V4zm11 0v16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <button 
          className="volume-btn" 
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : volume < 0.5 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      {/* Playlist */}
      <div className="playlist">
        {playlist.map((song, index) => (
          <div
            key={song.id}
            className={`playlist-item ${index === currentSongIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentSongIndex(index);
              setIsPlaying(true);
              setTimeout(() => audioRef.current?.play(), 100);
            }}
          >
            <div className="playlist-item-info">
              <span className="playlist-item-title">{song.title}</span>
              <span className="playlist-item-artist">{song.artist}</span>
            </div>
            {index === currentSongIndex && isPlaying && (
              <div className="playing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernAudioPlayer;