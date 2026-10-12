type PortalFallbackProps = {
  animate?: boolean;
  compact?: boolean;
};

export function PortalFallback({ animate = false, compact = false }: PortalFallbackProps) {
  return (
    <div
      className={`portal-fallback${animate ? " is-animated" : ""}${compact ? " is-compact" : ""}`}
      aria-hidden="true"
    >
      <div className="css-portal__stage">
        <div className="css-portal__rubble css-portal__rubble-left" />
        <div className="css-portal__frame">
          <div className="css-portal__gate" />
        </div>
        <div className="css-portal__rubble css-portal__rubble-right" />
      </div>
    </div>
  );
}
