"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div"
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "header";
}) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.2, delay }
          : { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </Component>
  );
}

export function Stagger({
  children,
  className,
  interval = 0.045
}: {
  children: ReactNode;
  className?: string;
  interval?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: prefersReducedMotion ? 0 : interval }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export function Panel({
  children,
  className,
  interactive = false
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("panel rounded-3xl", className)}
      whileHover={
        interactive && !prefersReducedMotion ? { y: -3 } : undefined
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 340, damping: 30 }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Cross-fades and directionally slides content when the key changes. Used for
 * month / week / agenda swaps so navigation feels spatial rather than abrupt.
 */
export function ViewTransition({
  viewKey,
  direction,
  children,
  className
}: {
  viewKey: string;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : direction === 0 ? 0 : direction * 28;

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={viewKey}
        custom={direction}
        className={className}
        initial={
          prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: offset, scale: 0.985 }
        }
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, x: offset * -0.6, scale: 0.99 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.15 }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function CountUp({
  value,
  suffix = ""
}: {
  value: number;
  suffix?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{`${value}${suffix}`}</>;
  }

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {`${value}${suffix}`}
    </motion.span>
  );
}

export function AnimatedProgress({
  percent,
  className
}: {
  percent: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sunken", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand/70 via-brand to-brand/70"
        initial={{ width: prefersReducedMotion ? `${percent}%` : 0 }}
        animate={{ width: `${percent}%` }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
        }
      />
    </div>
  );
}