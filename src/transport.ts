import * as dgram from "dgram";
import * as net from "net";

export type TransportMode = "udp" | "tcp";

export interface MagicQConfig {
  ip: string;
  port: number;
  mode: TransportMode;
  commandDelayMs: number;
}

export function getConfig(): MagicQConfig {
  return {
    ip: process.env.MAGICQ_IP ?? "255.255.255.255",
    port: parseInt(process.env.MAGICQ_PORT ?? "6553", 10),
    mode: (process.env.MAGICQ_TRANSPORT ?? "udp") as TransportMode,
    commandDelayMs: parseInt(process.env.MAGICQ_CMD_DELAY_MS ?? "75", 10),
  };
}

function sendUdp(cmd: string, config: MagicQConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket("udp4");
    const buf = Buffer.from(cmd, "ascii");
    client.bind(() => {
      client.setBroadcast(true);
      client.send(buf, config.port, config.ip, (err) => {
        client.close();
        err ? reject(err) : resolve();
      });
    });
    client.on("error", (err) => {
      client.close();
      reject(err);
    });
  });
}

function sendTcp(cmd: string, config: MagicQConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const buf = Buffer.from(cmd, "ascii");
    socket.connect(config.port, config.ip, () => {
      socket.write(buf, (err) => {
        socket.destroy();
        err ? reject(err) : resolve();
      });
    });
    socket.on("error", (err) => {
      socket.destroy();
      reject(err);
    });
  });
}

export async function sendCommand(cmd: string, config: MagicQConfig): Promise<void> {
  if (config.mode === "tcp") {
    await sendTcp(cmd, config);
  } else {
    await sendUdp(cmd, config);
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Send multiple commands sequentially with a delay between each.
export async function sendCommands(cmds: string[], config: MagicQConfig): Promise<void> {
  for (let i = 0; i < cmds.length; i++) {
    await sendCommand(cmds[i], config);
    if (i < cmds.length - 1) {
      await delay(config.commandDelayMs);
    }
  }
}
