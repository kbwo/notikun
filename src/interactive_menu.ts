export interface MenuItem<T> {
  label: string;
  value: T;
}

export interface SelectMenuOptions<T> {
  items: MenuItem<T>[];
  initialIndex?: number;
  prompt?: string;
  onHighlight?: (item: MenuItem<T>, index: number) => void;
}

const ESC = "\x1b";
const CTRL_C = 3;
const ENTER = 13;
const NEWLINE = 10;

/**
 * Renders a keyboard-navigable single-select menu on the current TTY and
 * resolves with the chosen item, or null if the user cancelled (Ctrl+C).
 */
export async function selectFromMenu<T>(
  opts: SelectMenuOptions<T>,
): Promise<MenuItem<T> | null> {
  const { items } = opts;
  if (items.length === 0) {
    throw new Error("selectFromMenu requires at least one item");
  }

  let index = clampIndex(opts.initialIndex ?? 0, items.length);
  const encoder = new TextEncoder();

  const renderedLineCount = (opts.prompt ? 1 : 0) + items.length;

  const render = (isFirst: boolean) => {
    const lines: string[] = [];
    if (opts.prompt) lines.push(opts.prompt);
    for (const [i, item] of items.entries()) {
      const marker = i === index ? "> " : "  ";
      lines.push(`${marker}${item.label}`);
    }
    let out = "";
    if (!isFirst) {
      out += `${ESC}[${renderedLineCount}A`;
    }
    out += lines.map((l) => `${ESC}[2K${l}`).join("\n") + "\n";
    Deno.stdout.writeSync(encoder.encode(out));
  };

  render(true);
  opts.onHighlight?.(items[index], index);

  Deno.stdin.setRaw(true);
  const buf = new Uint8Array(8);
  try {
    while (true) {
      const n = await Deno.stdin.read(buf);
      if (n === null) return null;
      const chunk = buf.subarray(0, n);

      if (chunk.length === 1 && chunk[0] === CTRL_C) {
        return null;
      }
      if (chunk.length === 1 && (chunk[0] === ENTER || chunk[0] === NEWLINE)) {
        return items[index];
      }
      if (chunk.length >= 3 && chunk[0] === 27 && chunk[1] === 91) {
        if (chunk[2] === 65) {
          index = clampIndex(index - 1, items.length, true);
          render(false);
          opts.onHighlight?.(items[index], index);
        } else if (chunk[2] === 66) {
          index = clampIndex(index + 1, items.length, true);
          render(false);
          opts.onHighlight?.(items[index], index);
        }
      }
    }
  } finally {
    Deno.stdin.setRaw(false);
  }
}

function clampIndex(index: number, length: number, wrap = false): number {
  if (!wrap) {
    return Math.min(Math.max(index, 0), length - 1);
  }
  return ((index % length) + length) % length;
}
