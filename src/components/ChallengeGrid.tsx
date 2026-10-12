import { useEffect, useRef } from "react";
import { challenges } from "../content/event.ts";

function PixelIcon({ rows }: { rows: readonly string[] }) {
  return (
    <span className="grid grid-cols-5 gap-0.5" aria-hidden="true">
      {rows.flatMap((row, rowIndex) =>
        row.split("").map((cell, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={`h-1.5 w-1.5 ${cell === "1" ? "bg-neon" : "bg-obsidian"}`}
          />
        )),
      )}
    </span>
  );
}

export function ChallengeGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const cardFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest(".challenge-card") : null;

    const onMove = (event: PointerEvent) => {
      const card = cardFrom(event.target);
      if (!(card instanceof HTMLElement)) return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--tilt-x", `${(0.5 - py) * 7}deg`);
      card.style.setProperty("--tilt-y", `${(px - 0.5) * 9}deg`);
      card.style.setProperty("--glare-x", `${px * 100}%`);
      card.style.setProperty("--glare-y", `${py * 100}%`);
    };

    const onOut = (event: PointerEvent) => {
      const card = cardFrom(event.target);
      if (!(card instanceof HTMLElement)) return;
      const next = event.relatedTarget;
      if (next instanceof Node && card.contains(next)) return;
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--glare-x");
      card.style.removeProperty("--glare-y");
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerout", onOut);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <section id="challenges" className="sheet scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="type-meta text-neon">02 / THE CHALLENGE GRID</p>
        <h2 className="type-section mt-3 max-w-3xl">TEN DISCIPLINES. ONE GRID.</h2>
        <p className="type-body mt-5 max-w-2xl">
          From cryptographic puzzles to binary exploitation, every challenge tests a different way of thinking.
        </p>
        <div className="tunnel" aria-hidden="true">
          <span />
        </div>
        <div ref={grid} className="challenge-grid reveal-grid mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {challenges.map((challenge) => (
            <article
              key={challenge.id}
              className="challenge-card reveal border border-obsidian bg-forest/50 p-4"
              data-cursor="explore"
            >
              <div className="flex items-start justify-between gap-3">
                <PixelIcon rows={challenge.pixels} />
                <span className="type-meta text-muted">{challenge.id}</span>
              </div>
              <h3 className="type-card mt-4">{challenge.name}</h3>
              <p className="type-small mt-2">{challenge.summary}</p>
            </article>
          ))}
        </div>
        <dl className="mt-8 grid gap-4 border border-obsidian bg-void/60 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="type-meta text-muted">CHALLENGES</dt>
            <dd className="type-small mt-1 text-ink">50–70 across both rounds, easy to hard</dd>
          </div>
          <div>
            <dt className="type-meta text-muted">FLAG FORMAT</dt>
            <dd className="type-meta mt-1 text-neon">DNCTF{"{...}"}</dd>
          </div>
          <div>
            <dt className="type-meta text-muted">SCORING</dt>
            <dd className="type-small mt-1 text-ink">Dynamic. A challenge’s value shifts as teams solve it.</dd>
          </div>
          <div>
            <dt className="type-meta text-muted">HINTS</dt>
            <dd className="type-small mt-1 text-ink">May cost points. Full rules are in the organisers’ rulebook.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
