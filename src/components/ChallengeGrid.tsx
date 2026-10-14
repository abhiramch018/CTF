import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { challenges } from "../content/event.ts";
import { GhostWord } from "./GhostWord.tsx";

const STEP = 360 / challenges.length;

function DisciplineMark() {
  return (
    <span className="discipline-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function useCompactNexus() {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(max-width: 760px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  });

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCompact(narrow.matches || reduced.matches);
    narrow.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      narrow.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return compact;
}

export function ChallengeGrid() {
  const compact = useCompactNexus();
  const [index, setIndex] = useState(0);
  const nodes = useRef<Array<HTMLButtonElement | null>>([]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const selected = challenges[index];
  const count = challenges.length;

  const go = (next: number, focusNode = false) => {
    const wrapped = (next + count) % count;
    setIndex(wrapped);
    if (focusNode) nodes.current[wrapped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const fromNode = event.target instanceof HTMLElement && Boolean(event.target.closest(".nexus-node"));
    go(index + (event.key === "ArrowRight" ? 1 : -1), fromNode);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section id="challenges" className="chapter sheet nexus-section scroll-mt-24" onKeyDown={onKeyDown}>
      <div className="chapter-stage">
        <GhostWord>SECTORS</GhostWord>
        <div className="section-copy mx-auto">
          <div className="nexus-intro">
            <p className="type-meta text-cyan">02 / CHALLENGE SECTORS</p>
            <h2 className="type-section mt-3 max-w-3xl">TEN DISCIPLINES. ONE GRID.</h2>
            <p className="type-body mt-3 max-w-2xl">
              From cryptographic puzzles to binary exploitation, every challenge tests a different way of thinking.
            </p>
          </div>

          {compact ? (
            <div className="nexus-fallback" role="list">
              {challenges.map((challenge, itemIndex) => {
                const open = itemIndex === index;
                return (
                  <div key={challenge.id} role="listitem">
                    <button
                      type="button"
                      className={`nexus-fallback-item${open ? " is-open" : ""}`}
                      aria-expanded={open}
                      onClick={() => setIndex(itemIndex)}
                    >
                      <span className="type-meta text-cyan">{challenge.id}</span>
                      <span className="type-card">{challenge.name}</span>
                      <DisciplineMark />
                    </button>
                    {open ? <p className="nexus-fallback-copy type-small">{challenge.summary}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="nexus-stage"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <div className="nexus-scene">
              <div className="nexus-core" aria-hidden="true">
                <span />
                <span />
                <i />
                <i />
                <i />
              </div>
              <div className="nexus-ring" style={{ "--spin": `${-index * STEP}deg` } as CSSProperties}>
                {challenges.map((challenge, itemIndex) => {
                  const depth = Math.min(Math.abs(itemIndex - index), count - Math.abs(itemIndex - index));
                  return (
                  <button
                    key={challenge.id}
                    ref={(node) => {
                      nodes.current[itemIndex] = node;
                    }}
                    type="button"
                    className={`nexus-node${itemIndex === index ? " is-current" : ""}`}
                    style={{ "--slot": `${itemIndex * STEP}deg`, "--depth": depth } as CSSProperties}
                    data-depth={depth}
                    aria-current={itemIndex === index ? "true" : undefined}
                    aria-label={`${challenge.id} ${challenge.name}`}
                    onClick={() => setIndex(itemIndex)}
                  >
                    <span className="nexus-node-face">
                      <span className="type-meta">{challenge.id}</span>
                      <span>{challenge.name}</span>
                    </span>
                  </button>
                  );
                })}
              </div>
              <svg className="nexus-signal" key={selected.id} viewBox="0 0 100 100" aria-hidden="true">
                <path d="M50 22 C50 40 50 58 50 78" />
                <circle r="1.6" />
              </svg>
              </div>
              <article className="nexus-focus" aria-live="polite">
                <div className="nexus-focus-mark">
                  <span className="type-meta text-cyan">{selected.id}</span>
                  <DisciplineMark />
                </div>
                <div>
                  <h3 className="type-card">{selected.name}</h3>
                  <p className="type-small mt-2">{selected.summary}</p>
                </div>
              </article>
            </div>
          )}

          <div className="nexus-controls">
            <button type="button" className="nexus-arrow" aria-label="Previous discipline" onClick={() => go(index - 1)}>
              Prev
            </button>
            <p className="type-meta text-cyan" aria-live="polite">
              {selected.id} / {String(count).padStart(2, "0")}
            </p>
            <button type="button" className="nexus-arrow" aria-label="Next discipline" onClick={() => go(index + 1)}>
              Next
            </button>
          </div>

          <dl className="nexus-facts">
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
      </div>
    </section>
  );
}
