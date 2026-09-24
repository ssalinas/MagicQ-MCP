# MagicQ: Show Playback Control

Use this skill when running or operating a show — activating/releasing playbacks, stepping through cues, changing pages, and managing fader levels.

Playback commands operate **independently of the programmer**. You do not need to clear the programmer before using them.

## Core concepts

- **Playback**: a fader slot on the console (1–202; 1–10 on PC/Mac without hardware)
- **Page**: a bank of playbacks — changing page swaps all inactive playbacks to a new set of cue stacks
- **Go**: step forward through a cue stack's cues
- **Cue stack**: a sequence of cues on a single playback — must be pre-created on the console

## Common operations

### Activate a playback
```
activate_playback(playback)
activate_playback(playback, level)   # activate at a specific level
```

### Release (deactivate) a playback
```
release_playback(playback)
```

### Step through cues (Go)
```
go_playback(playback)   # advance to next cue
```

### Go back / stop
```
stop_playback(playback)   # stop or step back depending on cue stack settings
```

### Jump to a specific cue
```
jump_to_cue(playback, cue_id, cue_id_dec)
# Example: cue 3.5 → jump_to_cue(1, 3, 50)
# cue_id_dec: 0 for whole cues, 50 for .5, 25 for .25
```

### Set fader level without activating
```
set_playback_level(playback, level)   # 0–100
```

### Change page
```
change_page(page)
```
Only inactive playbacks change to the new page. Active playbacks stay on their current cue stack until released.

### Test a playback (snap to 100% temporarily)
```
test_playback(playback)
untest_playback(playback)   # release back to 0%
```

## Show operation patterns

### Scene transition (crossfade between two playbacks)
```
activate_playback(next_pb, 0)      # bring up next scene at 0
set_playback_level(next_pb, 100)   # fade up (MagicQ handles the crossfade time)
release_playback(prev_pb)          # release previous scene
```

### Running a cue stack step by step
```
activate_playback(playback)   # activate and wait at first cue
go_playback(playback)          # advance on each GO call
```

### Checking a playback without affecting the show
```
test_playback(playback)      # snap to 100%
untest_playback(playback)    # snap back off
```

### Multi-playback looks (layering)
Multiple playbacks can be active simultaneously. Higher priority playbacks (typically higher-numbered) override lower ones on a per-attribute basis. Activate all needed playbacks, set their levels independently.

## Safety notes

- `release_playback` immediately removes that playback's output (at the speed set on the cue stack). Warn the user if releasing could cause a visible snap.
- `change_page` only affects **inactive** playbacks — safe to call mid-show.
- `jump_to_cue` takes effect immediately — use with caution during a live performance.
- There is no undo for playback commands — confirm before jumping cues during a live show if the user hasn't explicitly asked.

## PC/Mac limitation

Only playbacks 1–10 are available without a MagicQ Wing or Interface attached.
