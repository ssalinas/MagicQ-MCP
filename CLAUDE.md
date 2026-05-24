# MagicQ MCP Server

This repo is an MCP server for controlling ChamSys MagicQ lighting consoles via the CREP protocol over UDP or TCP.

## Critical Domain Knowledge

### Programmer State — Always Clear Before and After

The MagicQ programmer is a **shared, stateful edit buffer**. It is not scoped to a single operation — values accumulate until explicitly cleared.

Rules:
- **Always `clear_programmer` before starting any programming sequence** — stale values from a previous edit will bleed into the new look
- **Always `clear_programmer` after recording** — leaving values in the programmer causes them to override playback output, making the show look wrong
- The only exception: intentionally layering multiple elements (e.g. include a cue, then add attributes on top) — still clear when done

### Palette-First Programming

Raw attribute values written directly into cues are "hard-coded" and never change. Cues that **reference palettes** automatically update when the palette is updated — this is the professional MagicQ workflow.

**Preferred approach:**
1. Record a colour palette for each colour needed (`record_colour_palette`)
2. Record a position palette for each position needed (`record_position_palette`)
3. Build cues by including those palettes + setting intensity — not by writing raw CMY/pan/tilt values

Only write raw attribute values into a cue when a unique value is needed that doesn't belong in any palette.

### Programming Order (Mandatory)

When building a look, this order is required — MagicQ ignores attributes set before heads are selected:

1. `clear_programmer` — always start clean
2. `select_group` or `select_heads` — **must come before any attribute changes**
3. `include_colour_palette` / `include_position_palette` — if using palette references
4. `set_intensity` — set level on selected heads
5. `set_attribute` — any hard-coded overrides needed beyond palettes
6. `record_cue` — write to cue slot
7. `clear_programmer` — always clean up

Never set attributes before selecting heads. Never skip the trailing clear.

### Head Selection — Prefer Groups

Use `select_group` over `select_heads` whenever the console has groups configured. Groups map to how the operator and designer think about the rig, and are more maintainable. Use `select_heads` with a range only for ad-hoc or one-off selections.

### Playback vs Programmer

Playback commands (`activate_playback`, `go_playback`, `set_playback_level`, etc.) are **independent of the programmer**. They affect live output directly and can be used freely without clearing. The programmer only matters for cue/palette recording.

### Cue Stacks Must Pre-Exist

The remote API cannot create or name cue stacks. Before recording a cue, confirm the target cue stack already exists on the console. Remote programming can only record *into* existing slots.

### PC/Mac Limitation

MagicQ PC/Mac without a hardware wing only supports playbacks 1–10. Full consoles support all 202.

### Command Delay

When sending multiple chained programmer commands, the server automatically inserts a 75ms delay between them (configurable via `MAGICQ_CMD_DELAY_MS`). Don't try to work around this — MagicQ needs time to process each command.

## Tools at a Glance

| Category | Key Tools |
|----------|-----------|
| Playback | `activate_playback`, `release_playback`, `go_playback`, `stop_playback`, `set_playback_level`, `jump_to_cue`, `change_page` |
| Programmer | `select_group`, `select_heads`, `set_intensity`, `set_attribute`, `clear_programmer` |
| Record | `record_cue`, `record_colour_palette`, `record_position_palette`, `record_beam_palette` |
| Include | `include_cue`, `include_colour_palette`, `include_position_palette`, `include_beam_palette` |
| Fixture | `locate_heads`, `lamp_on`, `lamp_off`, `reset_heads` |
| Reference | `attribute_list` (prints all attribute numbers) |
| Escape hatch | `send_raw_command` |
