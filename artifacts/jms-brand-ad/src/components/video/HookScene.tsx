import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.18, 0.9, 0.22, 1] as const;

export function HookScene() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="scene hook"
      initial={reduceMotion ? false : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.07, clipPath: 'circle(0% at 77% 52%)' }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE }}
      aria-label="JMS ad hook: don't overpay for a broken car part"
    >
      <div className="scene__speedlines" aria-hidden="true" />
      <div className="scene__grain" aria-hidden="true" />
      <motion.div
        className="hook__slash"
        initial={reduceMotion ? false : { scaleY: 0.28, opacity: 0.5 }}
        animate={{ scaleY: [0.28, 1, 0.9], opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.68, ease: EASE, times: [0, 0.7, 1] }}
        aria-hidden="true"
      />
      <div className="hook__eyebrow">JMS / SMART PARTS. STRAIGHT VALUE.</div>
      <motion.div
        className="hook__line"
        initial={reduceMotion ? false : { opacity: 0, x: -36, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.46, delay: reduceMotion ? 0 : 0.16, ease: EASE }}
      >
        <span>CAR PART BROKEN?</span>
        <span className="hook__arabic" lang="ar" dir="rtl">قطعتك خربانة؟ لا تدفع أكثر!</span>
      </motion.div>
      <div className="hook__index">01 / THE PRICE SHOULD MAKE SENSE</div>
      <div className="hook__flash" aria-hidden="true" />
    </motion.section>
  );
}
