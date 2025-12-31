//#region generated meta
type Inputs = {
  ndjsonPath: string;
  sheetName: string;
  saveAs: string | null;
};
type Outputs = {
  output: string;
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import { readFile, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";
import * as XLSX from "xlsx";

export default async function(
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  // Determine output path
  const outputPath = params.saveAs ?? join(
    context.sessionDir,
    basename(params.ndjsonPath, ".ndjson") + ".xlsx"
  );

  // Read NDJSON file
  const content = await readFile(params.ndjsonPath, "utf8");
  const lines = content.trim().split("\n").filter(line => line.trim() !== "");

  // Parse NDJSON lines into objects
  const data = lines.map(line => JSON.parse(line));

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

  // Create worksheet with all columns
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: Array.from(allKeys)
  });

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, params.sheetName);

  // Write to file
  await writeFile(outputPath, XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }));

  context.reportProgress(100);

  return {
    output: outputPath,
  };
}
