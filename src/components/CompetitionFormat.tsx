import { useState } from "react";
import { inr } from "../content/event.ts";

const qualifierPoints = [
  "6 December 2026",
  "9:00 AM – 9:00 PM",
  "12 hours",
  "Jeopardy-style competition",
  "Participants compete remotely",
  "Flags and a writeup are submitted so the run can be verified",
];

const finalsPoints = [
  "26–27 December 2026",
  "10:00 AM, 26 December – 4:00 PM, 27 December",
  "KLEF campus, Vaddeswaram",
  "Up to 40 finalist teams",
  "Teams of up to three members",
];

export function CompetitionFormat() {
  const [active, setActive] = useState("qualifier");
  const checkpoints = [
    {
      id: "register",
      title: "REGISTER",
      detail: `${inr.fee} per player. The public registration link has not been published yet.`,
    },
    {
      id: "qualifier",
      title: "QUALIFIER",
      detail: "6 December 2026, 9:00 AM–9:00 PM. Twelve hours, remote, jeopardy-style. Flags and a writeup are submitted so the run can be verified.",
    },
    {
      id: "named",
      title: "FINALISTS",
      detail: "Named on 8 December 2026. Up to 35 teams from the leaderboard and up to 5 wildcard teams.",
    },
    {
      id: "finals",
      title: "FINALS",
      detail: "26–27 December 2026. 10:00 AM on 26 December through 4:00 PM on 27 December. KLEF campus, Vaddeswaram. Up to 40 teams.",
    },
  ];
  const selected = checkpoints.find((item) => item.id === active) ?? checkpoints[1];

  return (
    <section id="competition" className="sheet sheet-forest scroll-mt-24 border-t border-obsidian px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="type-meta text-cyan">03 / THE PROTOCOL</p>
        <h2 className="type-section mt-3 max-w-3xl">TWO DIMENSIONS. ONE CHALLENGE.</h2>
        <div className="mission-map mt-8" role="tablist" aria-label="Competition stages">
          {checkpoints.map((point) => (
            <button
              key={point.id}
              type="button"
              role="tab"
              aria-selected={active === point.id}
              className={`mission-node ${active === point.id ? "is-active" : ""}`}
              onClick={() => setActive(point.id)}
            >
              {point.title}
            </button>
          ))}
        </div>
        <p className="type-small mt-4 max-w-3xl text-ink" role="tabpanel">
          {selected.detail}
        </p>
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-stretch">
          <article className="terminal-panel reveal flex-1 border border-obsidian p-6" data-cursor="explore">
            <p className="type-meta text-muted">DIMENSION 01</p>
            <h3 className="type-subhead mt-2">ONLINE QUALIFIER</h3>
            <ul className="type-small mt-5 space-y-2 text-ink">
              {qualifierPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 bg-neon" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
          <div className="stage-trail reveal reveal-delay-1 flex items-center justify-center gap-2 md:flex-col" aria-hidden="true">
            {["SOLVE", "SUBMIT", "VERIFY"].map((step, index) => (
              <span key={step} className="flex flex-col items-center gap-2">
                <span
                  className="trail-mark h-3 w-3 bg-neon"
                  style={{ opacity: 0.35 + index * 0.25 }}
                />
                <span className="type-meta text-muted">{step}</span>
              </span>
            ))}
          </div>
          <article className="terminal-panel reveal reveal-delay-2 flex-1 border border-neon/40 p-6" data-cursor="explore">
            <p className="type-meta text-neon">DIMENSION 02</p>
            <h3 className="type-subhead mt-2">OFFLINE FINALS</h3>
            <ul className="type-small mt-5 space-y-2 text-ink">
              {finalsPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 bg-neon" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <p className="type-small mt-6 max-w-3xl">
          The top 40 teams cross over: up to 35 from the leaderboard and up to 5 wildcard teams. Wildcard criteria
          are published before registration opens. Finalists are named on 8 December 2026. Scores and writeups are
          checked, and a withdrawn spot goes to the next eligible team. This page does not show a live leaderboard.
        </p>
      </div>
    </section>
  );
}
