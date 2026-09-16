import { parseArgs } from "@std/cli/parse-args";
import { currentPlatform } from "../platform.ts";
import { loadConfig } from "../config.ts";
import { sendNotification } from "../notify.ts";

const USAGE = "使い方: notikun send --title <タイトル> --message <メッセージ>";

export async function runSendCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args, {
    string: ["title", "message"],
    alias: { title: "t", message: "m" },
  });

  const title = parsed.title;
  const message = parsed.message;

  if (!title || !message) {
    console.error(USAGE);
    Deno.exit(1);
  }

  const platform = currentPlatform();
  const config = await loadConfig();

  await sendNotification({ title, message }, config, platform);
}
