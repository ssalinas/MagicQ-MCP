#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfig, sendCommand, sendCommands } from "./transport.js";
import { ATTR } from "./attributes.js";

const config = getConfig();
const server = new McpServer({ name: "magicq", version: "0.1.0" });

// ── Helpers ──────────────────────────────────────────────────────────────────

function ok(msg: string) {
  return { content: [{ type: "text" as const, text: msg }] };
}

// ── Playback control tools ────────────────────────────────────────────────────

server.tool(
  "activate_playback",
  "Activate a playback (fader goes live). Optionally set the level (0–100) at the same time.",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number (1–202; 1–10 on PC/Mac without hardware)"),
    level: z.number().int().min(0).max(100).optional().describe("Fader level 0–100 (optional)"),
  },
  async ({ playback, level }) => {
    if (level !== undefined) {
      await sendCommands([`${playback}A`, `${playback},${level}L`], config);
    } else {
      await sendCommand(`${playback}A`, config);
    }
    return ok(`Activated PB${playback}${level !== undefined ? ` at ${level}%` : ""}`);
  }
);

server.tool(
  "release_playback",
  "Release (deactivate) a playback.",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
  },
  async ({ playback }) => {
    await sendCommand(`${playback}R`, config);
    return ok(`Released PB${playback}`);
  }
);

server.tool(
  "go_playback",
  "Send a Go (step forward) to a playback, advancing to the next cue in the stack.",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
  },
  async ({ playback }) => {
    await sendCommand(`${playback}G`, config);
    return ok(`Go on PB${playback}`);
  }
);

server.tool(
  "stop_playback",
  "Stop/go-back on a playback.",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
  },
  async ({ playback }) => {
    await sendCommand(`${playback}S`, config);
    return ok(`Stop on PB${playback}`);
  }
);

server.tool(
  "set_playback_level",
  "Set the fader level of a playback (0–100).",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
    level: z.number().int().min(0).max(100).describe("Fader level 0–100"),
  },
  async ({ playback, level }) => {
    await sendCommand(`${playback},${level}L`, config);
    return ok(`PB${playback} level → ${level}%`);
  }
);

server.tool(
  "jump_to_cue",
  "Jump to a specific cue on a playback. cue_id is the integer part, cue_id_dec is the decimal part (e.g. cue 2.5 → cue_id=2, cue_id_dec=50).",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
    cue_id: z.number().int().min(1).max(65536).describe("Cue ID integer part"),
    cue_id_dec: z.number().int().min(0).max(99).default(0).describe("Cue ID decimal part (0 for whole cues)"),
  },
  async ({ playback, cue_id, cue_id_dec }) => {
    await sendCommand(`${playback},${cue_id},${cue_id_dec}J`, config);
    return ok(`PB${playback} jumped to cue ${cue_id}.${cue_id_dec.toString().padStart(2, "0")}`);
  }
);

server.tool(
  "change_page",
  "Change the active playback page on the console.",
  {
    page: z.number().int().min(1).describe("Page number"),
  },
  async ({ page }) => {
    await sendCommand(`${page}P`, config);
    return ok(`Changed to page ${page}`);
  }
);

server.tool(
  "test_playback",
  "Activate a playback at 100% (test mode).",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
  },
  async ({ playback }) => {
    await sendCommand(`${playback}T`, config);
    return ok(`Testing PB${playback} at 100%`);
  }
);

server.tool(
  "untest_playback",
  "Release a playback from test mode (back to 0%).",
  {
    playback: z.number().int().min(1).max(202).describe("Playback number"),
  },
  async ({ playback }) => {
    await sendCommand(`${playback}U`, config);
    return ok(`Un-tested PB${playback}`);
  }
);

// ── Direct DMX ───────────────────────────────────────────────────────────────

server.tool(
  "set_channel",
  "Set a DMX channel intensity directly (bypasses programmer).",
  {
    channel: z.number().int().min(1).max(32768).describe("DMX channel number"),
    level: z.number().int().min(0).max(100).describe("Level 0–100"),
  },
  async ({ channel, level }) => {
    await sendCommand(`${channel},${level}I`, config);
    return ok(`DMX channel ${channel} → ${level}%`);
  }
);

// ── Programmer tools ──────────────────────────────────────────────────────────

server.tool(
  "select_heads",
  "Select one or a range of fixture heads in the programmer.",
  {
    start: z.number().int().min(1).max(6145).describe("First head number"),
    end: z.number().int().min(1).max(6145).optional().describe("Last head number (omit for single head)"),
  },
  async ({ start, end }) => {
    const cmd = end !== undefined ? `1,${start},${end}H` : `1,${start}H`;
    await sendCommand(cmd, config);
    return ok(`Selected head${end !== undefined ? `s ${start}–${end}` : ` ${start}`}`);
  }
);

server.tool(
  "deselect_heads",
  "Deselect one or a range of fixture heads.",
  {
    start: z.number().int().min(1).max(6145).describe("First head number"),
    end: z.number().int().min(1).max(6145).optional().describe("Last head number (omit for single head)"),
  },
  async ({ start, end }) => {
    const cmd = end !== undefined ? `2,${start},${end}H` : `2,${start}H`;
    await sendCommand(cmd, config);
    return ok(`Deselected head${end !== undefined ? `s ${start}–${end}` : ` ${start}`}`);
  }
);

