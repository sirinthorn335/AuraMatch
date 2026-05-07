import { useState, useCallback, useRef } from 'react';
import { detectFace, initFaceLandmarker } from '../utils/faceDetection';

interface UseFaceDetectionReturn {
  landmarks: Array<{ x: number; y: number }>;
  isLoaded: boolean;
  isDetecting: boolean;
  error: string | null;
  detectImage: (image: HTMLImageElement | HTMLCanvasElement) => Promise<void>;
  detectVideo: (video: HTMLVideoElement) => Promise<void>;
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const [landmarks, setLandmarks] = useState<Array<{ x: number; y: number }>>(
    [],
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);

  const detectImage = useCallback(
    async (image: HTMLImageElement | HTMLCanvasElement) => {
      try {
        setIsDetecting(true);
        setError(null);

        if (!isLoaded) {
          await initFaceLandmarker();
          setIsLoaded(true);
        }

        const result = await detectFace(image);
        setLandmarks(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Detection failed');
      } finally {
        setIsDetecting(false);
      }
    },
    [isLoaded],
  );

  const detectVideo = useCallback(
    async (video: HTMLVideoElement) => {
      if (!video.readyState || video.paused) return;

      try {
        if (!isLoaded) {
          await initFaceLandmarker();
          setIsLoaded(true);
        }

        const result = await detectFace(video);
        setLandmarks(result);
      } catch {
        // Ignore errors during continuous video detection
      }

      // Throttle to ~5fps
      animFrameRef.current = window.setTimeout(() => {
        detectVideo(video);
      }, 200);
    },
    [isLoaded],
  );

  return {
    landmarks,
    isLoaded,
    isDetecting,
    error,
    detectImage,
    detectVideo,
  };
}
