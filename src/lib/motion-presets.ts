import { Variants, Transition } from "framer-motion";

export const SPRINGS = {
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 22, mass: 1 } as Transition,
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 1.1 } as Transition,
  cinematic: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as Transition,
};

export const heroSliderVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x: SPRINGS.gentle,
      opacity: { duration: 0.35 },
      scale: SPRINGS.gentle,
      filter: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 1.02,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRINGS.snappy,
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 12,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

export const radarPolygonVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};
