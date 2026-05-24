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

### 1. Clear the programmer
```
clear_programmer
```

### 2. Select heads
```
select_group(group)
```

### 3. Include palettes
Include each palette type needed. The order here matters — include palettes **before** setting intensity:
```
include_colour_palette(colour_palette_id)
include_position_palette(position_palette_id)
```
Only include beam palette if beam attributes need to be set:
```
include_beam_palette(beam_palette_id)
```

### 4. Set intensity
```
set_intensity(level)
```
Intensity is set after palette includes because `include_*` calls can overwrite intensity if the palette contains intensity data.

### 5. Hard-code any per-cue overrides (optional)
If this specific cue needs an attribute value that differs from any palette:
```
set_attribute(attr, value)
```
Keep overrides minimal — the goal is to rely on palettes as much as possible.

### 6. Record the cue
```
record_cue(cue_id)
```

### 7. Clear the programmer
```
clear_programmer
```

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
