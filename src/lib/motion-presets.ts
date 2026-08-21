import { Variants, Transition, TargetAndTransition } from "framer-motion";

/**
 * ============================================================================
 * SPRINGS & TRANSITION TIMING PRESETS
 * ============================================================================
 * Curated physics-based spring curves and easing transitions for fluid,
 * responsive, and tactile UI animations across desktop and mobile.
 */

export const SPRINGS = {
  /** Snappy and responsive. Ideal for buttons, cards, list items, and tabs. */
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } as Transition,
  /** Bouncy and playful. Perfect for badges, badges popping in, and icons. */
  bouncy: { type: "spring", stiffness: 300, damping: 22, mass: 1 } as Transition,
  /** Gentle and smooth. Best for large surface transitions, hero sliders, and drawers. */
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 1.1 } as Transition,
  /** Stiff and fast. Perfect for micro-interactions, tooltips, and popovers. */
  stiff: { type: "spring", stiffness: 500, damping: 35, mass: 0.7 } as Transition,
  /** Soft and floaty. Great for ambient background motion and glow effects. */
  soft: { type: "spring", stiffness: 120, damping: 20, mass: 1.2 } as Transition,
  /** Exaggerated wobble. For playful attention grabbers, errors, or easter eggs. */
  wobbly: { type: "spring", stiffness: 220, damping: 12, mass: 0.9 } as Transition,
  /** Slow and heavy. Great for expansive scene changes and fullscreen reveals. */
  slow: { type: "spring", stiffness: 80, damping: 20, mass: 1.5 } as Transition,
  /** Instant snapping spring for ultra-fast UI updates. */
  instant: { type: "spring", stiffness: 800, damping: 40, mass: 0.4 } as Transition,
  /** Cinematic smooth bezier transition. For dramatic entrances without bounce. */
  cinematic: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as Transition,
};

/**
 * Standard cubic-bezier and duration curves for non-spring transitions.
 */
export const EASINGS = {
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  sharp: [0.4, 0, 0.2, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
};

export const TRANSITIONS = {
  fade: { duration: 0.2, ease: "easeOut" } as Transition,
  fadeSlow: { duration: 0.4, ease: "easeInOut" } as Transition,
  slide: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } as Transition,
  instant: { duration: 0.05 } as Transition,
};

/**
 * ============================================================================
 * STAGGER LIST & CONTAINER VARIANTS
 * ============================================================================
 * Orchestrates sequenced children animations for grids, catalogs, and lists.
 */

export interface StaggerOptions {
  staggerChildren?: number;
  delayChildren?: number;
  staggerDirection?: 1 | -1;
}

/**
 * Factory to create customized stagger container variants.
 */
export const createStaggerContainer = (options: StaggerOptions = {}): Variants => {
  const { staggerChildren = 0.04, delayChildren = 0.05, staggerDirection = 1 } = options;
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
        staggerDirection,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerChildren * 0.5,
        staggerDirection: -1,
      },
    },
  };
};

/** Standard stagger container for anime grids, catalog lists, and search results. */
export const staggerContainerVariants: Variants = createStaggerContainer({
  staggerChildren: 0.04,
  delayChildren: 0.05,
});

/** Fast stagger container for compact lists and dropdown menus. */
export const staggerFastVariants: Variants = createStaggerContainer({
  staggerChildren: 0.02,
  delayChildren: 0.02,
});

/** Relaxed stagger container for featured sections and onboarding screens. */
export const staggerSlowVariants: Variants = createStaggerContainer({
  staggerChildren: 0.08,
  delayChildren: 0.1,
});

/** Stagger item with smooth upward slide, scale pop, and opacity entrance. */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Stagger item with pure opacity fade (minimal motion). */
export const staggerItemFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Stagger item sliding from left to right (horizontal lists, sidebar items). */
export const staggerItemSlideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Stagger item sliding from right to left. */
export const staggerItemSlideRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Stagger item with scale pop (useful for avatar collections and tag badges). */
export const staggerItemScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRINGS.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/**
 * ============================================================================
 * MODAL, DIALOG & OVERLAY FADES
 * ============================================================================
 * Premium entrance and exit animations with backdrop blur and depth scaling.
 */

/** High-gloss modal dialog window entrance and dismissal. */
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

/** Semi-transparent modal backdrop overlay fade with blur. */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/** Bottom sheet / mobile drawer slide up variants. */
export const bottomSheetVariants: Variants = {
  hidden: { y: "100%", opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: SPRINGS.gentle,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/** Side drawer navigation variants (sliding in from right). */
export const sideDrawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: SPRINGS.gentle,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

/** Floating toast notification pop-in variant. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.92, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.94,
    filter: "blur(2px)",
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

/** Tooltip and quick popover subtle scale & fade. */
export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 2,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

/**
 * ============================================================================
 * HOVER CARDS & INTERACTIVE CONTROLS
 * ============================================================================
 * Tactile micro-interactions for anime cards, buttons, tabs, and interactive chips.
 */

/** Anime card hover state variants with subtle lift and glow readiness. */
export const hoverCardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
    transition: SPRINGS.snappy,
  },
  hover: {
    scale: 1.03,
    y: -6,
    boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px 2px rgba(139, 92, 246, 0.25)",
    transition: SPRINGS.snappy,
  },
  tap: {
    scale: 0.98,
    y: -2,
    transition: SPRINGS.stiff,
  },
};

/** Subtle interactive button scale and tap feedback. */
export const buttonHoverVariants: Variants = {
  rest: { scale: 1, filter: "brightness(1)" },
  hover: {
    scale: 1.04,
    filter: "brightness(1.1)",
    transition: SPRINGS.snappy,
  },
  tap: {
    scale: 0.95,
    filter: "brightness(0.95)",
    transition: SPRINGS.stiff,
  },
};

