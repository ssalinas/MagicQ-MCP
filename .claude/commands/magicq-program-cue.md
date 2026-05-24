# MagicQ: Program a Cue

Use this skill when asked to create, record, or program a cue on MagicQ.

## What you need from the user before starting
- Which heads or group to include
- Target cue slot number (the cue stack must already exist on the console)
- Intensity level
- Colour: ideally a palette ID — if not, ask before writing raw CMY values
- Position: ideally a palette ID — if not, ask before writing raw pan/tilt values
- Any additional attributes (beam, gobo, etc.)

If the user gives you raw colour/position values, ask whether a colour or position palette should be created first. Prefer palettes — they make future edits easier.

## Workflow

Execute these steps **in order**. Do not skip or reorder them.

### 1. Clear the programmer
```
clear_programmer
```
Always start clean, even if you believe the programmer is already empty.

### 2. Select heads
Prefer group selection:
```
select_group(group)
```
If no group is configured, select by range:
```
select_heads(start, end)
```
Heads must be selected before any attribute commands.

### 3. Include palettes (if using palette references)
If colour/position palettes exist for this look, include them now:
```
include_colour_palette(palette_id)
include_position_palette(palette_id)
```
Pause ~100ms between includes (the server handles this automatically).

### 4. Set intensity
```
set_intensity(level)
```

### 5. Set any additional hard-coded attributes
Only if values are NOT covered by an included palette:
```
set_attribute(attr, value)
```
Call `attribute_list` if you need to look up an attribute number.

### 6. Record the cue
```
record_cue(cue_id)
```

### 7. Clear the programmer
```
clear_programmer
```
Never skip this. Leaving values in the programmer overrides live playback output.

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
