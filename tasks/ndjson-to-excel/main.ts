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
    basename(params.ndjsonPath, ".ndjson") + ".xlsx"
  );

  // Read NDJSON file
  const content = await readFile(params.ndjsonPath, "utf8");
  const lines = content.trim().split("\n").filter(line => line.trim() !== "");

  // Parse NDJSON lines into objects and normalize email field
  const data = lines.map(line => {
    const obj = JSON.parse(line);

    // Split name into first name and last name
    let firstName = "";
    let lastName = "";
    if (obj.name && typeof obj.name === "string") {
      const nameParts = obj.name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ");
    }

    // Trim and normalize email field if it exists
    const email = obj.email && typeof obj.email === "string"
      ? normalizeEmail(obj.email.trim())
      : obj.email;

    // Return new object with first name, last name, and email in order
    return {
      "First Name": firstName,
      "Last Name": lastName,
      "Email": email,
    };
  });

  if (data.length === 0) {
    throw new Error("No data found in NDJSON file");
  }

  // Create worksheet with fixed columns: First Name, Last Name, Email
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: ["First Name", "Last Name", "Email"]
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
