import { useState, useEffect } from 'react';
import { PlaySquare, Loader2, WifiOff } from 'lucide-react';
import api from '../../services/api';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import './blocks.css';

export default function VideoBlock({ block }) {
  const [videoId, setVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    let isMounted = true;

    const resolveVideo = async () => {
      setIsLoading(true);
      setHasError(false);

      if (block?.videoId) {
        if (isMounted) {
          setVideoId(block.videoId);
          setIsLoading(false);
        }
        return;
      }

      if (block?.url) {
        let extractedId = null;
        if (block.url.includes('embed/')) {
          extractedId = block.url.split('embed/')[1]?.split('?')[0];
        } else if (block.url.includes('watch?v=')) {
          extractedId = block.url.split('v=')[1]?.split('&')[0];
        } else if (block.url.includes('youtu.be/')) {
          extractedId = block.url.split('youtu.be/')[1]?.split('?')[0];
        }

        if (extractedId) {
          if (isMounted) {
            setVideoId(extractedId);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!isOnline) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const query = block?.query || block?.text;
      if (!query) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/youtube?query=${encodeURIComponent(query)}`);
        const fetchedId = res.data?.videoId || res.data?.data?.videoId;

        if (isMounted && fetchedId) {
          setVideoId(fetchedId);
        } else if (isMounted) {
          setHasError(true);
        }
      } catch (err) {
        console.error('Failed to fetch YouTube video fallback:', err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    resolveVideo();

    return () => {
      isMounted = false;
    };
  }, [block, isOnline]);

  if (!isOnline && !videoId) {
    return (
      <div className="block-video-fallback">
        <WifiOff size={24} />
        <p>Connect to the internet to view video resources.</p>
        <span className="video-query-tag">Search query: {block?.query || block?.text || 'Video'}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="block-video-loading">
        <Loader2 size={24} className="spinner" />
        <p>Loading video resource...</p>
      </div>
    );
  }

  if (hasError || !videoId) {
    return (
      <div className="block-video-fallback">
        <PlaySquare size={24} />
        <p>Video resource unavailable.</p>
      </div>
    );
  }

  return (
    <div className="block-video-wrapper">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={block?.title || block?.query || 'Course Video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="block-video-iframe"
      />
    </div>
  );
}