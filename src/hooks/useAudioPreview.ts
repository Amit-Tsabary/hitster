import { useCallback, useEffect, useRef, useState } from 'react';
import type { Song } from '../state/gameTypes';
import { getPreviewUrl } from '../services/audioSource';

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'unavailable';

const PREVIEW_SECONDS = 30;

/**
 * Controls a single hidden <audio> element for the mystery song.
 * Loads the preview for `song`, exposes play/pause/replay, and caps playback at 30s.
 */
export function useAudioPreview(song: Song | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [progress, setProgress] = useState(0); // 0..1 over the 30s window

  // Lazily create the audio element once.
  if (audioRef.current === null && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
  }

  // Load the preview whenever the song changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute('src');
    setProgress(0);
    if (!song) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    getPreviewUrl(song).then((url) => {
      if (cancelled) return;
      if (!url) {
        setStatus('unavailable');
        return;
      }
      audio.src = url;
      audio.load();
      setStatus('ready');
    });
    return () => {
      cancelled = true;
      audio.pause();
    };
  }, [song]);

  // Wire up time/end events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(Math.min(audio.currentTime / PREVIEW_SECONDS, 1));
      if (audio.currentTime >= PREVIEW_SECONDS) {
        audio.pause();
        audio.currentTime = 0;
        setStatus('ready');
        setProgress(0);
      }
    };
    const onEnded = () => {
      setStatus('ready');
      setProgress(0);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.play().then(
      () => setStatus('playing'),
      () => setStatus('ready'),
    );
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus('ready');
  }, []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.currentTime = 0;
    play();
  }, [play]);

  // Stop audio on unmount.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { status, progress, play, pause, replay };
}
