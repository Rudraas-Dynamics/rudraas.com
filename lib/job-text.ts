export type JobTextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

const BULLET = /^\s*[-*]\s+(.*)$/

/**
 * Parse plain text into blocks. Blank lines separate paragraphs; consecutive
 * lines starting with "- " or "* " form a list. Single newlines inside a
 * paragraph are kept (rendered as line breaks by the component).
 */
export function parseJobText(input: string | null | undefined): JobTextBlock[] {
  if (!input) return []
  const lines = input.replace(/\r\n?/g, '\n').split('\n')
  const blocks: JobTextBlock[] = []
  let para: string[] = []
  let list: string[] = []

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'paragraph', text: para.join('\n') })
    para = []
  }
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list })
    list = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.trim() === '') {
      flushPara()
      flushList()
      continue
    }
    const m = BULLET.exec(line)
    if (m && m[1].trim() !== '') {
      flushPara()
      list.push(m[1].trim())
    } else {
      flushList()
      para.push(line.trim())
    }
  }
  flushPara()
  flushList()
  return blocks
}

/** Collapse all whitespace to single spaces (for meta descriptions). */
export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

const LINE_SEP = new RegExp(String.fromCharCode(0x2028), 'g')
const PARA_SEP = new RegExp(String.fromCharCode(0x2029), 'g')

/** Serialize JSON for embedding inside a <script> tag without allowing breakout. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEP, '\\u2028')
    .replace(PARA_SEP, '\\u2029')
}
