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
    <div className="command-zone">
      <div className="command-zone-head">
        <p className="type-meta text-cyan">ENCRYPTED CLOCK</p>
        <p className="type-meta text-muted">ONLINE QUALIFIER · 6 DEC 2026 · 09:00 IST</p>
      </div>
      {clock ? (
        <div className="clock-row" aria-live="polite">
          <ClockCell value={String(clock.days)} label="Days" />
          <ClockCell value={String(clock.hours).padStart(2, "0")} label="Hours" />
          <ClockCell value={String(clock.minutes).padStart(2, "0")} label="Minutes" />
          <ClockCell value={String(clock.seconds).padStart(2, "0")} label="Seconds" />
        </div>
      ) : (
        <p className="type-card clock-passed">The online qualifier start time has passed.</p>
      )}
      <div className="reactor-track" aria-hidden="true">
        <span style={{ width: `${charge}%` }} />
      </div>
      <dl className="command-dates">
        <div>
          <dt>Qualifier</dt>
          <dd>6 December 2026 · 09:00–21:00 IST · remote</dd>
        </div>
        <div>
          <dt>Finalists</dt>
          <dd>8 December 2026</dd>
        </div>
        <div>
          <dt>Finals</dt>
          <dd>26–27 December 2026 · KLEF, Vaddeswaram</dd>
        </div>
      </dl>
    </div>
  );
}

function ClockCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="clock-cell">
      <span className="clock-value">{value}</span>
      <span className="type-meta">{label}</span>
    </div>
  );
}

export function CountdownSection() {
  return (
    <section id="countdown" className="band scroll-mt-8" aria-labelledby="countdown-title">
      <div className="band-copy">
        <p className="type-meta text-cyan">COUNTDOWN</p>
        <h2 id="countdown-title" className="type-section mt-3 max-w-3xl">
          TIME UNTIL THE QUALIFIER
        </h2>
        <CountdownReactor />
      </div>
    </section>
  );
}
