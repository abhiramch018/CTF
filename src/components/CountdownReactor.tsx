import { useEffect, useState } from "react";

const QUALIFIER_START = Date.parse("2026-12-06T09:00:00+05:30");

function remaining(now: number) {
  const diff = QUALIFIER_START - now;
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function CountdownReactor() {
  const [clock, setClock] = useState(() => remaining(Date.now()));
  const [charge, setCharge] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const left = QUALIFIER_START - now;
      setClock(remaining(now));
      const span = 1000 * 60 * 60 * 24 * 80;
      setCharge(left <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((1 - left / span) * 100))));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="reactor mt-8 border border-obsidian p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="type-meta text-cyan">COUNTDOWN REACTOR</p>
        <p className="type-meta text-muted">ONLINE QUALIFIER · 6 DEC 2026 · 9:00 AM IST</p>
      </div>
      {clock ? (
        <p className="type-stat mt-4 text-ink" aria-live="polite">
          {clock.days}d {String(clock.hours).padStart(2, "0")}h {String(clock.minutes).padStart(2, "0")}m{" "}
          {String(clock.seconds).padStart(2, "0")}s
        </p>
      ) : (
        <p className="type-card mt-4 text-neon">The online qualifier start time has passed.</p>
      )}
      <div className="reactor-track mt-4" aria-hidden="true">
        <span style={{ width: `${charge}%` }} />
      </div>
    </div>
  );
}
