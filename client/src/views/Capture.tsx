import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../store/auth';
import type { Video } from '../types';

export default function Capture() {
  const navigate = useNavigate();
  const liveRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [audio, setAudio] = useState(true);
  const [hasStream, setHasStream] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const canRecord = hasStream && !recording;

  function cleanup() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setHasStream(false);
  }

  async function capture(kind: 'screen' | 'camera') {
    cleanup();
    try {
      const mediaStream =
        kind === 'screen'
          ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio })
          : await navigator.mediaDevices.getUserMedia({ video: true, audio });

      streamRef.current = mediaStream;
      setHasStream(true);
      if (liveRef.current) liveRef.current.srcObject = mediaStream;
      mediaStream.getVideoTracks()[0].addEventListener('ended', stop);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function start() {
    const type = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const chunks: BlobPart[] = [];

    const recorder = new MediaRecorder(streamRef.current!, { mimeType: type });
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const recordedBlob = new Blob(chunks, { type });
      setBlob(recordedBlob);
      if (previewRef.current) previewRef.current.src = URL.createObjectURL(recordedBlob);
      setTitle(`Recording ${new Date().toLocaleString()}`);
    };
    recorder.start(500);
    recorderRef.current = recorder;
    setRecording(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!blob) return;
    setSaving(true);
    const f = new FormData();
    f.append('video', blob, 'recording.webm');
    f.append('title', title);
    f.append('description', description);

    try {
      const data = await auth.request<{ video: Video }>('/api/videos', {
        method: 'POST',
        body: f,
      });
      navigate(`/videos/${data.video.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => cleanup, []);

  return (
    <section>
      <div className="title-row">
        <div>
          <span className="eyebrow">Recorder</span>
          <h1>Capture a video</h1>
        </div>
      </div>

      <div className="card capture">
        {!blob ? (
          <>
            <video
              ref={liveRef}
              autoPlay
              muted
              playsInline
            />

            {!hasStream ? (
              <div className="capture-actions">
                <button
                  className="button"
                  onClick={() => capture('screen')}
                >
                  Share screen
                </button>
                <button
                  className="button secondary"
                  onClick={() => capture('camera')}
                >
                  Use webcam
                </button>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={audio}
                    onChange={(e) => setAudio(e.target.checked)}
                  />
                  Include audio
                </label>
              </div>
            ) : (
              <div className="capture-actions">
                {canRecord ? (
                  <button
                    className="button danger"
                    onClick={start}
                  >
                    Start recording
                  </button>
                ) : (
                  <button
                    className="button danger"
                    onClick={stop}
                  >
                    Stop recording
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={save}>
            <video
              ref={previewRef}
              controls
            />
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </label>
            <button
              className="button"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save video'}
            </button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
