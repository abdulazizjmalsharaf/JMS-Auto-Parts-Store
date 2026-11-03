import { motion, useReducedMotion } from 'framer-motion';

import { JmsGear } from './JmsGear';

const EASE = [0.18, 0.9, 0.22, 1] as const;

export function BrandScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="scene brand"
      initial={reduceMotion ? false : { opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0.08, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      transition={{ duration: reduceMotion ? 0 : 0.43, ease: EASE }}
      aria-label="JMS — Right Part. Right Price."
    >
      <div className="brand__grid" aria-hidden="true" />
      <div className="brand__gear-wrap" aria-hidden="true">
        <JmsGear className="brand__gear" animated={!reduceMotion} />
      </div>
      <div className="brand__wordmark-wrap">
        <motion.div
          className="brand__wordmark"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.78, letterSpacing: '0.18em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0.035em' }}
          transition={{ duration: reduceMotion ? 0 : 0.52, delay: reduceMotion ? 0 : 0.53, ease: [0.18, 0.95, 0.22, 1.1] }}
        >
          JMS
        </motion.div>
      </div>
      <div className="brand__slogan-wrap">
        <motion.div
          className="brand__slogan"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 1.1, ease: EASE }}
        >
          <strong>RIGHT PART. RIGHT PRICE.</strong>
          <span lang="ar" dir="rtl">قطعة صح.. بسعر صح</span>
        </motion.div>
      </div>
      <div className="brand__signature" aria-hidden="true" />
    </motion.section>
  );
}
