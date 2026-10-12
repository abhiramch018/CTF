type GhostWordProps = {
  children: string;
};

export function GhostWord({ children }: GhostWordProps) {
  return (
    <p className="ghost-word" aria-hidden="true">
      {children}
    </p>
  );
}
