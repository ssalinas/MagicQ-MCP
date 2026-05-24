# MagicQ: Program a Cue

Use this skill when asked to create, record, or program a cue on MagicQ.

## Before starting — read the palette registry

Read the `palettes://registry` resource or call `list_palettes`. This tells you which colour and position palettes are available and what their IDs are. Do not assume palette IDs — always check.

## What you need from the user before starting
- Which heads or group to include
- Target cue slot number (the cue stack must already exist on the console)
- Intensity level
- Colour: ideally a palette ID — if not, ask before writing raw CMY values
- Position: ideally a palette ID — if not, ask before writing raw pan/tilt values
- Any additional attributes (beam, gobo, etc.)

If the user gives you raw colour/position values, ask whether a colour or position palette should be created first. Prefer palettes — they make future edits easier.

## Workflow

Use `run_sequence` to execute the entire cue programming workflow in a single tool call. Do not make individual tool calls for each step — that wastes LLM round trips.

Build the steps array in this order:

```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "include_colour_palette", "palette_id": 3 },
  { "op": "include_position_palette", "palette_id": 1 },
  { "op": "set_intensity", "level": 80 },
  { "op": "record_cue", "cue_id": 10 },
  { "op": "clear_programmer" }
]
```

Steps that may be omitted if not needed:
- `include_colour_palette` — only if a colour palette is being applied
- `include_position_palette` — only if a position palette is being applied
- `include_beam_palette` — only if a beam palette is being applied
- `set_attribute` entries — only for hard-coded values not covered by palettes

Alternatively, for a single straightforward cue with no unusual steps, `program_look` covers the same workflow with a flat parameter set and no sequence to construct.

## Confirming success

After the sequence, tell the user:
- Which heads/group were programmed
- Intensity level
- Which palettes were included (or attribute values if hard-coded)
- Which cue slot was recorded
- That the programmer has been cleared

## Common mistakes to avoid

- **Do not** set attributes before selecting heads — MagicQ ignores them
- **Do not** skip the trailing `clear_programmer`
- **Do not** hard-code CMY or pan/tilt values if a palette exists or should be created
- **Do not** assume the cue stack exists — confirm with the user first
