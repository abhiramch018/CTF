import { useEffect, useRef, useState } from "react";
import type { IntroPhase, MotionRef } from "../hooks/useIntroController.ts";
import { useScrollJourney } from "../hooks/useScrollJourney.ts";
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
  const [worldVisible, setWorldVisible] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const wasLocked = useRef(locked);
  const settled = phase === "transition" || phase === "done";
  const scrollLive = phase === "done" && !reducedMotion;
  const journey = useScrollJourney(scrollLive);

  useEffect(() => {
    const nodes = [document.getElementById("top"), document.getElementById("register")].filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setWorldVisible(visible.size > 0);
      },
      { threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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
        active={!tabHidden && (locked || worldVisible)}
        reducedMotion={reducedMotion}
        scrollLive={scrollLive}
      />
      <Navbar settled={settled} />
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
