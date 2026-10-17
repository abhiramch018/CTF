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
        <div className="css-portal__tower css-portal__tower-left" />
        <div className="css-portal__tower css-portal__tower-right" />
        <div className="css-portal__vault" />
        <div className="css-portal__beam" />
        <div className="css-portal__frame" />
        <div className="css-portal__operative" />
        <div className="css-portal__ground" />
      </div>
    </div>
  );
}
