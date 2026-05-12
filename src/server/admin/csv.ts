type CsvColumn = {
  header: string;
  value: (item: any) => unknown;
};

function serializeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(items: readonly unknown[], columns: CsvColumn[]) {
  const header = columns.map((column) => serializeCsvValue(column.header)).join(",");
  const rows = items.map((item) =>
    columns.map((column) => serializeCsvValue(column.value(item))).join(",")
  );

  return [header, ...rows].join("\n");
}

export function csvResponse(
  filename: string,
  items: readonly unknown[],
  columns: CsvColumn[]
) {
  return new Response(toCsv(items, columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
