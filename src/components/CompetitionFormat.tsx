import { useState } from "react";
import { inr } from "../content/event.ts";

const qualifierPoints = [
  "6 December 2026",
  "9:00 AM – 9:00 PM IST",
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

const recognition = [
  {
    title: "Ranks 4–10",
    copy: "Internship opportunities, certificates, stickers, and event ID cards.",
  },
  {
    title: "Special awards",
    copy: "Best Writeup and First Blood recognitions.",
  },
  {
    title: "All offline finalists",
    copy: "Certificates, stickers, and event ID cards.",
  },
  {
    title: "Online players",
    copy: "E-certificates for everyone who takes part.",
  },
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
      detail: "6 December 2026, 9:00 AM–9:00 PM IST. Twelve hours, remote, jeopardy-style. Flags and a writeup are submitted so the run can be verified.",
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
    <section id="competition" className="band scroll-mt-8">
      <div className="band-copy">
        <p className="type-meta text-cyan">COMPETITION</p>
        <h2 className="type-section mt-3 max-w-3xl">TWO STAGES. ONE RULEBOOK.</h2>
        <div className="mission-map mt-8" role="tablist" aria-label="Competition timeline">
          {checkpoints.map((point) => (
            <button
              key={point.id}
              type="button"
              role="tab"
              id={`stage-${point.id}`}
              aria-selected={active === point.id}
              aria-controls="stage-panel"
              className={`mission-node ${active === point.id ? "is-active" : ""}`}
              onClick={() => setActive(point.id)}
            >
              {point.title}
            </button>
          ))}
        </div>
        <p id="stage-panel" className="type-small stage-panel" role="tabpanel" aria-labelledby={`stage-${selected.id}`}>
          {selected.detail}
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="glass-panel reveal p-5">
            <p className="type-meta text-muted">STAGE 01</p>
            <h3 className="type-subhead mt-2">ONLINE QUALIFIER</h3>
            <ul className="type-small mt-4 space-y-2 text-ink">
              {qualifierPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="glass-panel reveal p-5">
            <p className="type-meta text-neon">STAGE 02</p>
            <h3 className="type-subhead mt-2">OFFLINE FINALS</h3>
            <ul className="type-small mt-4 space-y-2 text-ink">
              {finalsPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
        <p className="type-small mt-5 max-w-3xl">
          The top 40 teams cross over: up to 35 from the leaderboard and up to 5 wildcard teams. Wildcard criteria
          are published before registration opens. Finalists are named on 8 December 2026. Scores and writeups are
          checked, and a withdrawn spot goes to the next eligible team. This page does not show a live leaderboard.
        </p>

        <div id="rewards" className="rewards-block scroll-mt-8">
          <p className="type-meta text-cyan">REWARDS</p>
          <h3 className="type-subhead mt-2">BREAK THE CODE. CLAIM THE REWARD.</h3>
          <p className="type-body mt-3">{inr.total} in cash prizes for the top three teams.</p>
          <ol className="prize-row">
            <li>
              <span className="type-meta text-cyan">1ST</span>
              <strong>{inr.first}</strong>
              <span>Goodies, certificate, stickers, and an ID card</span>
            </li>
            <li>
              <span className="type-meta text-cyan">2ND</span>
              <strong>{inr.second}</strong>
              <span>Goodies, certificate, stickers, and an ID card</span>
            </li>
            <li>
              <span className="type-meta text-cyan">3RD</span>
              <strong>{inr.third}</strong>
              <span>Goodies, certificate, stickers, and an ID card</span>
            </li>
          </ol>
          <dl className="recognition-list">
            {recognition.map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.copy}</dd>
              </div>
            ))}
          </dl>
          <p className="type-small mt-4">
            Internships, training, and other partner-linked benefits are announced only as each partner confirms them.
          </p>
        </div>

        <div className="rules-block">
          <p className="type-meta text-cyan">RULES</p>
          <ul className="type-small mt-3 space-y-2">
            <li>Attack only the systems the organisers provide. University systems, other teams, and outside targets are off limits.</li>
            <li>Registration is {inr.fee} per player. The public link has not been published yet.</li>
            <li>Flag format is DNCTF{"{...}"}. Scoring is dynamic, and a challenge’s value shifts as teams solve it.</li>
            <li>Hints may cost points. The full rulebook comes from the organisers.</li>
            <li>The writeup deadline will be posted on the official channels.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
