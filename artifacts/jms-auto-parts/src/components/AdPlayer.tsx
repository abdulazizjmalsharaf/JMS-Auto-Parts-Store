import { useEffect, useRef, useState } from 'react';
import { Battery, Cog, Disc3, Filter, Pause, Play, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { products } from '../data/catalog';

const scenes = [
  { id: 'hook', duration: 2000, title: 'adStepHook' },
  { id: 'product', duration: 4000, title: 'adStepProduct' },
  { id: 'benefit', duration: 4000, title: 'adStepBenefit' },
  { id: 'brand', duration: 3000, title: 'adStepBrand' },
  { id: 'cta', duration: 2000, title: 'adStepCta' },
] as const;

const totalDuration = scenes.reduce((total, scene) => total + scene.duration, 0);
const featuredProduct = products[0];

function sceneAt(time: number) {
  let start = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const end = start + scene.duration;
    if (time < end || index === scenes.length - 1) {
      return { index, scene, start, progress: Math.min(1, Math.max(0, (time - start) / scene.duration)) };
    }
    start = end;
  }
  return { index: scenes.length - 1, scene: scenes[scenes.length - 1], start: totalDuration - 2000, progress: 1 };
}

export default function AdPlayer() {
  const { language, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const startedRef = useRef(false);
  const current = sceneAt(currentTime);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !startedRef.current && !reducedMotion) {
        startedRef.current = true;
        setPlaying(true);
      } else if (!entry.isIntersecting && playingRef.current) {
        setPlaying(false);
      }
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const next = timeRef.current + now - previous;
      previous = now;
      if (next >= totalDuration) {
        timeRef.current = totalDuration;
        setCurrentTime(totalDuration);
        setPlaying(false);
        return;
      }
      timeRef.current = next;
      setCurrentTime(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const seekTo = (time: number) => {
    const next = Math.min(totalDuration, Math.max(0, time));
    timeRef.current = next;
    setCurrentTime(next);
    startedRef.current = true;
    setPlaying(next < totalDuration);
  };

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (timeRef.current >= totalDuration) {
      timeRef.current = 0;
      setCurrentTime(0);
    }
    startedRef.current = true;
    setPlaying(true);
  };

  const replay = () => {
    timeRef.current = 0;
    setCurrentTime(0);
    startedRef.current = true;
    setPlaying(true);
  };

  const jumpToProducts = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const oldPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(featuredProduct.oldPrice);
  const newPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(featuredProduct.price);
  let sceneStart = 0;

  return (
    <section ref={sectionRef} className="section ad-section" aria-labelledby="jms-ad-title" data-testid="section-jms-ad">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t('adKicker')}</div>
          <h2 id="jms-ad-title" className="section-title">{t('adTitle')}</h2>
        </div>
        <span className="ad-duration">00:15</span>
      </div>

      <div className={`ad-player ${reducedMotion ? 'ad-reduced-motion' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`ad-stage scene-${current.scene.id}`} key={current.scene.id} data-testid={`ad-scene-${current.scene.id}`} aria-live="polite">
          {current.scene.id === 'hook' && (
            <div className="ad-hook-scene">
              <span className="ad-speed-lines" aria-hidden="true" />
              <span className="ad-hook-mark">JMS<span>.</span></span>
              <h3>{t('adHook')}</h3>
              <span className="ad-hook-underline" aria-hidden="true" />
            </div>
          )}

          {current.scene.id === 'product' && (
            <div className="ad-product-scene">
              <div className="ad-origin-flags" aria-label={t('adOriginFlags')}>
                <span title={t('american')}>🇺🇸</span><span title={t('japanese')}>🇯🇵</span><span title={t('chinese')}>🇨🇳</span><span title={t('german')}>🇩🇪</span>
              </div>
              <h3>{t('adProduct')}</h3>
              <div className="ad-parts-row" aria-label={t('adPartsLabel')}>
                {[Disc3, Filter, Battery, Zap].map((Icon, index) => (
                  <div className={`ad-part ad-part-${index + 1}`} key={index}>
                    <span className="ad-part-icon"><Icon size={44} strokeWidth={1.6} /></span>
                    <span>{t((['adBrake', 'adFilter', 'adBattery', 'adSpark'] as const)[index])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {current.scene.id === 'benefit' && (
            <div className="ad-benefit-scene">
              <span className="ad-benefit-orbit" aria-hidden="true"><Cog size={190} strokeWidth={0.7} /></span>
              <div className="ad-price-tag">
                <span className="ad-price-label">{t('adDemoPrice')}</span>
                <span className="ad-old-price">{oldPrice} <small>{t('currency')}</small></span>
                <span className="ad-new-price">{newPrice} <small>{t('currency')}</small></span>
                <span className="ad-quality"><ShieldCheck size={19} />{t('adWarranty')}</span>
              </div>
              <div className="ad-benefit-copy">
                <h3>{t('adBenefit')}</h3>
                <p>{t('adQuality')}</p>
              </div>
            </div>
          )}

          {current.scene.id === 'brand' && (
            <div className="ad-brand-scene">
              <span className="ad-brand-gear" aria-hidden="true"><Cog size={76} strokeWidth={1.3} /></span>
              <div className="ad-brand-lockup"><span>JMS</span><small>{t('tagline')}</small></div>
              <div className="ad-brand-rule" aria-hidden="true" />
            </div>
          )}

          {current.scene.id === 'cta' && (
            <div className="ad-cta-scene">
              <span className="ad-cta-speed" aria-hidden="true" />
              <span className="ad-cta-brand">JMS</span>
              <button type="button" className="ad-cta-button" onClick={jumpToProducts} data-testid="button-ad-shop">
                {t('adCta')} <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
          <span className="ad-scene-count" aria-hidden="true">0{current.index + 1} / 05</span>
        </div>

        <div className="ad-controls">
          <div className="ad-timeline" role="group" aria-label={t('adTimeline')}>
            {scenes.map((scene, index) => {
              const isCurrent = index === current.index;
              const isDone = index < current.index;
              const width = scene.duration / totalDuration * 100;
              const start = sceneStart;
              sceneStart += scene.duration;
              return (
                <button
                  type="button"
                  className={`ad-step ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                  key={scene.id}
                  style={{ flexBasis: `${width}%` }}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${t(scene.title)} — ${t('adSeekToStep')}`}
                  onClick={() => seekTo(start)}
                  data-testid={`button-ad-step-${scene.id}`}
                >
                  <span className="ad-step-fill" style={{ transform: `scaleX(${isDone ? 1 : isCurrent ? current.progress : 0})` }} />
                  <span className="ad-step-label">{t(scene.title)}</span>
                </button>
              );
            })}
          </div>
          <div className="ad-control-row">
            <div className="ad-play-controls">
              <button type="button" className="ad-control-button ad-play-button" onClick={togglePlayback} aria-label={playing ? t('adPause') : t('adPlay')} data-testid="button-ad-play">
                {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
              <button type="button" className="ad-control-button" onClick={replay} aria-label={t('adReplay')} title={t('adReplay')} data-testid="button-ad-replay"><RotateCcw size={15} /></button>
              <span className="ad-time" aria-label={t('adProgress')}>{String(Math.floor(currentTime / 1000)).padStart(2, '0')} / 15</span>
            </div>
            <div className="ad-progress-track" role="progressbar" aria-label={t('adProgress')} aria-valuemin={0} aria-valuemax={15} aria-valuenow={Math.floor(currentTime / 1000)}>
              <span className="ad-progress-value" style={{ width: `${currentTime / totalDuration * 100}%` }} />
            </div>
            <span className="ad-muted-label">{t('adMuted')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
