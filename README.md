# notikun

macOS / Linux 向けのローカルプッシュ通知 CLI ([Deno](https://deno.com/) 製)。

- `notikun send` でタイトルとメッセージを指定して通知を送信する
- `notikun sound` でデフォルトの通知音をインタラクティブに選択・プレビュー再生し、設定として保存する

## インストール

[Releases](https://github.com/kbwo/notikun/releases) から自分の環境に合ったバイナリをダウンロードする。

```sh
# 例: macOS (Apple Silicon)
curl -fsSL -o notikun https://github.com/kbwo/notikun/releases/latest/download/notikun-macos-arm64
chmod +x notikun
sudo mv notikun /usr/local/bin/notikun
```

環境に応じて以下のいずれかのファイル名を選ぶ。

| OS / アーキテクチャ | ファイル名 |
| --- | --- |
| macOS (Apple Silicon / arm64) | `notikun-macos-arm64` |
| macOS (Intel / x86_64) | `notikun-macos-x86_64` |
| Linux (arm64) | `notikun-linux-arm64` |
| Linux (x86_64) | `notikun-linux-x86_64` |

macOS では初回起動時に Gatekeeper の警告が出ることがある。その場合は `xattr -d com.apple.quarantine notikun` を実行してから再度実行する。

[Deno](https://deno.com/) がインストール済みであれば、ソースから直接ビルドすることもできる。

```sh
git clone https://github.com/kbwo/notikun.git
cd notikun
deno task compile
```

## 使い方

```sh
# 通知を送信する
notikun send --title "タイトル" --message "メッセージ"

# デフォルトの通知音をインタラクティブに設定する
notikun sound
```

## 依存コマンド

- macOS: `osascript` (通知表示・再生とも標準搭載)
- Linux: `notify-send` (通知表示。多くのディストリで `libnotify-bin` などに含まれる)。通知音の再生には `paplay` / `ogg123` / `aplay` / `canberra-gtk-play` のいずれかが必要

## 設定ファイル

デフォルトの通知音は `$XDG_CONFIG_HOME/notikun/config.json` (未設定時は `~/.config/notikun/config.json`) に保存される。

## 開発

```sh
deno task test    # テスト実行
deno task check   # 型チェック
deno task lint    # lint
deno task fmt     # フォーマット
deno task compile # スタンドアロンバイナリをビルド
```

## ライセンス

[MIT](./LICENSE)