server.tool(
  "deselect_all_heads",
  "Deselect all fixture heads.",
  {},
  async () => {
    await sendCommand("3H", config);
    return ok("Deselected all heads");
  }
);

server.tool(
  "select_group",
  "Select a fixture group by number.",
  {
    group: z.number().int().min(1).max(200).describe("Group number (1–200)"),
  },
  async ({ group }) => {
    await sendCommand(`4,${group}H`, config);
    return ok(`Selected group ${group}`);
  }
);

server.tool(
  "set_intensity",
  "Set the intensity of currently selected heads.",
  {
    level: z.number().int().min(0).max(100).describe("Intensity level 0–100"),
    fade_time: z.number().int().min(0).optional().describe("Fade time in seconds (optional)"),
  },
  async ({ level, fade_time }) => {
    const cmd = fade_time !== undefined ? `5,${level},${fade_time}H` : `5,${level}H`;
    await sendCommand(cmd, config);
    return ok(`Intensity → ${level}%${fade_time !== undefined ? ` over ${fade_time}s` : ""}`);
  }
);

server.tool(
  "set_attribute",
  "Set an attribute value on currently selected heads. Use the attribute number (see attribute_list tool for reference).",
  {
    attr: z.number().int().min(0).max(51).describe("Attribute number"),
    value: z.number().int().min(0).max(65535).describe("Attribute value"),
    fade_time: z.number().int().min(0).optional().describe("Fade time in seconds (optional)"),
  },
  async ({ attr, value, fade_time }) => {
    const cmd = fade_time !== undefined ? `6,${attr},${value},${fade_time}H` : `6,${attr},${value}H`;
    await sendCommand(cmd, config);
    return ok(`Attribute ${attr} → ${value}${fade_time !== undefined ? ` over ${fade_time}s` : ""}`);
  }
);

server.tool(
  "increment_attribute",
  "Increment an attribute on currently selected heads.",
  {
    attr: z.number().int().min(0).max(51).describe("Attribute number"),
    value: z.number().int().min(0).max(65535).describe("Amount to increment"),
    sixteen_bit: z.boolean().default(false).describe("Use 16-bit resolution (default false = 8-bit)"),
  },
  async ({ attr, value, sixteen_bit }) => {
    await sendCommand(`7,${attr},${value},${sixteen_bit ? 1 : 0}H`, config);
    return ok(`Attribute ${attr} incremented by ${value}`);
  }
);

server.tool(
  "decrement_attribute",
  "Decrement an attribute on currently selected heads.",
  {
    attr: z.number().int().min(0).max(51).describe("Attribute number"),
    value: z.number().int().min(0).max(65535).describe("Amount to decrement"),
    sixteen_bit: z.boolean().default(false).describe("Use 16-bit resolution (default false = 8-bit)"),
  },
  async ({ attr, value, sixteen_bit }) => {
    await sendCommand(`8,${attr},${value},${sixteen_bit ? 1 : 0}H`, config);
    return ok(`Attribute ${attr} decremented by ${value}`);
  }
);

server.tool(
  "clear_programmer",
  "Clear the programmer (remove all unsaved changes from the edit buffer). Always call this before and after building a look.",
  {},
  async () => {
    await sendCommand("9H", config);
    return ok("Programmer cleared");
  }
);

server.tool(
  "include_position_palette",
  "Include a position palette into the programmer.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Position palette ID"),
  },
  async ({ palette_id }) => {
    await sendCommand(`10,${palette_id}H`, config);
    return ok(`Included position palette ${palette_id}`);
  }
);

server.tool(
  "include_colour_palette",
  "Include a colour palette into the programmer.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Colour palette ID"),
  },
  async ({ palette_id }) => {
    await sendCommand(`11,${palette_id}H`, config);
    return ok(`Included colour palette ${palette_id}`);
  }
);

server.tool(
  "include_beam_palette",
  "Include a beam palette into the programmer.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Beam palette ID"),
  },
  async ({ palette_id }) => {
    await sendCommand(`12,${palette_id}H`, config);
    return ok(`Included beam palette ${palette_id}`);
  }
);

server.tool(
  "include_cue",
  "Include a cue into the programmer (load its values into the edit buffer).",
  {
    cue_id: z.number().int().min(1).max(5000).describe("Cue ID"),
  },
  async ({ cue_id }) => {
    await sendCommand(`13,${cue_id}H`, config);
    return ok(`Included cue ${cue_id} into programmer`);
  }
);

server.tool(
  "update",
  "Save programmer values back to their source cues/palettes (update in place).",
  {},
  async () => {
    await sendCommand("19H", config);
    return ok("Updated — programmer values saved back to source");
  }
);

server.tool(
  "record_position_palette",
  "Record the current programmer values as a position palette.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Position palette ID to record into"),
  },
  async ({ palette_id }) => {
    await sendCommand(`20,${palette_id}H`, config);
    return ok(`Recorded position palette ${palette_id}`);
  }
);

