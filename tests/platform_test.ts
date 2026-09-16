import { assert } from "@std/assert";
import { currentPlatform } from "../src/platform.ts";

Deno.test("currentPlatform returns macos or linux on supported OSes", () => {
  if (Deno.build.os !== "darwin" && Deno.build.os !== "linux") {
    return;
  }
  const platform = currentPlatform();
  assert(platform === "macos" || platform === "linux");
});
