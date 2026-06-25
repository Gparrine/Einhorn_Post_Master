import { useEffect, useMemo, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { ALL_EMOJIS, EMOJI_CATEGORIES, FAVORITE_EMOJIS } from '../data/emojis'

interface EmojiPickerProps {
  editor: Editor
}

interface EmojiSection {
  id: string
  name: string
  emojis: string[]
}

export default function EmojiPicker({ editor }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const sections = useMemo(() => buildSections(query), [query])

  useEffect(() => {
    if (!open) return

    searchRef.current?.focus()

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setOpen(false)
    setQuery('')
  }

  const toggleOpen = () => {
    setOpen((current) => {
      if (current) setQuery('')
      return !current
    })
  }

  return (
    <div className="emoji-picker" ref={containerRef}>
      <button
        type="button"
        className={`toolbar-btn emoji-picker-trigger ${open ? 'active' : ''}`}
        onClick={toggleOpen}
        title="Insert emoji"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="emoji-picker-trigger-icon" aria-hidden="true">
          🦄
        </span>
      </button>

      {open && (
        <div className="emoji-picker-panel" role="dialog" aria-label="Emoji picker">
          <div className="emoji-picker-search-wrap">
            <input
              ref={searchRef}
              type="search"
              className="emoji-picker-search"
              placeholder="Search emojis…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search emojis"
            />
          </div>

          <div className="emoji-picker-body">
            {sections.length === 0 ? (
              <p className="emoji-picker-empty">No emojis match your search.</p>
            ) : (
              sections.map((section) => (
                <section key={section.id} className="emoji-picker-section">
                  <h3 className="emoji-picker-section-title">{section.name}</h3>
                  <div className="emoji-picker-grid" role="listbox" aria-label={section.name}>
                    {section.emojis.map((emoji) => (
                      <button
                        key={`${section.id}-${emoji}`}
                        type="button"
                        className="emoji-picker-item"
                        onClick={() => insertEmoji(emoji)}
                        title={emoji}
                        aria-label={`Insert ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function buildSections(query: string): EmojiSection[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return [
      { id: 'favorites', name: 'Favorites', emojis: [...FAVORITE_EMOJIS] },
      ...EMOJI_CATEGORIES,
    ]
  }

  const categoryMatches = EMOJI_CATEGORIES.filter(
    (category) =>
      category.name.toLowerCase().includes(normalizedQuery) ||
      category.id.includes(normalizedQuery),
  )

  if (categoryMatches.length > 0) {
    return categoryMatches
  }

  const matched = ALL_EMOJIS.filter((emoji) => emojiMatchesQuery(emoji, normalizedQuery))
  const uniqueMatched = [...new Set(matched)]

  if (uniqueMatched.length === 0) return []

  return [{ id: 'search', name: 'Search results', emojis: uniqueMatched }]
}

const EMOJI_KEYWORDS: Record<string, string[]> = {
  '🦄': ['unicorn', 'horse', 'magic', 'einhorn'],
  '⚔️': ['sword', 'swords', 'crossed', 'fight', 'fencing', 'weapon', 'battle'],
  '🤺': ['fencer', 'fencing', 'sport', 'sword', 'epee', 'sabre'],
  '✨': ['sparkle', 'sparkles', 'star', 'magic', 'shine', 'glitter'],
  '🐻': ['bear', 'head', 'animal', 'grizzly'],
  '🗡️': ['sword', 'dagger', 'weapon', 'fencing'],
  '🛡️': ['shield', 'armor', 'defense', 'fencing'],
  '🏆': ['trophy', 'win', 'award', 'champion'],
  '🎉': ['party', 'celebrate', 'confetti'],
  '❤️': ['heart', 'love', 'red'],
  '🔥': ['fire', 'hot', 'flame'],
  '👍': ['thumbs', 'up', 'yes', 'good'],
  '📅': ['calendar', 'date', 'schedule'],
  '⏰': ['time', 'clock', 'alarm'],
  '📍': ['pin', 'location', 'map', 'place'],
}

function emojiMatchesQuery(emoji: string, query: string): boolean {
  if (emoji.includes(query)) return true

  const labels = EMOJI_KEYWORDS[emoji]
  return labels?.some((label) => label.includes(query) || query.includes(label)) ?? false
}
