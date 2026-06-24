import { stringifyJsonLd } from "@/lib/structured-data";

type JsonLdProps = {
  data: unknown | ReadonlyArray<unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  const entries = Array.isArray(data) ? data : [data];

  return entries.map((entry, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: stringifyJsonLd(entry) }}
    />
  ));
}
