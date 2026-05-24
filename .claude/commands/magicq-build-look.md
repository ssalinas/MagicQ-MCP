# MagicQ: Build a Look from Palettes

## Before starting — read the palette registry

Read the `palettes://registry` resource or call `list_palettes` to see all available palettes with their IDs and names. Use this to select the right palette IDs for the look. Never guess at palette numbers.

Use this skill when asked to compose a lighting look and record it as a cue, where colour palettes and/or position palettes already exist on the console.

This is the **preferred way to program cues** on MagicQ. Cues built from palette references automatically update when palettes change — making future edits and colour/position changes instant.

## What you need from the user before starting
- Which group or heads
- Colour palette ID (ask the user — they should know the palette numbering scheme)
- Position palette ID (if applicable)
- Beam palette ID (if applicable)
- Intensity level
- Cue slot to record into

If the user doesn't have palettes set up yet, redirect to `/magicq-record-palette` first.

## Workflow

Use `run_sequence` to build a look from palettes in a single tool call.

For a **single cue**, `program_look` is the simplest option — pass the palette IDs directly:
```
program_look(group=1, colour_palette_id=3, position_palette_id=1, intensity=80, cue_id=10)
```

For **multiple cues** or more complex sequences, use `run_sequence`:

```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "include_colour_palette", "palette_id": 3 },
  { "op": "include_position_palette", "palette_id": 1 },
  { "op": "set_intensity", "level": 80 },
  { "op": "record_cue", "cue_id": 10 },
  { "op": "clear_programmer" },

  { "op": "select_group", "group": 1 },
  { "op": "include_colour_palette", "palette_id": 7 },
  { "op": "include_position_palette", "palette_id": 2 },
  { "op": "set_intensity", "level": 60 },
  { "op": "record_cue", "cue_id": 11 },
  { "op": "clear_programmer" }
]
```

Note: `clear_programmer` at the start of a subsequent cue within the same sequence is redundant (the prior clear already did it), but including it improves safety and readability.

## Confirming success

Report to the user:
- Group/heads used
- Which palette IDs were included (colour, position, beam)
- Intensity level
- Any hard-coded overrides
- Cue slot recorded
- Programmer cleared

## When to deviate from this workflow

- **One-off specials** (a single unique colour that won't recur): acceptable to hard-code with `set_attribute`
- **Intensity-only cues** (blackout, full on): no palette needed, just `set_intensity` + `record_cue`
- **Updating an existing cue**: use `include_cue` first to load the existing values, make changes, then `record_cue` to overwrite, then `clear_programmer`

## Updating an existing cue

To modify an existing cue rather than building from scratch:
```
clear_programmer
select_group(group)
include_cue(cue_id)          # Load existing values into programmer
set_attribute(attr, value)    # Make changes
record_cue(cue_id)            # Overwrite the cue
clear_programmer
```
