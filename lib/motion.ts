import type { Variants, Transition } from 'framer-motion'

// Smooth deceleration curve
const ease = [0.25, 0.1, 0.25, 1] as const

// Stagger container — wrap a list of items
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
}

// Stagger item — apply to each child in a staggered list
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease },
  },
}

// Tap feedback for mobile — replaces whileHover
export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 } as Transition,
}

// Page enter fade
export const pageEnter: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25, ease },
  },
}

// Spring config for quantity controls, toggles, nav
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

// Nav spring — smooth and damped for navigation transitions
export const navSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
}

// Message entrance — fast and subtle
export const messageEnter: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.12, ease },
  },
}
