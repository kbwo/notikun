# notikun

macOS / Linux 向けローカルプッシュ通知 CLI([Deno](https://deno.com/)製)。個人利用目的のツール。

- `notikun send --title <タイトル> --message <メッセージ>` で通知を送信
- `notikun sound` でデフォルトの通知音をインタラクティブに設定

## インストール

[Releases](https://github.com/kbwo/notikun/releases) から環境に合うバイナリを取得。

```sh
curl -fsSL -o notikun https://github.com/kbwo/notikun/releases/latest/download/notikun-macos-arm64
chmod +x notikun
sudo mv notikun /usr/local/bin/notikun
```

| OS / アーキテクチャ | ファイル名 |
| --- | --- |
| macOS arm64 | `notikun-macos-arm64` |
| macOS x86_64 | `notikun-macos-x86_64` |
| Linux arm64 | `notikun-linux-arm64` |
| Linux x86_64 | `notikun-linux-x86_64` |

macOSでGatekeeperに止められたら `xattr -d com.apple.quarantine notikun`。

## 依存コマンド

- macOS: `osascript`
- Linux: `notify-send`(通知)、`paplay`/`ogg123`/`aplay`/`canberra-gtk-play`のいずれか(通知音再生)

## 設定ファイル

`$XDG_CONFIG_HOME/notikun/config.json`(未設定時 `~/.config/notikun/config.json`)

## 開発

```sh
deno task test
deno task compile
```

## ライセンス

[MIT](./LICENSE)
