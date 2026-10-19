import { describe, expect, it } from 'vitest'
import { collapseWhitespace, parseJobText, safeJsonLd } from './job-text'

describe('parseJobText', () => {
  it('returns [] for empty input', () => {
    expect(parseJobText('')).toEqual([])
    expect(parseJobText(null)).toEqual([])
    expect(parseJobText('  \n\n ')).toEqual([])
  })
  it('splits paragraphs on blank lines and keeps single newlines', () => {
    expect(parseJobText('A\nB\n\nC')).toEqual([
      { type: 'paragraph', text: 'A\nB' },
      { type: 'paragraph', text: 'C' },
    ])
  })
  it('groups consecutive "- " and "* " lines into a list', () => {
    expect(parseJobText('Intro\n- one\n* two\n\n- three\r\nTail')).toEqual([
      { type: 'paragraph', text: 'Intro' },
      { type: 'list', items: ['one', 'two'] },
      { type: 'list', items: ['three'] },
      { type: 'paragraph', text: 'Tail' },
    ])
  })
  it('does not treat hyphenated words or bare dashes as bullets', () => {
    expect(parseJobText('-not a bullet\n-')).toEqual([{ type: 'paragraph', text: '-not a bullet\n-' }])
  })
  it('leaves HTML as literal text', () => {
    expect(parseJobText('<b>x</b>')).toEqual([{ type: 'paragraph', text: '<b>x</b>' }])
  })
})

describe('collapseWhitespace', () => {
  it('collapses runs of whitespace', () => {
    expect(collapseWhitespace('  a \n\n b\t c ')).toBe('a b c')
  })
})

describe('safeJsonLd', () => {
  it('escapes script breakout and separators but round-trips', () => {
    const value = { t: '</script><script>alert(1)</script> & \u2028\u2029' }
    const out = safeJsonLd(value)
    expect(out).not.toMatch(/[<>&\u2028\u2029]/)
    expect(out).toContain('\\u003c/script\\u003e')
    expect(JSON.parse(out)).toEqual(value)
  })
})
