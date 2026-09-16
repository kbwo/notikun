import type { Config } from "./config.ts";
import { findLinuxPlayer } from "./sounds.ts";
import type { Platform } from "./platform.ts";

export interface NotifyOptions {
  title: string;
  message: string;
}

export async function sendNotification(
  opts: NotifyOptions,
  config: Config,
  platform: Platform,
): Promise<void> {
  if (platform === "macos") {
    await sendMacNotification(opts, config);
  } else {
    await sendLinuxNotification(opts, config);
  }
}

function escapeAppleScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function sendMacNotification(opts: NotifyOptions, config: Config): Promise<void> {
  const scriptParts = [
    `display notification "${escapeAppleScriptString(opts.message)}"`,
    `with title "${escapeAppleScriptString(opts.title)}"`,
  ];
  if (config.sound) {
    scriptParts.push(`sound name "${escapeAppleScriptString(config.sound.name)}"`);
  }

  const command = new Deno.Command("osascript", {
    args: ["-e", scriptParts.join(" ")],
    stdout: "null",
    stderr: "piped",
  });
  const { success, stderr } = await command.output();
  if (!success) {
    throw new Error(`osascript failed: ${new TextDecoder().decode(stderr).trim()}`);
  }
}

async function sendLinuxNotification(opts: NotifyOptions, config: Config): Promise<void> {
  const command = new Deno.Command("notify-send", {
    args: [opts.title, opts.message],
    stdout: "null",
    stderr: "piped",
  });
  const { success, stderr } = await command.output();
  if (!success) {
    throw new Error(`notify-send failed: ${new TextDecoder().decode(stderr).trim()}`);
  }

  if (config.sound) {
    const player = await findLinuxPlayer();
    if (player) {
      const playCommand = new Deno.Command(player.cmd, {
        args: player.args(config.sound.path),
        stdout: "null",
        stderr: "null",
      });
      await playCommand.output().catch(() => {});
    }
  }
}
