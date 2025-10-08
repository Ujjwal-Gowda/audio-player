import { useState, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import axios from 'axios';
import { Search, X, Play, Heart } from 'lucide-react';
import type { Track } from '../pages/home';

interface SearchBarProps {
  onTrackSelect: (track: Track, trackList: Track[]) => void;
  onFavorite: (trackId: string) => void;
}

export default function SearchBar({ onTrackSelect, onFavorite }: SearchBarProps) {
  const auth = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:5000/music/search', {
        headers: { Authorization: `Bearer ${auth?.token}` },
        params: { q: searchQuery, limit: 20 }
      });

      setResults(response.data.tracks || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setTimeout(() => handleSearch(value), 500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      zIndex: 99
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', gap: '0.75rem' }}>
          <Search size={20} color="white" />
          <input
            type="text"
            placeholder="Search for songs, artists..."
            value={query}
            onChange={handleInputChange}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '0.95rem'
            }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowResults(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {showResults && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: '16px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}>
            {isSearching ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>Searching...</div>
            ) : results.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>No results found</div>
            ) : (
              results.map((track) => (
                <div key={track.id} onClick={() => { onTrackSelect(track, results); setShowResults(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <img src={track.cover} alt={track.title} style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#2d3748' }}>{track.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#718096' }}>{track.artist}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onFavorite(track.id); }}
                    style={{ background: 'rgba(102, 126, 234, 0.1)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer' }}>
                    <Heart size={16} color="#667eea" />
                  </button>
                  <button style={{ background: '#667eea', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer' }}>
                    <Play size={16} color="white" fill="white" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}