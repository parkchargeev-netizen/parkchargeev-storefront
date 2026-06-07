const signalDots = [
  { left: "18%", top: "26%", delay: "0s" },
  { left: "34%", top: "68%", delay: "0.6s" },
  { left: "58%", top: "30%", delay: "1.2s" },
  { left: "78%", top: "62%", delay: "1.8s" }
] as const;

export function ChargingVisual() {
  return (
    <div className="charging-cinema" aria-hidden>
      <div className="charging-cinema__screen">
        <div className="charging-cinema__scan" />
        <div className="charging-cinema__route" />
        <div className="charging-cinema__station">
          <span className="charging-cinema__station-screen" />
          <span className="charging-cinema__station-ring" />
          <span className="charging-cinema__station-led" />
        </div>
        <div className="charging-cinema__vehicle">
          <span className="charging-cinema__vehicle-glass" />
          <span className="charging-cinema__vehicle-charge" />
        </div>
        <div className="charging-cinema__wave charging-cinema__wave--one" />
        <div className="charging-cinema__wave charging-cinema__wave--two" />
        {signalDots.map((dot) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className="charging-cinema__dot"
            style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }}
          />
        ))}
      </div>

      <div className="charging-cinema__hud charging-cinema__hud--top">
        <span>Canlı keşif</span>
        <strong>11 kW AC</strong>
      </div>
      <div className="charging-cinema__hud charging-cinema__hud--bottom">
        <span>Önerilen akış</span>
        <strong>Ürün + kurulum</strong>
      </div>
    </div>
  );
}
