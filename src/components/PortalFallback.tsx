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
        {compact ? <div className="css-portal__core" /> : null}
        {compact ? null : (
          <>
            <div className="css-portal__ring" />
            <div className="css-portal__visor" />
            <div className="css-portal__scan" />
          </>
        )}
      </div>
    </div>
  );
}
