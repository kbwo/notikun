import { runSendCommand } from "./commands/send.ts";
import { runSoundCommand } from "./commands/sound.ts";

function printHelp(): void {
  console.log(`notikun - macOS/Linux 向けローカルプッシュ通知 CLI

使い方:
  notikun send --title <タイトル> --message <メッセージ>   通知を送信する
  notikun sound                                          デフォルトの通知音をインタラクティブに設定する
  notikun --help                                         このヘルプを表示する
`);
}

async function main(): Promise<void> {
  const [subcommand, ...rest] = Deno.args;

  switch (subcommand) {
    case "send":
      await runSendCommand(rest);
      break;
    case "sound":
      await runSoundCommand();
      break;
    case undefined:
    case "-h":
    case "--help":
      printHelp();
      break;
    default:
      console.error(`不明なサブコマンドです: ${subcommand}`);
      printHelp();
      Deno.exit(1);
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    Deno.exit(1);
  }
}
