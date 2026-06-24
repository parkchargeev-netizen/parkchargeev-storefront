type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left"
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="premium-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal text-on-surface md:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">{body}</p>
      ) : null}
    </div>
  );
}
