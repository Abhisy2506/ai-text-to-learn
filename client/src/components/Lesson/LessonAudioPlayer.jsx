import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useCourse } from '../../context/CourseContext';
import courseRepository from '../../services/courseRepository';

export default function LessonAudioPlayer() {
  const { activeLesson, setActiveLesson, isOnline } = useCourse();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setError(null);

    if (activeLesson?.audioData) {
      setAudioUrl(`data:audio/wav;base64,${activeLesson.audioData}`);
    } else {
      setAudioUrl(null);
    }
  }, [activeLesson?._id, activeLesson?.audioData]);

  if (!activeLesson) return null;

  const handlePlayToggle = async () => {
    setError(null);

    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    if (!isOnline) {
      setError('You are offline.');
      return;
    }

    try {
      setLoading(true);
      const token = isAuthenticated ? await getAccessTokenSilently() : null;

      const data = await courseRepository.getLessonHinglishAudio(
        activeLesson._id,
        token
      );

      if (data?.audioBase64) {
        const soundSrc = `data:audio/mp3;base64,${data.audioBase64}`;
        setAudioUrl(soundSrc);

        setActiveLesson((prev) => ({
          ...prev,
          audioData: data.audioBase64,
          hinglishContent: data.hinglishText || prev?.hinglishContent,
        }));

        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 150);
      } else {
        throw new Error('No audio returned by backend');
      }
    } catch (err) {
      console.error('Hinglish Audio Error:', err);
      setError('Failed to load audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audio-player-wrapper">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onError={() => setIsPlaying(false)}
        />
      )}

      <button
        onClick={handlePlayToggle}
        disabled={loading}
        type="button"
        className={`audio-toggle-btn ${isPlaying ? 'playing' : ''}`}
      >
        {loading ? (
          <Loader2 className="audio-btn-spinner" size={16} />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Volume2 size={16} />
        )}
        <span>
          {loading
            ? 'Generating Audio...'
            : isPlaying
            ? 'Pause Audio'
            : 'Explain in Hinglish'}
        </span>
      </button>

      {error && <span className="audio-error-text">{error}</span>}
    </div>
  );
}