# MagicQ: Fixture Preparation

Use this skill when asked to prepare fixtures before programming — locating heads, striking/dousing lamps, or resetting fixtures.

Fixture preparation commands operate through the **programmer**. Always clear the programmer before and after.

## What you need from the user
- Which heads or group to target
- Operation: locate, lamp on, lamp off, or reset

## Operations

### Locate heads (reset to default)
Sets all attributes to their default "locate" values — full intensity, open white, centre pan/tilt. Useful to start programming from a known state.

```
clear_programmer
select_group(group)         # or select_heads(start, end)
locate_heads()
clear_programmer
```

### Lamp on (strike the arc lamp)
Only relevant for fixtures with discharge arc lamps (movers). LED fixtures ignore this.

```
clear_programmer
select_group(group)
lamp_on()
clear_programmer
```

### Lamp off (douse the arc lamp)
```
clear_programmer
select_group(group)
lamp_off()
clear_programmer
```

### Reset fixtures
Sends a reset command to the fixture — useful if a fixture has glitched or stuck.

```
clear_programmer
select_group(group)
reset_heads()
clear_programmer
```

## Notes

- Locate is commonly used at the start of a programming session to bring all fixtures to a consistent, visible state before building looks
- Lamp on/off applies only to discharge lamp fixtures (arc-based movers). LED fixtures do not respond
- Reset causes the fixture to run its reset routine — it will be unresponsive for several seconds while it resets
- Always clear the programmer after fixture preparation before starting cue programming, to avoid intensity/attribute bleed
