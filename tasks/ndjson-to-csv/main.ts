//#region generated meta
type Inputs = {
  ndjsonPath: string;
  saveAs: string | null;
  delimiter: string | null;
  includeHeaders: boolean | null;
};
type Outputs = {
  output: string;
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import { readFile, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";

/**
 * Normalize email addresses by converting common anomalies to proper format
 */
function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return email;
  }

  return email
    // [at] -> @
    .replace(/\[at\]/gi, "@")
    // (at) -> @
    .replace(/\(at\)/gi, "@")
    // " at " -> @
    .replace(/\s+at\s+/gi, "@")
    // [dot] -> .
    .replace(/\[dot\]/gi, ".")
    // " dot " -> .
    .replace(/\s+dot\s+/gi, ".")
    // # -> @
    .replace(/#/g, "@")
    // Fix missing @ before domain (e.g., "zhangpanrobotgmail.com" -> "zhangpanrobot@gmail.com")
    .replace(/([a-z0-9])gmail\.com$/i, "$1@gmail.com")
    .replace(/([a-z0-9])outlook\.com$/i, "$1@outlook.com")
    .replace(/([a-z0-9])yahoo\.com$/i, "$1@yahoo.com")
    .replace(/([a-z0-9])hotmail\.com$/i, "$1@hotmail.com")
    .replace(/([a-z0-9])163\.com$/i, "$1@163.com")
    .replace(/([a-z0-9])126\.com$/i, "$1@126.com")
    .replace(/([a-z0-9])qq\.com$/i, "$1@qq.com");
}

export default async function(
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  // Determine output path
  const outputPath = params.saveAs ?? join(
    context.sessionDir,
    basename(params.ndjsonPath, ".ndjson") + ".csv"
  );

  // Read NDJSON file
  const content = await readFile(params.ndjsonPath, "utf8");
  const lines = content.trim().split("\n").filter(line => line.trim() !== "");

  // Parse NDJSON lines into objects and normalize email field
  const data = lines.map(line => {
    const obj = JSON.parse(line);
    // Trim and normalize name field if it exists
    if (obj.name && typeof obj.name === "string") {
      obj.name = obj.name.trim();
    }
    // Trim and normalize email field if it exists
    if (obj.email && typeof obj.email === "string") {
      obj.email = normalizeEmail(obj.email.trim());
    }
    return obj;
  });

  if (data.length === 0) {
    throw new Error("No data found in NDJSON file");
  }

  // Collect all unique keys from all objects to form columns
  const allKeys = new Set<string>();
  for (const obj of data) {
    for (const key of Object.keys(obj)) {
      allKeys.add(key);
    }
  }

  const columnHeaders = Array.from(allKeys);
  const delimiter = params.delimiter ?? ",";
  const includeHeaders = params.includeHeaders ?? true;

  // Escape CSV field if needed
  const escapeField = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }
    const strValue = String(value);
    // If field contains delimiter, quotes, or newlines, escape it
    if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes("\n")) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  // Build CSV content
  const csvLines: string[] = [];

  // Add headers if needed
  if (includeHeaders) {
    csvLines.push(columnHeaders.map(escapeField).join(delimiter));
  }

  // Add data rows
  for (const obj of data) {
    const row = columnHeaders.map(key => escapeField(obj[key]));
    csvLines.push(row.join(delimiter));
  }

  // Write to file
  await writeFile(outputPath, csvLines.join("\n") + "\n", "utf8");

  context.reportProgress(100);

  return {
    output: outputPath,
  };
}
