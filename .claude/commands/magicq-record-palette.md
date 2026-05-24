# MagicQ: Record a Palette

Use this skill when asked to create or save a colour, position, or beam palette.

Palettes are the foundation of good MagicQ programming. Cues that reference palettes automatically reflect future palette updates. Always create palettes before recording cues that use those colours or positions.

## Palette types

| Type | Records | Tool |
|------|---------|------|
| Colour | Cyan, Magenta, Yellow, Col1/2, ColMix | `record_colour_palette` |
| Position | Pan, Tilt, Focus, Zoom | `record_position_palette` |
| Beam | Gobo, Rotate, Iris, Shutter, Frost | `record_beam_palette` |

## Before starting — check the registry

Call `list_palettes` to see which IDs are already in use. Pick an ID that isn't taken, or confirm with the user which slot to overwrite.

## What you need from the user before starting
- Palette type (colour / position / beam)
- Target palette slot ID (1–1024) — confirm it's free or intentionally overwriting
- A name for the palette (required — this is saved to the local registry)
- Which heads or group to use
- The attribute values to record

For colour palettes: get CMY or RGB values. Convert RGB → CMY if needed: C = 255−R, M = 255−G, Y = 255−B (scaled 0–255).

For position palettes: get pan and tilt values (0–255 for 8-bit, or 0–65535 for 16-bit).

## Workflow

Use `run_sequence` to record a palette in a single tool call:

**Colour palette example (deep blue):**
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "set_attribute", "attr": 16, "value": 255 },
  { "op": "set_attribute", "attr": 17, "value": 128 },
  { "op": "set_attribute", "attr": 18, "value": 0 },
  { "op": "record_colour_palette", "palette_id": 5, "name": "Deep Blue" },
  { "op": "clear_programmer" }
]
```

**Position palette example:**
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "set_attribute", "attr": 4, "value": 128 },
  { "op": "set_attribute", "attr": 5, "value": 96 },
  { "op": "record_position_palette", "palette_id": 2, "name": "Centre Stage" },
  { "op": "clear_programmer" }
]
```

Attribute reference for common palette types:
- Colour: Cyan=16, Magenta=17, Yellow=18; discrete wheel: Col1=6, Col2=7
- Position: Pan=4, Tilt=5, Focus=12, Zoom=13
- Beam: Gobo1=8, Iris=3, Shutter=2, Frost1=32

Always pass `name` to `record_*_palette` — it is saved to `palettes.json` automatically.

## After recording

Tell the user:
- Palette type and slot ID recorded
- Which heads/group were used
- The attribute values captured
- That the programmer is clear and the palette is ready to include in cues

## Notes

- Record palettes for **all fixtures of the same type together** — MagicQ stores per-fixture-type data in palettes, so if you record a colour with only some heads selected, other fixture types won't have that palette entry
- Palette IDs are shared across all palettes of that type; keep a consistent numbering scheme (e.g. colour 1 = Red, 2 = Blue, 3 = Green)
- Call `attribute_list` if you need to look up any attribute number
