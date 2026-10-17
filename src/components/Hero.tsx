import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
import { phaseAtLeast, type IntroPhase, type MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { supportsWebGL } from "../lib/webgl.ts";
import { PortalFallback } from "./PortalFallback.tsx";
import { Navbar } from "./Navbar.tsx";
import { RegisterButton } from "./RegisterButton.tsx";
import { SceneErrorBoundary } from "./SceneErrorBoundary.tsx";

const VoxelScene = lazy(() => import("./VoxelScene.tsx"));

type JourneyRef = { current: SceneJourney };

type HeroProps = {
  phase: IntroPhase;
  instant: boolean;
  reducedMotion: boolean;
  onSkip: () => void;
};

const CIPHER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function useDecoded(text: string, active: boolean, instant: boolean) {
  const [value, setValue] = useState(text);

  useEffect(() => {
    if (!active || instant) {
      setValue(text);
      return;
    }
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const locked = Math.min(text.length, step);
      let next = "";
      for (let index = 0; index < text.length; index += 1) {
        if (index < locked) next += text[index];
        else next += CIPHER[Math.floor(Math.random() * CIPHER.length)] ?? "A";
      }
      setValue(next);
      if (locked >= text.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [active, instant, text]);

  return value;
}

function GlyphLine({ text, delay }: { text: string; delay: string }) {
  return (
    <span className="glyph-line" style={{ "--glyph-delay": delay } as CSSProperties} aria-hidden="true">
      {text}
    </span>
  );
}

type WorldStageProps = {
  motion: MotionRef;
  journey: JourneyRef;
  active: boolean;
  reducedMotion: boolean;
  scrollLive: boolean;
};

type SceneMode = "pending" | "webgl" | "css";

export function WorldStage({ motion, journey, active, reducedMotion, scrollLive }: WorldStageProps) {
  const [mode, setMode] = useState<SceneMode>(() => (supportsWebGL() ? "pending" : "css"));

  useEffect(() => {
    if (mode !== "pending") return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer = window.setTimeout(() => setMode((current) => (current === "pending" ? "css" : current)), 4500);
    };
    arm();
    document.addEventListener("visibilitychange", arm);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", arm);
    };
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle("webgl-live", mode === "webgl");
    return () => document.documentElement.classList.remove("webgl-live");
  }, [mode]);

  return (
    <div className={`world-layer${mode === "webgl" ? " is-live" : ""}`} aria-hidden="true">
      {mode !== "webgl" ? <PortalFallback animate={mode === "css" && !reducedMotion} /> : null}
      {mode !== "css" ? (
        <div className={`absolute inset-0 ${mode === "webgl" ? "opacity-100" : "opacity-0"}`}>
          <SceneErrorBoundary onError={() => setMode("css")} fallback={null}>
            <Suspense fallback={null}>
              <VoxelScene
                motion={motion}
                journey={journey}
                active={active}
                reducedMotion={reducedMotion}
                scrollLive={scrollLive}
                onReady={() => setMode("webgl")}
              />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}

export function Hero({ phase, instant, reducedMotion, onSkip }: HeroProps) {
  const showTitle = instant || phaseAtLeast(phase, "title");
  const showDetails = instant || phaseAtLeast(phase, "details");
  const showCta = instant || phaseAtLeast(phase, "register");
  const dead = useDecoded("DEAD", showTitle, instant);
  const noctis = useDecoded("NOCTIS", showTitle, instant);
  const copyClass = [
    "hero-copy",
    phase === "done" ? "is-visible" : "",
    showTitle ? "show-title" : "",
    showDetails ? "show-details" : "",
    showCta ? "show-cta" : "",
    instant ? "is-instant" : "",
    reducedMotion ? "is-calm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="top" className="chapter hero-sheet relative min-h-[100svh]">
      <div className="chapter-stage">
        <div className={copyClass}>
          <Navbar settled reducedMotion={reducedMotion} />
          <div className="hero-body">
            <header className="poster-head">
              <p className="type-meta text-cyan">SEASON 01</p>
              <h1 id="hero-title" tabIndex={-1} className="hero-mark">
                <span className="sr-only">DEAD NOCTIS</span>
                <GlyphLine text={dead} delay="0s" />
                <GlyphLine text={noctis} delay="0.12s" />
              </h1>
              <p className="poster-rule hero-detail delay-1">
                <span aria-hidden="true" />
                NATIONAL LEVEL CTF CHALLENGE
                <span aria-hidden="true" />
              </p>
            </header>
            <div className="poster-foot">
              <p className="type-body hero-lead hero-detail delay-1">
                A national-level cybersecurity Capture the Flag. Ten disciplines, a remote qualifier, and offline finals at KLEF.
              </p>
              <ol className="mission-coords hero-detail delay-2">
                <li>
                  <span>06 DEC 2026</span>
                  <strong>QUALIFIER</strong>
                  <em>09:00–21:00 IST · 12H · REMOTE</em>
                </li>
                <li>
                  <span>26–27 DEC 2026</span>
                  <strong>FINALS</strong>
                  <em>10:00 26 DEC – 16:00 27 DEC · KLEF</em>
                </li>
              </ol>
              <div className="hero-actions">
                <div
                  className={`register-gate${showCta ? " is-live" : ""}${instant ? " is-instant" : ""}`}
                  inert={showCta ? undefined : true}
                  aria-hidden={showCta ? undefined : true}
                  data-cta={showCta ? "live" : "waiting"}
                >
                  <RegisterButton>ENTER THE ARENA</RegisterButton>
                </div>
                <button
                  type="button"
                  className="btn-ghost hero-detail delay-3"
                  data-cursor="open"
                  onClick={() =>
                    document.getElementById("challenges")?.scrollIntoView({
                      behavior: reducedMotion ? "auto" : "smooth",
                    })
                  }
                >
                  OPEN THE SECTORS
                </button>
              </div>
              <p className="type-small poster-note hero-detail delay-4">
                KL University × Google Developer Groups × White Hat Hackers · Finals at KLEF, Vaddeswaram
              </p>
            </div>
          </div>
          {!instant && phase !== "done" ? (
            <button type="button" className="skip-opening" onClick={onSkip}>
              Skip opening
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
