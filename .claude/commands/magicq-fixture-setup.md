# MagicQ: Fixture Preparation

Use this skill when asked to prepare fixtures before programming — locating heads, striking/dousing lamps, or resetting fixtures.

Fixture preparation commands operate through the **programmer**. Always clear the programmer before and after.

## What you need from the user
- Which heads or group to target
- Operation: locate, lamp on, lamp off, or reset

## Operations

Use `run_sequence` to execute fixture preparation in a single tool call.

### Locate heads (reset to default)
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "locate_heads" },
  { "op": "clear_programmer" }
]
```

### Lamp on
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "lamp_on" },
  { "op": "clear_programmer" }
]
```

### Lamp off
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "lamp_off" },
  { "op": "clear_programmer" }
]
```

### Reset fixtures
```json
[
  { "op": "clear_programmer" },
  { "op": "select_group", "group": 1 },
  { "op": "reset_heads" },
  { "op": "clear_programmer" }
]
```

## Notes

- Locate is commonly used at the start of a programming session to bring all fixtures to a consistent, visible state before building looks
- Lamp on/off applies only to discharge lamp fixtures (arc-based movers). LED fixtures do not respond
- Reset causes the fixture to run its reset routine — it will be unresponsive for several seconds while it resets
- Always clear the programmer after fixture preparation before starting cue programming, to avoid intensity/attribute bleed
