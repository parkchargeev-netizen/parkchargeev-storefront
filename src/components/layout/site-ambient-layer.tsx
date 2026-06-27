const siteAmbientParts = [
  "site-ambient-circuit__ribbon site-ambient-circuit__ribbon--one",
  "site-ambient-circuit__beam site-ambient-circuit__beam--one",
  "site-ambient-circuit__beam site-ambient-circuit__beam--two",
  "site-ambient-circuit__node site-ambient-circuit__node--one",
  "site-ambient-circuit__node site-ambient-circuit__node--two",
  "site-ambient-circuit__trace site-ambient-circuit__trace--one"
] as const;

export function SiteAmbientLayer() {
  return (
    <div className="site-ambient-circuit" data-motion-loop="ambient" aria-hidden>
      {siteAmbientParts.map((className) => (
        <span key={className} className={className} />
      ))}
    </div>
  );
}
