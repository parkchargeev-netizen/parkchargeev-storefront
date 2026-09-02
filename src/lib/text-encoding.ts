const mojibakePairs: ReadonlyArray<readonly [string, string]> = [
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00c3\u0153", "\u00dc"],
  ["\u00c3\u00b6", "\u00f6"],
  ["\u00c3\u2013", "\u00d6"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u2021", "\u00c7"],
  ["\u00c4\u00b1", "\u0131"],
  ["\u00c4\u00b0", "\u0130"],
  ["\u00c4\u0178", "\u011f"],
  ["\u00c4\u017d", "\u011e"],
  ["\u00c4\u009f", "\u011f"],
  ["\u00c4\u009e", "\u011e"],
  ["\u00c5\u0178", "\u015f"],
  ["\u00c5\u017d", "\u015e"],
  ["\u00c5\u009f", "\u015f"],
  ["\u00c5\u009e", "\u015e"],
  ["\u00c2\u00b7", "\u00b7"],
  ["\u00e2\u20ac\u0153", "\""],
  ["\u00e2\u20ac\u009d", "\""],
  ["\u00e2\u20ac\u02dc", "'"],
  ["\u00e2\u20ac\u2122", "'"],
  ["\u00e2\u20ac\u201c", "-"],
  ["\u00e2\u20ac\u009d", "-"],
  ["\u00e2\u20ac\u00a6", "..."],
  ["\u00c2", ""]
];

export function repairMojibakeText(value: string) {
  return mojibakePairs.reduce(
    (text, [broken, replacement]) => text.split(broken).join(replacement),
    value
  );
}

export function repairMojibakeDeep<T>(value: T): T {
  if (typeof value === "string") {
    return repairMojibakeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairMojibakeDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, repairMojibakeDeep(nestedValue)])
    ) as T;
  }

  return value;
}