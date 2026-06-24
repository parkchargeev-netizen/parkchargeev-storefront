type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  as: Heading = "h2"
}: SectionHeadingProps) {
  return (
    <div
      className={align === "center" ? "ds-section-heading mx-auto text-center" : "ds-section-heading"}
      data-motion="reveal"
    >
      <p className="ds-eyebrow">{eyebrow}</p>
      <Heading className="ds-section-title">{title}</Heading>
      {body ? (
        <p className="ds-section-heading__body">{body}</p>
      ) : null}
    </div>
  );
}
