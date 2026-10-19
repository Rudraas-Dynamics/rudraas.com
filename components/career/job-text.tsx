import { parseJobText } from '@/lib/job-text'

/** Renders plain-text job content as safe React elements (no HTML injection). */
export function JobText({ text }: { text: string | null | undefined }) {
  const blocks = parseJobText(text)
  if (blocks.length === 0) return null
  return (
    <div className="job-prose">
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        ),
      )}
    </div>
  )
}
