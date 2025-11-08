// Phase 6.6 - Heavy Content Banner Component
import React, { useEffect, useState } from "react";

const HIDE_KEY = "banibs:heavyContentBanner:hideAll";

function HeavyContentBanner({
  visible,
  message,
  variant = "banner", // "banner" | "card" | "inline"
  onDismiss,
  showHideSimilar = true,
}) {
  const [closed, setClosed] = useState(false);
  const [hiddenByPreference, setHiddenByPreference] = useState(false);

  // Respect global "hide similar" preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(HIDE_KEY);
    if (value === "true") {
      setHiddenByPreference(true);
    }
  }, []);

  if (!visible || closed || hiddenByPreference) {
    return null;
  }

  const baseClass =
    "backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-amber-400/60 shadow-md rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-200";

  const variantClass =
    variant === "banner"
      ? "w-full mb-4"
      : variant === "card"
      ? "w-full mb-2 text-xs"
      : "w-full mb-3 text-sm"; // inline

  const titleText =
    variant === "banner"
      ? "Heavy / sensitive content"
      : "Sensitive content";

  const bodyText =
    message ||
    "This story may contain sensitive or emotionally charged material.";

  function handleDismiss() {
    setClosed(true);
    if (onDismiss) onDismiss();
  }

  function handleHideSimilar() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HIDE_KEY, "true");
    }
    setHiddenByPreference(true);
  }

  return (
    <div className={`${baseClass} ${variantClass}`}>
      {/* Icon */}
      <div className="mt-[2px] text-lg leading-none select-none">⚠️</div>

      {/* Text + actions */}
      <div className="flex-1">
        <p className="font-semibold text-[13px] md:text-sm">
          {titleText}
        </p>
        <p className="text-[11px] md:text-xs mt-1 leading-snug">
          {bodyText}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] md:text-xs">
          {showHideSimilar && (
            <button
              type="button"
              onClick={handleHideSimilar}
              className="underline decoration-amber-500/80 hover:decoration-amber-600"
            >
              Hide similar warnings
            </button>
          )}

          {/* Future: "Learn more" link to editorial policy */}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-2 text-[13px] md:text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
        aria-label="Dismiss heavy content warning"
      >
        ×
      </button>
    </div>
  );
}

export default HeavyContentBanner;
