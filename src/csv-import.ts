import * as fs from "fs";
import { PaletteType, upsertPalette, defaultName } from "./palette-registry.js";

const TYPE_ALIASES: Record<string, PaletteType> = {
  c: "colour",
  colour: "colour",
  color: "colour",
  p: "position",
  position: "position",
  b: "beam",
  beam: "beam",
};

// Minimal quoted-CSV parser — handles fields wrapped in double quotes.
function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Import palette names from a CSV file.
 *
 * Expected format (one palette per line):
 *   type, id, name
 *
 * Where type is: colour | color | c | position | p | beam | b  (case-insensitive)
 * Name is optional — defaults to "Colour N" / "Position N" / "Beam N".
 *
 * Lines beginning with # and blank lines are skipped.
 * Rows where col[2] is a plain number (MagicQ raw attribute-value export format)
 * are accepted but use the default name, since the raw format carries no name.
 */
export function importCsv(filePath: string): ImportResult {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 2) {
      errors.push(`Line ${i + 1}: expected at least 2 columns (type, id)`);
      continue;
    }

    const type = TYPE_ALIASES[cols[0].toLowerCase()];
    if (!type) {
      // Unrecognised type — likely a header row or unsupported section; skip silently.
      skipped++;
      continue;
    }

    const id = parseInt(cols[1], 10);
    if (isNaN(id) || id < 1 || id > 1024) {
      errors.push(`Line ${i + 1}: invalid palette ID "${cols[1]}" (must be 1–1024)`);
      continue;
    }

    // col[2]: if it's a plain number it's a MagicQ raw-format field (num_of_chans), not a name.
    const nameField = cols[2];
    const name =
      nameField && isNaN(Number(nameField)) ? nameField : defaultName(type, id);

    upsertPalette(type, id, name);
    imported++;
  }

  return { imported, skipped, errors };
}
