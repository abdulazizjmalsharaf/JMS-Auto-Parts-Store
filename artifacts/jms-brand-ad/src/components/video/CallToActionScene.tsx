import { motion, useReducedMotion } from 'framer-motion';

const PRODUCTS = ['brake-pad.png', 'air-filter.png', 'car-battery.png', 'spark-plug.png'];

const EASE = [0.18, 0.9, 0.24, 1] as const;

export function CallToActionScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="scene cta"
      initial={reduceMotion ? false : { opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
      transition={{ duration: reduceMotion ? 0 : 0.34, ease: EASE }}
      aria-label="Shop now at JMS"
    >
      <div className="cta__field" aria-hidden="true" />
      <div className="cta__ring" aria-hidden="true" />
      <div className="cta__products" aria-hidden="true">
        {PRODUCTS.map((image) => (
          <img
            key={image}
            src={`${import.meta.env.BASE_URL}images/${image}`}
            alt=""
            draggable="false"
          />
        ))}
      </div>
      <div className="cta__content-wrap">
        <motion.div
          className="cta__content"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.52, delay: reduceMotion ? 0 : 0.2, ease: [0.18, 0.9, 0.24, 1.1] }}
        >
          <h1>SHOP NOW AT JMS</h1>
          <p lang="ar" dir="rtl">تسوّق الآن على JMS</p>
        </motion.div>
      </div>
      <div className="cta__shutter" aria-hidden="true" />
      <div className="cta__loop-mark" aria-hidden="true" />
    </motion.section>
  );
}