/** Icon bounce animation on hover for player controls and action buttons. */
export const iconHoverVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: SPRINGS.bouncy,
  },
  tap: {
    scale: 0.9,
    rotate: -5,
    transition: SPRINGS.stiff,
  },
};

/** Active pill navigation tab indicator transition. */
export const pillTabVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRINGS.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

/** Hover glow flare overlay variants. */
export const hoverGlowVariants: Variants = {
  rest: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/**
 * ============================================================================
 * HERO TRANSITIONS & CAROUSEL SLIDERS
 * ============================================================================
 * Cinematic banner showcase slider variants with multi-layer depth.
 */

/**
 * Direction-aware carousel slider variants for anime hero showcase.
 * Accepts direction `(1 for next, -1 for prev)` to slide smoothly.
 */
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

/** Hero text and title entrance with staggered slide up. */
export const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: EASINGS.easeOutExpo,
    },
  },
};

/** Hero badge / pill tag entrance. */
export const heroBadgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRINGS.bouncy,
  },
};

/** Hero call-to-action button entrance. */
export const heroActionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      ...SPRINGS.snappy,
    },
  },
};

/** Page route transition variants. */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: EASINGS.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * ============================================================================
 * DATA VISUALIZATIONS & RADAR GRAPHS
 * ============================================================================
 */

/** Radar chart polygon entrance animation. */
export const radarPolygonVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/** Chart bar or indicator column grow animation. */
export const chartBarVariants: Variants = {
  hidden: { scaleY: 0, originY: 1, opacity: 0 },
  visible: {
    scaleY: 1,
    originY: 1,
    opacity: 1,
    transition: SPRINGS.gentle,
  },
};

/**
 * ============================================================================
 * REDUCED MOTION FALLBACKS & ACCESSIBILITY UTILITIES
 * ============================================================================
 * Graceful fallbacks respecting user prefers-reduced-motion settings.
 * Removes heavy transforms, blurring, and physics displacement while maintaining
 * clean opacity transitions.
 */

/** Pure fade-in fallback for elements when reduced motion is preferred. */
export const reducedMotionFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** Instant state transition fallback. */
export const reducedMotionInstantVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.01 },
  },
};

/** Hero slider fallback without translations or blur. */
export const heroSliderReducedVariants: Variants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/** Modal fallback without scale, y-offset, or blur filters. */
export const modalReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** Stagger container fallback without delay/stagger timing. */
export const staggerContainerReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

/** Hover card fallback with slight border/brightness change instead of 3D lift/scale. */
export const hoverCardReducedVariants: Variants = {
  rest: { opacity: 1, filter: "brightness(1)" },
  hover: {
    opacity: 1,
    filter: "brightness(1.1)",
    transition: { duration: 0.15 },
  },
  tap: {
    opacity: 0.85,
    transition: { duration: 0.05 },
  },
};

/**
 * Utility function to strip translation (x, y, z), scale, rotate, and blur filters
 * from any Variants object, converting it into an accessible reduced-motion fallback.
 *
 * @param variants Standard animation variants
 * @returns Cleaned variants retaining only opacity and basic color transitions
 */
export const stripTransformsForReducedMotion = (variants: Variants): Variants => {
  const reduced: Variants = {};

  for (const [key, val] of Object.entries(variants)) {
    if (typeof val === "function") {
      reduced[key] = (custom: unknown, current: unknown, velocity: unknown) => {
        const res = (val as (c: unknown, cur: unknown, v: unknown) => unknown)(custom, current, velocity);
        return sanitizeTargetForReducedMotion(res);
      };
    } else if (typeof val === "object" && val !== null) {
      reduced[key] = sanitizeTargetForReducedMotion(val as TargetAndTransition);
    } else {
      reduced[key] = val;
    }
  }

  return reduced;
};

/**
 * Helper to sanitize a single TargetAndTransition object for reduced motion.
 */
function sanitizeTargetForReducedMotion(target: TargetAndTransition | unknown): TargetAndTransition {
  if (typeof target !== "object" || target === null) {
    return target as TargetAndTransition;
  }

  const result: Record<string, unknown> = {};
  const record = target as Record<string, unknown>;

  for (const [prop, value] of Object.entries(record)) {
    // Skip transform, scale, rotation, and blur filter properties
    if (
      [
        "x",
        "y",
        "z",
        "scale",
        "scaleX",
        "scaleY",
        "rotate",
        "rotateX",
        "rotateY",
        "rotateZ",
        "skewX",
        "skewY",
        "filter",
        "backdropFilter",
      ].includes(prop)
    ) {
      continue;
    }

    if (prop === "transition" && typeof value === "object" && value !== null) {
      // Simplify transition to short duration
      result.transition = {
        duration: 0.2,
        ease: "easeOut",
      };
    } else {
      result[prop] = value;
    }
  }

  // Ensure opacity is defined if present in target
  if (result.opacity === undefined && record.opacity !== undefined) {
    result.opacity = record.opacity;
  }

  return result as TargetAndTransition;
}

/**
 * Selects between standard variants and reduced motion variants based on
 * the `prefersReducedMotion` boolean (e.g. from `useReducedMotion()` hook).
 *
 * @param standard Standard animation variants
 * @param prefersReduced Flag from user preferences
 * @param customReduced Optional custom reduced motion fallback variants
 * @returns The appropriate variants to pass to `motion.*` components
 */
export const getAccessibleVariants = (
  standard: Variants,
  prefersReduced: boolean | null,
  customReduced?: Variants
): Variants => {
  if (!prefersReduced) return standard;
  return customReduced || stripTransformsForReducedMotion(standard);
};


