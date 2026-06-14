export function generateCSV(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const escapedHeaders = headers.map(escapeCSV);
  const csv = [
    escapedHeaders.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csv;
}

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Quote field if it contains comma, newline, or quote
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function downloadCSV(csv: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
