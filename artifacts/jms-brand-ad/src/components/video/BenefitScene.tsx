import { motion, useReducedMotion } from 'framer-motion';

import { JmsGear } from './JmsGear';

const EASE = [0.18, 0.9, 0.22, 1] as const;

export function BenefitScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="scene benefit"
      initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1, clipPath: 'circle(0% at 59% 55%)' }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
      aria-label="High quality car parts at a lower than market price"
    >
      <div className="benefit__wash" aria-hidden="true" />
      <div className="benefit__speedline" aria-hidden="true" />
      <div className="benefit__market">
        <span>MARKET PRICE</span>
        <small lang="ar" dir="rtl">سعر السوق</small>
      </div>
      <motion.div
        className="benefit__ticket"
        initial={reduceMotion ? false : { opacity: 0, y: -540, rotate: 5 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ duration: reduceMotion ? 0 : 0.54, delay: reduceMotion ? 0 : 0.86, ease: [0.18, 0.9, 0.22, 1.12] }}
      >
        <span className="benefit__ticket-label">YOUR JMS PRICE</span>
        <strong className="benefit__ticket-price">JMS</strong>
        <span className="benefit__ticket-ar" lang="ar" dir="rtl">سعر JMS</span>
        <div className="flash-sheen" aria-hidden="true" />
      </motion.div>
      <div className="benefit__copy">
        <h2>HIGH QUALITY.<br />LOWER THAN MARKET.</h2>
        <p lang="ar" dir="rtl">جودة عالية.. وسعر أرخص من السوق</p>
      </div>
      <motion.div
        className="quality-stamp"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.42, rotate: -18 }}
        animate={{ opacity: 1, scale: 1, rotate: -11 }}
        transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : 2.55, ease: [0.16, 1.2, 0.25, 1] }}
        aria-label="Quality check and warranty"
      >
        <JmsGear className="quality-stamp__gear" />
        <div className="quality-stamp__inner">
          <span>QUALITY</span>
          <span>WARRANTY</span>
          <span lang="ar" dir="rtl">ضمان</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
