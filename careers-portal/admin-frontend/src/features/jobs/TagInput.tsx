import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ value, onChange, placeholder, disabled }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commitDraft() {
    const tag = draft.trim().replace(/,+$/, '')
    if (tag.length === 0) {
      setDraft('')
      return
    }
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
      return
    }
    if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-sm',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          {!disabled ? (
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((existing) => existing !== tag))}
              className="rounded-sm hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </span>
      ))}
      {!disabled ? (
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : undefined}
          disabled={disabled}
          className="h-6 flex-1 min-w-[8rem] border-0 p-0 shadow-none focus-visible:ring-0"
        />
      ) : null}
    </div>
  )
}
