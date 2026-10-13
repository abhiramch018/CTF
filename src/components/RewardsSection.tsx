import { useState } from "react";
import { inr } from "../content/event.ts";
import { GhostWord } from "./GhostWord.tsx";

const podiums = [
  {
    place: "2ND PLACE",
    amount: inr.second,
    height: "h-28",
    order: "md:order-1",
  },
  {
    place: "1ST PLACE",
    amount: inr.first,
    height: "h-40",
    order: "md:order-2",
    featured: true,
  },
  {
    place: "3RD PLACE",
    amount: inr.third,
    height: "h-24",
    order: "md:order-3",
  },
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

export function RewardsSection() {
  const [open, setOpen] = useState("1ST PLACE");
  return (
    <section id="rewards" className="chapter sheet scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="chapter-stage">
      <GhostWord>VAULT</GhostWord>
      <div className="section-copy mx-auto max-w-6xl">
        <p className="type-meta text-cyan">04 / THE VAULT</p>
        <h2 className="type-section mt-3 max-w-3xl">BREAK THE CODE. CLAIM THE REWARD.</h2>
        <p className="type-body mt-5">{inr.total} in cash prizes for the top three teams.</p>
        <ol className="mt-12 flex list-none flex-col items-center gap-10 p-0 md:flex-row md:items-end md:justify-center md:gap-8">
          {podiums.map((podium, index) => (
            <li
              key={podium.place}
              className={`reveal vault-chamber flex w-full max-w-xs flex-col items-center ${podium.order} ${index === 1 ? "" : index === 0 ? "reveal-delay-1" : "reveal-delay-2"} ${open === podium.place ? "is-open" : ""}`}
              data-cursor="inspect"
            >
              <p className="type-meta text-neon">{podium.place}</p>
              <p className={`type-stat mt-2 ${"featured" in podium && podium.featured ? "is-featured-prize" : "is-ink"}`}>
                {podium.amount}
              </p>
              <p className="type-small mt-2 text-center">Goodies, certificate, stickers, and an ID card</p>
              <div className={`pedestal mt-5 w-full ${podium.height} ${"featured" in podium && podium.featured ? "is-featured" : ""}`} />
              <button
                type="button"
                className="hud-button mt-4"
                data-cursor="open"
                aria-expanded={open === podium.place}
                onClick={() => setOpen(podium.place)}
              >
                {open === podium.place ? "OPEN" : "INSPECT"}
              </button>
            </li>
          ))}
        </ol>
        <div className="reveal-grid mt-12 grid gap-4 sm:grid-cols-2">
          {recognition.map((item) => (
            <article key={item.title} className="reveal border border-obsidian bg-forest/40 p-5">
              <h3 className="type-meta text-neon">{item.title}</h3>
              <p className="type-small mt-2 text-ink">{item.copy}</p>
            </article>
          ))}
        </div>
        <p className="rule-note type-small">
          Internships, training, and other partner-linked benefits are announced only as each partner confirms them.
        </p>
      </div>
      </div>
    </section>
  );
}
