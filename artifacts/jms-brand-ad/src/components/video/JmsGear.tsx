import { motion } from 'framer-motion';

const GEAR_POINTS = Array.from({ length: 64 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 64 - Math.PI / 2;
  const tooth = index % 4;
  const radius = tooth === 0 || tooth === 1 ? 95 : 81;
  return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
}).join(' ');

interface JmsGearProps {
  className?: string;
  animated?: boolean;
}

export function JmsGear({ className, animated = false }: JmsGearProps) {
  if (animated) {
    return (
      <motion.svg
        className={className}
        viewBox="0 0 200 200"
        role="img"
        aria-label="JMS gear mark"
        initial={{ rotate: -28, scale: 0.76, opacity: 0.35 }}
        animate={{ rotate: [0, 4, 0], scale: [1, 1.025, 1], opacity: 1 }}
        transition={{ duration: 1.15, ease: [0.18, 0.9, 0.22, 1] }}
      >
        <polygon points={GEAR_POINTS} fill="none" stroke="currentColor" strokeWidth="5" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <circle cx="100" cy="100" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.32" />
        <circle cx="100" cy="100" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="5" fill="#ff6b00" />
      </motion.svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={GEAR_POINTS} fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <circle cx="100" cy="100" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="100" cy="100" r="5" fill="#ff6b00" />
    </svg>
  );
}
