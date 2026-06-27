const globalAmbientParts = [
  "global-ambient-band global-ambient-band--one",
  "global-ambient-band global-ambient-band--two",
  "global-ambient-rail global-ambient-rail--one",
  "global-ambient-line global-ambient-line--one",
  "global-ambient-line global-ambient-line--two",
  "global-ambient-sweep global-ambient-sweep--one",
  "global-ambient-sweep global-ambient-sweep--two",
  "global-ambient-node global-ambient-node--one"
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
