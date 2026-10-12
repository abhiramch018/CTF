import { useEffect, useRef } from "react";
import type { IntroPhase } from "../hooks/useIntroController.ts";

type IntroSequenceProps = {
  phase: IntroPhase;
  reducedMotion: boolean;
  onSkip: () => void;
};

const terminalLines = [
  "INITIALIZING SECURE DIMENSION...",
  "ESTABLISHING CONNECTION...",
  "ACCESS GRANTED",
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
      <div className="intro-flash" />
      <div className="pixel-dissolve" />
      <div className="signal-ring" aria-hidden="true" />
      <p className="terminal" aria-live="polite">
        {terminalLines.map((line) => (
          <span key={line} className={line === "ACCESS GRANTED" ? "term-line is-granted" : "term-line"}>
            {line}
          </span>
        ))}
      </p>
      <div className="intro-title-block">
        <p className="intro-kicker">KL UNIVERSITY × GDG × WHITE HAT HACKERS</p>
        <p className="intro-title">
          <span className="intro-line">DEAD</span>
          <span className="intro-line intro-line-delay">NOCTIS</span>
        </p>
        <p className="intro-ctf">CTF</p>
        <p className="intro-sub">NATIONAL-LEVEL CYBERSECURITY CAPTURE THE FLAG</p>
        <p className="intro-meta">SEASON 01 // DIMENSION INITIALIZED</p>
      </div>
      <button ref={skipRef} type="button" className="skip-intro" onClick={onSkip}>
        SKIP INTRO
      </button>
    </div>
  );
}
