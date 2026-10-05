"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  ThemePreference,
  applyTheme,
  readStoredTheme,
  resolveTheme
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "system", label: "Auto" },
  { value: "dark", label: "Dark" }
];

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const previousResolved = useRef<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    setPreference(stored);
    applyTheme(stored);
    previousResolved.current = resolveTheme(stored);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (preference !== "system") {
      return undefined;
    }

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, [preference]);

  function selectPreference(next: ThemePreference) {
    setPreference(next);
    applyTheme(next);
    previousResolved.current = resolveTheme(next);
  }

  const resolved = isMounted ? resolveTheme(preference) : null;

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="relative flex items-center gap-0.5 rounded-full border border-line/10 bg-sunken/70 p-1 backdrop-blur-xl"
    >
      {options.map((option) => {
        const isActive = isMounted && preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={`${option.label} theme`}
            onClick={() => selectPreference(option.value)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              !prefersReducedMotion && "duration-200",
              isActive ? "text-brand-ink" : "text-ink-subtle hover:text-ink"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="theme-toggle-active"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-brand"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <span className="relative z-10">
              <ThemeIcon variant={option.value} resolved={resolved} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ThemeIcon({
  variant,
  resolved
}: {
  variant: ThemePreference;
  resolved: "light" | "dark" | null;
}) {
  if (variant === "light") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7 5.4 5.4" />
      </svg>
    );
  }

  if (variant === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.8" y="4.2" width="18.4" height="12.6" rx="2.2" />
      <path d="M8 20.4h8" />
      {resolved === "dark" ? (
        <path d="M15.6 6.8a3.6 3.6 0 0 0 0 4.4 3.6 3.6 0 0 1-4.4-4.4Z" fill="currentColor" stroke="none" />
      ) : (
        <circle cx="12" cy="10.5" r="2.6" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}