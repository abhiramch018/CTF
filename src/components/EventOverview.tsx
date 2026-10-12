import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CountdownReactor } from "./CountdownReactor.tsx";
import { inr } from "../content/event.ts";

type StatProps = {
  label: string;
  value: number;
  kind: "count" | "inr" | "plus";
  note?: string;
  reducedMotion: boolean;
};

function formatStat(value: number, kind: StatProps["kind"]) {
  if (kind === "inr") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  const formatted = new Intl.NumberFormat("en-IN").format(value);
  return kind === "plus" ? `${formatted}+` : formatted;
}

function Stat({ label, value, kind, note, reducedMotion }: StatProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useRef(formatStat(reducedMotion ? value : 0, kind));

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = shown.current;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reducedMotion) {
      shown.current = formatStat(value, kind);
      node.textContent = shown.current;
      return;
    }
    let tween: gsap.core.Tween | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || tween) return;
        observer.disconnect();
        const state = { n: 0 };
        tween = gsap.to(state, {
          n: value,
          duration: 1.05,
          ease: "power2.out",
          onUpdate: () => {
            shown.current = formatStat(Math.round(state.n), kind);
            node.textContent = shown.current;
          },
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [kind, reducedMotion, value]);

  return (
    <article className="reveal border border-obsidian/80 bg-forest/40 p-4">
      <p ref={ref} className="type-stat" />
      <h3 className="type-card mt-3">{label}</h3>
      {note ? <p className="type-small mt-2 text-amber">{note}</p> : null}
    </article>
  );
}

type EventOverviewProps = {
  reducedMotion: boolean;
};

export function EventOverview({ reducedMotion }: EventOverviewProps) {
  return (
    <section id="overview" className="sheet sheet-forest scroll-mt-24 border-t border-obsidian px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="type-meta text-cyan">01 / THE MISSION</p>
        <h2 className="type-section mt-3 max-w-3xl">THE GRID IS WAITING</h2>
        <p className="type-body mt-5 max-w-2xl">
          Investigate. Decode. Exploit. Reverse. Every flag opens another path through the dimension.
        </p>
        <CountdownReactor />
        <div className="mt-10 border border-obsidian bg-void/80">
          <div className="flex items-center justify-between border-b border-obsidian px-4 py-2 type-meta text-muted">
            <span>GRID // STATUS</span>
            <span className="text-neon">SEASON 01</span>
          </div>
          <div className="reveal-grid grid gap-px bg-obsidian sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Competition stages" value={2} kind="count" reducedMotion={reducedMotion} />
            <Stat label="Challenge disciplines" value={10} kind="count" reducedMotion={reducedMotion} />
            <Stat label="Maximum members per team" value={3} kind="count" reducedMotion={reducedMotion} />
            <Stat label="Finalist teams for the offline stage" value={40} kind="count" reducedMotion={reducedMotion} />
            <Stat label="Total cash prizes" value={100000} kind="inr" reducedMotion={reducedMotion} />
            <Stat label="Registration fee per player" value={200} kind="inr" reducedMotion={reducedMotion} />
            <Stat
              label="Expected online players"
              value={1000}
              kind="plus"
              note="Planning estimate, not a confirmed registration count."
              reducedMotion={reducedMotion}
            />
            <article className="reveal border border-obsidian/80 bg-forest/40 p-4">
              <p className="type-stat is-ink">CTF</p>
              <h3 className="type-card mt-3">National-level challenge</h3>
              <p className="type-small mt-2">Two stages. Ten disciplines. One long night.</p>
            </article>
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="reveal border border-obsidian p-5">
            <h3 className="type-meta text-neon">WHO CAN PLAY</h3>
            <ul className="type-small mt-4 space-y-2 text-ink">
              <li>Open to participants across India, ages 16–28.</li>
              <li>Any branch, any year. Cross-college teams are welcome.</li>
              <li>Teams of up to 3. Solo or duo may play the online round.</li>
              <li>Finalists show a valid college ID at check-in.</li>
            </ul>
          </div>
          <div className="reveal reveal-delay-1 border border-obsidian p-5">
            <h3 className="type-meta text-neon">KEY DATES</h3>
            <dl className="type-small mt-4 space-y-3 text-ink">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Qualifier</dt>
                <dd className="font-mono text-ink">6 Dec 2026</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Finalists announced</dt>
                <dd className="font-mono text-ink">8 Dec 2026</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Finals begin</dt>
                <dd className="font-mono text-ink">26 Dec, 10 AM</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Finals end</dt>
                <dd className="font-mono text-ink">27 Dec, 4 PM</dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="type-small mt-6 max-w-3xl border-l-2 border-amber pl-4">
          Play fair. Attack only the systems the organisers provide. University systems, other teams, and outside
          targets are off limits. The writeup deadline will be posted on the official channels. Fee {inr.fee} per player.
        </p>
      </div>
    </section>
  );
}
