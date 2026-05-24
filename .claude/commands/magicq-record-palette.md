# MagicQ: Record a Palette

Use this skill when asked to create or save a colour, position, or beam palette.

Palettes are the foundation of good MagicQ programming. Cues that reference palettes automatically reflect future palette updates. Always create palettes before recording cues that use those colours or positions.

## Palette types

| Type | Records | Tool |
|------|---------|------|
| Colour | Cyan, Magenta, Yellow, Col1/2, ColMix | `record_colour_palette` |
| Position | Pan, Tilt, Focus, Zoom | `record_position_palette` |
| Beam | Gobo, Rotate, Iris, Shutter, Frost | `record_beam_palette` |

## What you need from the user before starting
- Palette type (colour / position / beam)
- Target palette slot ID (1–1024)
- Which heads or group to use
- The attribute values to record

For colour palettes: get CMY or RGB values. Convert RGB → CMY if needed: C = 255−R, M = 255−G, Y = 255−B (scaled 0–255).

For position palettes: get pan and tilt values (0–255 for 8-bit, or 0–65535 for 16-bit).

## Workflow

Execute **in order**:

### 1. Clear the programmer
```
clear_programmer
```

### 2. Select heads
```
select_group(group)
```
or
```
select_heads(start, end)
```

### 3. Set the attributes you want to capture

**For a colour palette** — set the colour attributes:
```
set_attribute(16, cyan_value)    # Cyan   (0–255)
set_attribute(17, magenta_value) # Magenta (0–255)
set_attribute(18, yellow_value)  # Yellow  (0–255)
```
For fixtures with discrete colour wheels, use Col1 (attr 6) or Col2 (attr 7) instead.

**For a position palette** — set pan/tilt (and optionally focus/zoom):
```
set_attribute(4, pan_value)   # Pan  (0–255)
set_attribute(5, tilt_value)  # Tilt (0–255)
```

**For a beam palette** — set gobo, iris, shutter, etc.:
```
set_attribute(8, gobo_value)   # Gobo1
set_attribute(3, iris_value)   # Iris
set_attribute(2, shutter_value) # Shutter
```

### 4. Record the palette
```
record_colour_palette(palette_id)
# or
record_position_palette(palette_id)
# or
record_beam_palette(palette_id)
```

### 5. Clear the programmer
```
clear_programmer
```

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
