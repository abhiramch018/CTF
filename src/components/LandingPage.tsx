import { useEffect, useState } from "react";
import { type IntroPhase, type MotionRef } from "../hooks/useIntroController.ts";
import { useScrollJourney } from "../hooks/useScrollJourney.ts";
import { Atmosphere } from "./Atmosphere.tsx";
import { ChallengeGrid } from "./ChallengeGrid.tsx";
import { CompetitionFormat } from "./CompetitionFormat.tsx";
import { CountdownSection } from "./CountdownReactor.tsx";
import { EventFooter } from "./EventFooter.tsx";
import { EventOverview } from "./EventOverview.tsx";
import { Hero, WorldStage } from "./Hero.tsx";
import { RegisterButton } from "./RegisterButton.tsx";

type LandingPageProps = {
  motion: MotionRef;
  phase: IntroPhase;
  reducedMotion: boolean;
  instant: boolean;
  onSkip: () => void;
};

function openHash(reducedMotion: boolean) {
  const id = window.location.hash.replace("#", "");
  if (!id) return;
  const node = document.getElementById(id);
  if (!(node instanceof HTMLElement)) return;
  if (!node.hasAttribute("tabindex")) node.tabIndex = -1;
  node.scrollIntoView({ behavior: reducedMotion ? "auto" : "auto", block: "start" });
}

export function LandingPage({ motion, phase, reducedMotion, instant, onSkip }: LandingPageProps) {
  const [tabHidden, setTabHidden] = useState(false);
  const scrollLive = phase === "done" && !reducedMotion;
  const journey = useScrollJourney(scrollLive);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || !window.matchMedia("(hover: hover)").matches) return;
    const tilt = (card: HTMLElement, event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 3.5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 4.5).toFixed(2)}deg`);
    };
    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.(".glass-panel");
      if (card instanceof HTMLElement) tilt(card, event);
    };
    const onOut = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.(".glass-panel");
      if (!(card instanceof HTMLElement)) return;
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, [reducedMotion]);

  useEffect(() => {
    openHash(reducedMotion);
    const onHash = () => openHash(reducedMotion);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [reducedMotion]);

  return (
    <div>
      <WorldStage
        motion={motion}
        journey={journey}
        active={!tabHidden}
        reducedMotion={reducedMotion}
        scrollLive={scrollLive}
      />
      <Atmosphere reducedMotion={reducedMotion} />
      <div className="network-field" aria-hidden="true" />
      <main id="main">
        <Hero phase={phase} instant={instant} reducedMotion={reducedMotion} onSkip={onSkip} />
        <CountdownSection />
        <EventOverview reducedMotion={reducedMotion} />
        <ChallengeGrid />
        <CompetitionFormat />
        <section id="breach" className="breach-sheet" aria-labelledby="breach-title">
          <div className="breach-copy">
            <p className="type-meta text-cyan">PRE-ENTRY</p>
            <h2 id="breach-title" className="type-section">THE PORTAL OPENS</h2>
            <p className="type-body mt-4 max-w-md">
              Network lines lock on. The encrypted vault splits. Signal fragments travel out of the breach.
            </p>
          </div>
        </section>
        <section id="register" className="arena-sheet" aria-labelledby="arena-title">
          <div className="arena-copy">
            <p className="type-meta text-cyan">FINAL ACCESS</p>
            <h2 id="arena-title" className="type-finale">ENTER THE ARENA</h2>
            <p className="type-body arena-lead">
              Same gate as the opening call. The public registration link has not been published yet.
            </p>
            <div className="register-gate is-live is-instant">
              <RegisterButton variant="footer" className="arena-command">
                ENTER THE ARENA
              </RegisterButton>
            </div>
            <div className="loop-panel">
              <p className="type-meta text-cyan">STAY IN THE LOOP</p>
              <h3 className="type-subhead mt-2">SUBSCRIBE FOR CTF UPDATES</h3>
              <p className="type-small mt-3">
                A public mailing list has not been published yet. Updates coming soon on the official channels.
              </p>
            </div>
          </div>
        </section>
      </main>
      <EventFooter />
    </div>
  );
}
