import { useEffect, useRef, useState } from "react";
import { challenges, inr } from "../content/event.ts";
import { registrationUrl } from "../config/site.ts";

type Line = { id: number; text: string };

const helpText = "Commands: help, mission, sectors, protocol, vault, register, breach, clear.";

function answer(command: string) {
  switch (command) {
    case "help":
      return helpText;
    case "mission":
      return "DEAD NOCTIS CTF Season 01. National cybersecurity capture the flag. Online qualifier 6 December 2026, 9 AM–9 PM. Offline finals 26–27 December 2026 at KLEF, Vaddeswaram. Teams of up to 3. Ages 16–28.";
    case "sectors":
      return challenges.map((item) => `${item.id} ${item.name}`).join(" · ");
    case "protocol":
      return "Up to 40 finalist teams: up to 35 from the leaderboard and up to 5 wildcard teams. Finalists are named on 8 December 2026. This page does not show a live leaderboard.";
    case "vault":
      return `Cash prizes: 1st ${inr.first}, 2nd ${inr.second}, 3rd ${inr.third}. Total ${inr.total}. Internships are announced only when a partner confirms them.`;
    case "register":
      return registrationUrl
        ? `Registration is ${inr.fee} per player. Open ${registrationUrl}`
        : `Registration is ${inr.fee} per player. The public registration link has not been published yet.`;
    case "breach":
      document.documentElement.classList.add("breach");
      return "THE NIGHT REMEMBERS. Cipher accepted.";
    case "clear":
      return "";
    default:
      return `Unknown command “${command}”. Type help.`;
  }
}

type MissionTerminalProps = {
  open: boolean;
  onClose: () => void;
};

export function MissionTerminal({ open, onClose }: MissionTerminalProps) {
  const [lines, setLines] = useState<Line[]>([{ id: 0, text: helpText }]);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) return null;

  const submit = (value: string) => {
    const command = value.trim().toLowerCase();
    if (!command) return;
    const response = answer(command);
    setLines((current) => {
      const echoed = { id: nextId.current, text: `> ${command}` };
      nextId.current += 1;
      if (command === "clear") return [{ id: nextId.current++, text: helpText }];
      return [...current, echoed, { id: nextId.current++, text: response }];
    });
    setDraft("");
  };

  return (
    <div className="terminal-dialog" role="presentation" onClick={onClose}>
      <form
        className="terminal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="terminal-title" className="type-meta text-neon">
            NOCTIS TERMINAL
          </h2>
          <button type="button" className="type-meta text-muted" onClick={onClose}>
            CLOSE
          </button>
        </div>
        <div className="terminal-log mt-4" aria-live="polite">
          {lines.map((line) => (
            <p key={line.id} className="type-small text-ink">
              {line.text}
            </p>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="sr-only">Terminal command</span>
          <input
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="terminal-input"
            autoComplete="off"
            spellCheck={false}
            placeholder="help"
          />
        </label>
      </form>
    </div>
  );
}
