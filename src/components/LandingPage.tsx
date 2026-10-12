import { useEffect, useRef, useState } from "react";
import type { IntroPhase, MotionRef } from "../hooks/useIntroController.ts";
import { useScrollJourney } from "../hooks/useScrollJourney.ts";
import { Atmosphere } from "./Atmosphere.tsx";
import { ChallengeGrid } from "./ChallengeGrid.tsx";
import { CompetitionFormat } from "./CompetitionFormat.tsx";
import { EventFooter } from "./EventFooter.tsx";
import { EventOverview } from "./EventOverview.tsx";
import { Hero, WorldStage } from "./Hero.tsx";
import { Navbar } from "./Navbar.tsx";
import { RewardsSection } from "./RewardsSection.tsx";

type LandingPageProps = {
  motion: MotionRef;
  phase: IntroPhase;
  locked: boolean;
  reducedMotion: boolean;
};

export function LandingPage({ motion, phase, locked, reducedMotion }: LandingPageProps) {
  const [tabHidden, setTabHidden] = useState(false);
  const wasLocked = useRef(locked);
  const settled = phase === "transition" || phase === "done";
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
      const card = (event.target as Element | null)?.closest?.(".glass-panel, .intel-window");
      if (card instanceof HTMLElement) tilt(card, event);
    };
    const onOut = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.(".glass-panel, .intel-window");
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
    if (wasLocked.current && !locked) {
      document.getElementById("hero-title")?.focus();
    }
    wasLocked.current = locked;
  }, [locked]);

  return (
    <div inert={locked ? true : undefined}>
      <WorldStage
        motion={motion}
        journey={journey}
        active={!tabHidden || locked}
        reducedMotion={reducedMotion}
        scrollLive={scrollLive}
      />
      <Atmosphere reducedMotion={reducedMotion} />
      <Navbar settled={settled} reducedMotion={reducedMotion} />
      <main id="main">
        <Hero settled={settled} reducedMotion={reducedMotion} />
        <EventOverview reducedMotion={reducedMotion} />
        <ChallengeGrid />
        <CompetitionFormat />
        <RewardsSection />
      </main>
      <EventFooter reducedMotion={reducedMotion} />
    </div>
  );
}
