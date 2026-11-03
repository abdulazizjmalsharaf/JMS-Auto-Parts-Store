import { motion, useReducedMotion } from 'framer-motion';

const PARTS = [
  { key: 'brakes', name: 'BRAKES', ar: 'فحمات', flag: '🇺🇸', image: 'brake-pad.png' },
  { key: 'filter', name: 'FILTER', ar: 'فلتر', flag: '🇯🇵', image: 'air-filter.png' },
  { key: 'battery', name: 'BATTERY', ar: 'بطارية', flag: '🇩🇪', image: 'car-battery.png' },
  { key: 'plug', name: 'SPARK PLUG', ar: 'بواجي', flag: '🇨🇳', image: 'spark-plug.png' },
];

const EASE = [0.2, 0.85, 0.24, 1] as const;

export function ProductsScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`scene products${reduceMotion ? ' products--still' : ''}`}
      initial={reduceMotion ? false : { opacity: 0, clipPath: 'circle(0% at 76% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 76% 50%)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -34, clipPath: 'polygon(0 0, 64% 0, 34% 100%, 0 100%)' }}
      transition={{ duration: reduceMotion ? 0 : 0.42, ease: EASE }}
      aria-label="A range of American, Japanese, German, and Chinese car parts"
    >
      <div className="products__rail" aria-hidden="true" />
      <div className="products__halo" aria-hidden="true" />
      <div className="products__eyebrow">A WORLD OF PARTS. ONE JMS.</div>
      <div className="products__stage" aria-hidden="true">
        {PARTS.map((part) => (
          <div
            className={`product-cut product-cut--${part.key}`}
            key={part.key}
            style={reduceMotion ? { opacity: 1, animation: 'none' } : undefined}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/${part.image}`}
              alt=""
              draggable="false"
            />
          </div>
        ))}
      </div>
      {PARTS.map((part, index) => (
        <div
          className={`product-label product-label--${part.key}`}
          key={part.key}
          style={{
            animationDelay: reduceMotion ? '0s' : `${index * 0.82}s`,
            ...(reduceMotion ? { opacity: 1, animation: 'none' } : {}),
          }}
          aria-hidden="true"
        >
          <strong><em>{part.flag}</em>{part.name}</strong>
          <small lang="ar" dir="rtl">{part.ar}</small>
        </div>
      ))}
      <motion.div
        className="products__origins"
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 3.12, ease: EASE }}
      >
        AMERICAN · JAPANESE · GERMAN · CHINESE
        <span lang="ar" dir="rtl">أمريكي · ياباني · ألماني · صيني</span>
      </motion.div>
    </motion.section>
  );
}
