import type { Platform } from "./platform.ts";

export interface SoundOption {
  name: string;
  path: string;
}

const MACOS_SOUND_DIR = "/System/Library/Sounds";

async function listMacSounds(): Promise<SoundOption[]> {
  const options: SoundOption[] = [];
  try {
    for await (const entry of Deno.readDir(MACOS_SOUND_DIR)) {
      if (entry.isFile && entry.name.endsWith(".aiff")) {
        options.push({
          name: entry.name.replace(/\.aiff$/, ""),
          path: `${MACOS_SOUND_DIR}/${entry.name}`,
        });
      }
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }
  options.sort((a, b) => a.name.localeCompare(b.name));
  return options;
}

const LINUX_SOUND_DIRS = [
  "/usr/share/sounds/freedesktop/stereo",
  "/usr/share/sounds/gnome/default/alerts",
];
const LINUX_SOUND_EXTENSIONS = [".oga", ".ogg", ".wav"];

async function listLinuxSounds(): Promise<SoundOption[]> {
  const options: SoundOption[] = [];
  for (const dir of LINUX_SOUND_DIRS) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const ext = LINUX_SOUND_EXTENSIONS.find((e) => entry.name.endsWith(e));
        if (entry.isFile && ext) {
          options.push({
            name: entry.name.slice(0, -ext.length),
            path: `${dir}/${entry.name}`,
          });
        }
      }
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) throw err;
    }
  }
  options.sort((a, b) => a.name.localeCompare(b.name));
  return options;
}

export async function listSounds(platform: Platform): Promise<SoundOption[]> {
  return platform === "macos" ? await listMacSounds() : await listLinuxSounds();
}

export async function commandExists(cmd: string): Promise<boolean> {
  try {
    const command = new Deno.Command("which", {
      args: [cmd],
      stdout: "null",
      stderr: "null",
    });
    const { success } = await command.output();
    return success;
  } catch {
    return false;
  }
}

interface LinuxPlayer {
  cmd: string;
  args: (path: string) => string[];
}

const LINUX_PLAYERS: LinuxPlayer[] = [
  { cmd: "paplay", args: (p) => [p] },
  { cmd: "ogg123", args: (p) => [p] },
  { cmd: "aplay", args: (p) => [p] },
  { cmd: "canberra-gtk-play", args: (p) => ["-f", p] },
];

let cachedLinuxPlayer: LinuxPlayer | null | undefined;

export async function findLinuxPlayer(): Promise<LinuxPlayer | null> {
  if (cachedLinuxPlayer !== undefined) return cachedLinuxPlayer;
  for (const player of LINUX_PLAYERS) {
    if (await commandExists(player.cmd)) {
      cachedLinuxPlayer = player;
      return player;
    }
  }
  cachedLinuxPlayer = null;
  return null;
}

let currentPreview: Deno.ChildProcess | null = null;

export function stopPreview(): void {
  if (currentPreview) {
    try {
      currentPreview.kill();
    } catch {
      // process already exited
    }
    currentPreview = null;
  }
}

export async function startPreview(sound: SoundOption, platform: Platform): Promise<void> {
  stopPreview();
  if (platform === "macos") {
    spawnDetached("afplay", [sound.path]);
    return;
  }
  const player = await findLinuxPlayer();
  if (!player) return;
  spawnDetached(player.cmd, player.args(sound.path));
}

function spawnDetached(cmd: string, args: string[]): void {
  try {
    const command = new Deno.Command(cmd, { args, stdout: "null", stderr: "null" });
    currentPreview = command.spawn();
    currentPreview.status.catch(() => {});
  } catch {
    currentPreview = null;
  }
}
