const energyParticles = [
  { left: "18%", top: "24%", delay: "0s" },
  { left: "42%", top: "62%", delay: "0.7s" },
  { left: "66%", top: "35%", delay: "1.4s" },
  { left: "84%", top: "54%", delay: "2.1s" },
  { left: "28%", top: "72%", delay: "2.8s" },
  { left: "58%", top: "18%", delay: "3.5s" },
  { left: "76%", top: "78%", delay: "4.2s" },
  { left: "12%", top: "48%", delay: "4.9s" }
] as const;

export function ChargingVisual() {
  return (
    <div className="real-charger-media" aria-hidden>
      <div className="real-charger-media__frame">
        <span className="real-charger-media__photo" />
        <span className="real-charger-media__shade" />
        <span className="real-charger-media__scan" />
        <span className="real-charger-media__charger-pulse" />
        <span className="real-charger-media__cable-flow real-charger-media__cable-flow--one" />
        <span className="real-charger-media__cable-flow real-charger-media__cable-flow--two" />
        <span className="real-charger-media__lightline real-charger-media__lightline--one" />
        <span className="real-charger-media__lightline real-charger-media__lightline--two" />
        <span className="real-charger-media__floor-glow" />

        {energyParticles.map((dot) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className="real-charger-media__dot"
            style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }}
          />
        ))}
      </div>
    </div>
  );
}
