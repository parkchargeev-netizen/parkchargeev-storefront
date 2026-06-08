const sweepLayers = ["one", "two", "three"] as const;
const connectorTraceLayers = ["one", "two", "three"] as const;
const dataStreamLayers = ["one", "two", "three"] as const;
const auroraLayers = ["one", "two"] as const;
const lineLayers = ["one", "two", "three"] as const;
const flowLayers = ["one", "two", "three"] as const;
const chargeLaneLayers = ["one", "two", "three"] as const;
const gradientRibbonLayers = ["one", "two"] as const;
const beamLayers = ["one", "two", "three"] as const;
const ringLayers = ["one", "two", "three"] as const;
const pulseLayers = ["one", "two"] as const;
const currentLayers = ["one", "two", "three", "four"] as const;
const haloLayers = ["one", "two", "three"] as const;
const sparkLayers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"] as const;
const particleLayers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"] as const;

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
      {renderLayer("site-ambient-background__spark", sparkLayers)}
      {renderLayer("site-ambient-background__particle", particleLayers)}
    </div>
  );
}
