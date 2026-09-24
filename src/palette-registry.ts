import * as fs from "fs";
import * as path from "path";

export type PaletteType = "colour" | "position" | "beam";

export interface PaletteEntry {
  name: string;
  updatedAt: string;
}

export interface Registry {
  colour: Record<string, PaletteEntry>;
  position: Record<string, PaletteEntry>;
  beam: Record<string, PaletteEntry>;
}

export function registryPath(): string {
  return path.resolve(process.env.MAGICQ_PALETTE_REGISTRY ?? "palettes.json");
}

export function loadRegistry(): Registry {
  const p = registryPath();
  if (!fs.existsSync(p)) return { colour: {}, position: {}, beam: {} };
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as Registry;
  } catch {
    return { colour: {}, position: {}, beam: {} };
  }
}

function saveRegistry(registry: Registry): void {
  fs.writeFileSync(registryPath(), JSON.stringify(registry, null, 2) + "\n", "utf-8");
}

export function upsertPalette(type: PaletteType, id: number, name: string): void {
  const registry = loadRegistry();
  registry[type][String(id)] = { name, updatedAt: new Date().toISOString() };
  saveRegistry(registry);
}

const TYPE_LABELS: Record<PaletteType, string> = {
  colour: "Colour",
  position: "Position",
  beam: "Beam",
};

export function formatRegistry(registry: Registry): string {
  const sections: string[] = [];

  for (const type of ["colour", "position", "beam"] as PaletteType[]) {
    const entries = registry[type];
    const ids = Object.keys(entries).map(Number).sort((a, b) => a - b);
    if (ids.length === 0) continue;
    const rows = ids
      .map((id) => `  ${String(id).padStart(4)}  ${entries[String(id)].name}`)
      .join("\n");
    sections.push(`${TYPE_LABELS[type]} palettes:\n${rows}`);
  }

  return sections.length > 0 ? sections.join("\n\n") : "No palettes registered.";
}

export function defaultName(type: PaletteType, id: number): string {
  return `${TYPE_LABELS[type]} ${id}`;
}