server.tool(
  "record_colour_palette",
  "Record the current programmer values as a colour palette.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Colour palette ID to record into"),
  },
  async ({ palette_id }) => {
    await sendCommand(`21,${palette_id}H`, config);
    return ok(`Recorded colour palette ${palette_id}`);
  }
);

server.tool(
  "record_beam_palette",
  "Record the current programmer values as a beam palette.",
  {
    palette_id: z.number().int().min(1).max(1024).describe("Beam palette ID to record into"),
  },
  async ({ palette_id }) => {
    await sendCommand(`22,${palette_id}H`, config);
    return ok(`Recorded beam palette ${palette_id}`);
  }
);

server.tool(
  "record_cue",
  "Record the current programmer contents as a cue. The cue stack must already exist on the console.",
  {
    cue_id: z.number().int().min(1).max(5000).describe("Cue ID to record into"),
  },
  async ({ cue_id }) => {
    await sendCommand(`23,${cue_id}H`, config);
    return ok(`Recorded cue ${cue_id}`);
  }
);

server.tool(
  "next_head",
  "Select the next head (cycle through selected heads).",
  {},
  async () => {
    await sendCommand("30H", config);
    return ok("Next head selected");
  }
);

server.tool(
  "prev_head",
  "Select the previous head (cycle through selected heads).",
  {},
  async () => {
    await sendCommand("31H", config);
    return ok("Previous head selected");
  }
);

server.tool(
  "all_heads",
  "Select all heads (within current selection).",
  {},
  async () => {
    await sendCommand("32H", config);
    return ok("All heads selected");
  }
);

server.tool(
  "locate_heads",
  "Locate selected heads (reset to default position/attributes).",
  {},
  async () => {
    await sendCommand("40H", config);
    return ok("Heads located");
  }
);

server.tool(
  "lamp_on",
  "Strike the lamp on selected heads.",
  {},
  async () => {
    await sendCommand("41H", config);
    return ok("Lamp on sent to selected heads");
  }
);

server.tool(
  "lamp_off",
  "Douse the lamp on selected heads.",
  {},
  async () => {
    await sendCommand("42H", config);
    return ok("Lamp off sent to selected heads");
  }
);

server.tool(
  "reset_heads",
  "Reset selected heads.",
  {},
  async () => {
    await sendCommand("43H", config);
    return ok("Reset sent to selected heads");
  }
);

// ── High-level composite tools ────────────────────────────────────────────────

server.tool(
  "program_look",
  "Build and record a complete lighting look in one call. Selects heads, sets intensity and any attributes, records a cue, then clears the programmer. Attributes is a map of attribute_number → value.",
  {
    heads_start: z.number().int().min(1).max(6145).describe("First head number"),
    heads_end: z.number().int().min(1).max(6145).optional().describe("Last head number (omit for single head)"),
    intensity: z.number().int().min(0).max(100).describe("Intensity level 0–100"),
    attributes: z.record(z.string(), z.number().int()).optional().describe(
      "Map of attribute number (as string key) to value, e.g. {\"16\": 0, \"17\": 0, \"18\": 255}"
    ),
    cue_id: z.number().int().min(1).max(5000).describe("Cue ID to record into"),
  },
  async ({ heads_start, heads_end, intensity, attributes, cue_id }) => {
    const cmds: string[] = [];

    // Select heads
    cmds.push(heads_end !== undefined ? `1,${heads_start},${heads_end}H` : `1,${heads_start}H`);
    // Set intensity
    cmds.push(`5,${intensity}H`);
    // Set each attribute
    if (attributes) {
      for (const [attrStr, value] of Object.entries(attributes)) {
        cmds.push(`6,${attrStr},${value}H`);
      }
    }
    // Record cue
    cmds.push(`23,${cue_id}H`);
    // Clear programmer
    cmds.push("9H");

    await sendCommands(cmds, config);

    const headRange = heads_end !== undefined ? `${heads_start}–${heads_end}` : `${heads_start}`;
    const attrCount = attributes ? Object.keys(attributes).length : 0;
    return ok(
      `Programmed look: heads ${headRange}, intensity ${intensity}%, ${attrCount} attribute(s) set → recorded as cue ${cue_id}, programmer cleared`
    );
  }
);

server.tool(
  "send_raw_command",
  "Send a raw CREP command string directly to MagicQ. Use this for commands not covered by other tools.",
  {
    command: z.string().min(1).describe("Raw ASCII CREP command string, e.g. \"1A\" or \"23,10H\""),
  },
  async ({ command }) => {
    await sendCommand(command, config);
    return ok(`Sent: ${command}`);
  }
);

// ── Reference resource ────────────────────────────────────────────────────────

server.tool(
  "attribute_list",
  "Return the full list of MagicQ attribute numbers and their names for use with set_attribute, increment_attribute, etc.",
  {},
  async () => {
    const rows = Object.entries(ATTR)
      .map(([name, num]) => `  ${String(num).padStart(2, " ")}  ${name}`)
      .join("\n");
    return ok(`MagicQ attribute numbers:\n\n${rows}`);
  }
);

// ── Start server ──────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
