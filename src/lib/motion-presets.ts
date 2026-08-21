import { Variants, Transition } from "framer-motion";

export const SPRINGS = {
  snappy: { type: "spring", stiffness: 420, damping: 28, mass: 0.8 } as Transition,
  bouncy: { type: "spring", stiffness: 320, damping: 20, mass: 1 } as Transition,
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 1.2 } as Transition,
  cinematic: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } as Transition,
};

export const heroSliderVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.96,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x: SPRINGS.gentle,
      opacity: { duration: 0.4 },
      scale: SPRINGS.gentle,
      filter: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 1.04,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRINGS.snappy,
  },
};

export const quickPreviewModalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 16,
    filter: "blur(12px)",
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
    scale: 0.92,
    y: 12,
    filter: "blur(8px)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const theaterHUDVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRINGS.snappy,
  },
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
};

export const radarPolygonVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    transformOrigin: "center center",
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRINGS.bouncy,
      delay: 0.2,
    },
  },
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRINGS.cinematic,
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(6px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};
