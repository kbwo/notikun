import { currentPlatform } from "../platform.ts";
import { listSounds, type SoundOption, startPreview, stopPreview } from "../sounds.ts";
import { loadConfig, saveConfig } from "../config.ts";
import { type MenuItem, selectFromMenu } from "../interactive_menu.ts";

const NO_SOUND_LABEL = "サウンドなし (通知音を鳴らさない)";

export async function runSoundCommand(): Promise<void> {
  if (!Deno.stdin.isTerminal()) {
    console.error("notikun sound はインタラクティブな端末(TTY)上でのみ実行できます。");
    Deno.exit(1);
  }

  const platform = currentPlatform();
  const sounds = await listSounds(platform);
  if (sounds.length === 0) {
    console.warn(
      "このOSで利用可能な通知音が見つかりませんでした。「サウンドなし」のみ選択できます。",
    );
  }

  const config = await loadConfig();

  type Choice = SoundOption | null;
  const items: MenuItem<Choice>[] = [
    { label: NO_SOUND_LABEL, value: null },
    ...sounds.map((s) => ({ label: s.name, value: s as Choice })),
  ];

  const currentIndex = config.sound
    ? items.findIndex((i) => i.value !== null && i.value.name === config.sound?.name)
    : 0;

  console.log("矢印キー(↑/↓)で選択、Enterで確定、Ctrl+Cでキャンセルします。");
  console.log("選択中の音はプレビュー再生されます。");

  const selected = await selectFromMenu({
    items,
    initialIndex: currentIndex >= 0 ? currentIndex : 0,
    prompt: "デフォルトの通知音を選択してください:",
    onHighlight: (item) => {
      if (item.value) {
        startPreview(item.value, platform);
      } else {
        stopPreview();
      }
    },
  });

  stopPreview();

  if (selected === null) {
    console.log("キャンセルしました。設定は変更していません。");
    return;
  }

  await saveConfig({ sound: selected.value });

  if (selected.value) {
    console.log(`デフォルトの通知音を「${selected.value.name}」に設定しました。`);
  } else {
    console.log("デフォルトの通知音を「サウンドなし」に設定しました。");
  }
}
