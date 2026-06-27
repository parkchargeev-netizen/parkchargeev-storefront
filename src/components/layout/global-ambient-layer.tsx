const globalAmbientParts = [
  "global-ambient-band global-ambient-band--one",
  "global-ambient-band global-ambient-band--two",
  "global-ambient-band global-ambient-band--three",
  "global-ambient-rail global-ambient-rail--one",
  "global-ambient-rail global-ambient-rail--two",
  "global-ambient-rail global-ambient-rail--three",
  "global-ambient-rail global-ambient-rail--four",
  "global-ambient-rail global-ambient-rail--five",
  "global-ambient-line global-ambient-line--one",
  "global-ambient-line global-ambient-line--two",
  "global-ambient-line global-ambient-line--three",
  "global-ambient-sweep global-ambient-sweep--one",
  "global-ambient-sweep global-ambient-sweep--two",
  "global-ambient-pulse global-ambient-pulse--one",
  "global-ambient-pulse global-ambient-pulse--two",
  "global-ambient-node global-ambient-node--one",
  "global-ambient-node global-ambient-node--two",
  "global-ambient-node global-ambient-node--three",
  "global-ambient-node global-ambient-node--four"
] as const;

export function GlobalAmbientLayer() {
  return (
    <div className="global-ambient-layer" data-motion-loop="ambient" aria-hidden>
      {globalAmbientParts.map((className) => (
        <span key={className} className={className} />
      ))}
    </div>
  );
}
