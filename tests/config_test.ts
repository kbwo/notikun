import { assertEquals, assertThrows } from "@std/assert";
import { loadConfig, resolveConfigDir, saveConfig } from "../src/config.ts";

Deno.test("resolveConfigDir prefers XDG_CONFIG_HOME when set", () => {
  const dir = resolveConfigDir({ xdgConfigHome: "/custom/config", home: "/home/user" });
  assertEquals(dir, "/custom/config/notikun");
});

Deno.test("resolveConfigDir falls back to HOME/.config when XDG_CONFIG_HOME is unset", () => {
  const dir = resolveConfigDir({ home: "/home/user" });
  assertEquals(dir, "/home/user/.config/notikun");
});

Deno.test("resolveConfigDir throws when neither XDG_CONFIG_HOME nor HOME is set", () => {
  assertThrows(() => resolveConfigDir({}));
});

Deno.test("loadConfig returns the default config when the file does not exist", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const config = await loadConfig(`${dir}/config.json`);
    assertEquals(config, { sound: null });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("saveConfig then loadConfig round-trips the sound setting", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const path = `${dir}/nested/config.json`;
    await saveConfig({ sound: { name: "Ping", path: "/System/Library/Sounds/Ping.aiff" } }, path);
    const loaded = await loadConfig(path);
    assertEquals(loaded, { sound: { name: "Ping", path: "/System/Library/Sounds/Ping.aiff" } });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
