const sweepLayers = ["one", "two"] as const;
const connectorTraceLayers = [] as const;
const dataStreamLayers = ["one", "two"] as const;
const auroraLayers = ["one"] as const;
const lineLayers = ["one", "two"] as const;
const flowLayers = [] as const;
const chargeLaneLayers = ["one", "two"] as const;
const gradientRibbonLayers = [] as const;
const beamLayers = ["one"] as const;
const ringLayers = ["one"] as const;
const pulseLayers = ["one"] as const;
const currentLayers = ["one", "three"] as const;
const haloLayers = ["two"] as const;
const cableTrailLayers = ["one", "three"] as const;
const scanLayers = [] as const;
const sparkLayers = ["one", "three", "six", "eight", "ten"] as const;
const particleLayers = ["one", "two", "four", "seven"] as const;

function renderLayer(baseClassName: string, variants: readonly string[]) {
  return variants.map((variant) => (
    <span key={`${baseClassName}-${variant}`} className={`${baseClassName} ${baseClassName}--${variant}`} />
  ));
}

export function SiteAmbientBackground() {
  return (
    <div className="site-ambient-background" aria-hidden>
      <span className="site-ambient-background__matrix" />
      {renderLayer("site-ambient-background__sweep", sweepLayers)}
      {renderLayer("site-ambient-background__connector-trace", connectorTraceLayers)}
      {renderLayer("site-ambient-background__data-stream", dataStreamLayers)}
      {renderLayer("site-ambient-background__aurora", auroraLayers)}
      {renderLayer("site-ambient-background__line", lineLayers)}
      {renderLayer("site-ambient-background__flow", flowLayers)}
      {renderLayer("site-ambient-background__charge-lane", chargeLaneLayers)}
      {renderLayer("site-ambient-background__gradient-ribbon", gradientRibbonLayers)}
      {renderLayer("site-ambient-background__beam", beamLayers)}
      {renderLayer("site-ambient-background__ring", ringLayers)}
      {renderLayer("site-ambient-background__pulse", pulseLayers)}
      {renderLayer("site-ambient-background__current", currentLayers)}
      {renderLayer("site-ambient-background__halo", haloLayers)}
      {renderLayer("site-ambient-background__cable-trail", cableTrailLayers)}
      {renderLayer("site-ambient-background__scan", scanLayers)}
      {renderLayer("site-ambient-background__spark", sparkLayers)}
      {renderLayer("site-ambient-background__particle", particleLayers)}
    </div>
  );
}
