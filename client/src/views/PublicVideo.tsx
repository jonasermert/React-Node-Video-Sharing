import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Video } from '../types';

export default function PublicVideo() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/public/videos/${id}`).then(async (response) => {
      if (response.ok) {
        setVideo((await response.json()).video);
      } else {
        setError('Video not found');
      }
    });
  }, [id]);

  if (video) {
    return (
      <div className="public card">
        <video
          src={video.videoUrl}
          controls
          autoPlay
        />
        <h1>{video.title}</h1>
        <p>{video.description}</p>
      </div>
    );
  }

  return <p className="error center">{error || 'Loading…'}</p>;
}
