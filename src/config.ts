import { dirname, join } from "@std/path";

export interface SoundConfig {
  name: string;
  path: string;
}

export interface Config {
  sound: SoundConfig | null;
}

const DEFAULT_CONFIG: Config = { sound: null };

interface HomeEnv {
  xdgConfigHome?: string;
  home?: string;
}

export function resolveConfigDir(env: HomeEnv): string {
  if (env.xdgConfigHome && env.xdgConfigHome.length > 0) {
    return join(env.xdgConfigHome, "notikun");
  }
  if (!env.home) {
    throw new Error(
      "Cannot resolve config directory: neither XDG_CONFIG_HOME nor HOME is set.",
    );
  }
  return join(env.home, ".config", "notikun");
}

export function getConfigDir(): string {
  return resolveConfigDir({
    xdgConfigHome: Deno.env.get("XDG_CONFIG_HOME") ?? undefined,
    home: Deno.env.get("HOME") ?? undefined,
  });
}

export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export async function loadConfig(path: string = getConfigPath()): Promise<Config> {
  try {
    const text = await Deno.readTextFile(path);
    const parsed = JSON.parse(text);
    return {
      sound: parsed?.sound ?? null,
    };
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { ...DEFAULT_CONFIG };
    }
    throw err;
  }
}

export async function saveConfig(
  config: Config,
  path: string = getConfigPath(),
): Promise<void> {
  await Deno.mkdir(dirname(path), { recursive: true });
  await Deno.writeTextFile(path, JSON.stringify(config, null, 2) + "\n");
}
