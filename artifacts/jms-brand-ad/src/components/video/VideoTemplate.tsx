import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

import {
  VideoCanvas,
  type VideoAspectRatio,
  useVideoAudio,
  useVideoPlayer,
} from '@/lib/video';

import { BenefitScene } from './BenefitScene';
import { BrandScene } from './BrandScene';
import { CallToActionScene } from './CallToActionScene';
import { HookScene } from './HookScene';
import { ProductsScene } from './ProductsScene';

export const SCENE_DURATIONS = {
  hook: 1900,
  products: 3900,
  benefit: 4350,
  brand: 2900,
  cta: 1950,
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';
const SCENE_COMPONENTS = [
  HookScene,
  ProductsScene,
  BenefitScene,
  BrandScene,
  CallToActionScene,
];

const SCENE_START_SEC: Record<string, number> = (() => {
  const starts: Record<string, number> = {};
  let elapsedMs = 0;
  for (const [key, duration] of Object.entries(SCENE_DURATIONS)) {
    starts[key] = elapsedMs / 1000;
    elapsedMs += duration;
  }
  return starts;
})();

export default function VideoTemplate() {
  const { currentScene, currentSceneKey } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });
  const { muted, paused } = useVideoAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  const SceneComponent = SCENE_COMPONENTS[currentScene];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.46;

    if (paused) {
      audio.pause();
      return;
    }

    const sceneKey = currentSceneKey.replace(/_r[12]$/, '');
    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      const targetTime = SCENE_START_SEC[sceneKey] ?? 0;
      if (Math.abs(audio.currentTime - targetTime) > 0.18) {
        audio.currentTime = targetTime;
      }
    }

    audio.play().catch(() => {});
  }, [currentSceneKey, muted, paused]);

  return (
    <VideoCanvas
      className="film-stage"
      aspectRatio={VIDEO_ASPECT_RATIO}
      style={{ backgroundColor: 'var(--jms-ink-deep)' }}
    >
      <AnimatePresence mode="sync">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
        aria-hidden="true"
      />
    </VideoCanvas>
  );
}
