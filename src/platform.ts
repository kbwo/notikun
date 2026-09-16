export type Platform = "macos" | "linux";

export function currentPlatform(): Platform {
  switch (Deno.build.os) {
    case "darwin":
      return "macos";
    case "linux":
      return "linux";
    default:
      throw new Error(
        `Unsupported platform: ${Deno.build.os}. notikun only supports macOS and Linux.`,
      );
  }
}
