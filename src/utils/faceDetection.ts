import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let isInitializing = false;

export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  if (isInitializing) {
    // Wait for initialization
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (faceLandmarker) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    return faceLandmarker!;
  }

  isInitializing = true;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
    });

    return faceLandmarker;
  } finally {
    isInitializing = false;
  }
}

export async function detectFace(
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<Array<{ x: number; y: number }>> {
  const landmarker = await initFaceLandmarker();

  let result;
  if (image instanceof HTMLVideoElement) {
    result = landmarker.detectForVideo(image, performance.now());
  } else {
    result = landmarker.detect(image);
  }

  if (result.faceLandmarks && result.faceLandmarks.length > 0) {
    return result.faceLandmarks[0].map((lm) => ({ x: lm.x, y: lm.y }));
  }

  return [];
}

export function releaseFaceLandmarker() {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
}
