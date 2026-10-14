import { useEffect, useRef } from "react";
import type { IntroPhase } from "../hooks/useIntroController.ts";

type IntroSequenceProps = {
  phase: IntroPhase;
  reducedMotion: boolean;
  onSkip: () => void;
};

const terminalLines = ["CARRIER // ENCRYPTED", "BOOT // SECTOR S01", "WORLD LINK STABLE"];

const noiseRows = [
  "7A 1C  █░▓░  4E 90  //  00 F0  ▓█  C3",
  "B5  ░█  21 8D  ▓░  FF  03  ░▓  6C 1A",
  "E0  █▓  44  09  ░░  7F  █░  D2  18  5B",
];

export function IntroSequence({ phase, reducedMotion, onSkip }: IntroSequenceProps) {
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    skipRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="intro-overlay" data-phase={phase} data-reduced={reducedMotion ? "true" : "false"}>
      <div className="signal-noise" aria-hidden="true">
        {noiseRows.map((row) => (
          <span key={row}>{row}</span>
        ))}
      </div>
      <p className="terminal" aria-live="polite">
        {terminalLines.map((line) => (
          <span key={line} className={line === "WORLD LINK STABLE" ? "term-line is-granted" : "term-line"}>
            {line}
          </span>
        ))}
      </p>
      <button ref={skipRef} type="button" className="skip-intro" onClick={onSkip}>
        SKIP INTRO
      </button>
    </div>
  );
}
