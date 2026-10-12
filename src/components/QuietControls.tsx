import { useState } from "react";
import { setLite, setSound } from "../lib/signal.ts";
import { MissionTerminal } from "./MissionTerminal.tsx";

export function QuietControls() {
  const [sound, setSoundOn] = useState(false);
  const [lite, setLiteOn] = useState(false);
  const [terminal, setTerminal] = useState(false);

  return (
    <>
      <div className="quiet-controls">
        <button
          type="button"
          className="quiet-control"
          aria-pressed={sound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          onClick={() => {
            const next = !sound;
            setSoundOn(next);
            setSound(next);
          }}
        >
          {sound ? "♪" : "◌"}
        </button>
        <button
          type="button"
          className="quiet-control"
          aria-pressed={lite}
          aria-label={lite ? "Use full effects" : "Use lighter effects"}
          onClick={() => {
            const next = !lite;
            setLiteOn(next);
            setLite(next);
          }}
        >
          {lite ? "○" : "◉"}
        </button>
        <button type="button" className="quiet-control" aria-label="Open terminal" onClick={() => setTerminal(true)}>
          ›
        </button>
      </div>
      <MissionTerminal open={terminal} onClose={() => setTerminal(false)} />
    </>
  );
}
