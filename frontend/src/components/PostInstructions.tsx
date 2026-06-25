export default function PostInstructions() {
  return (
    <aside className="post-instructions" aria-label="Post instructions">
      <p>
        Posts should include a date and a list of activities for the class or event.
      </p>
      <p className="post-instructions-hint">
        Dates can be month and day only (e.g. June 28 or 6/28) — the current year is assumed for Gymdesk and Meetup.
      </p>
    </aside>
  )
}
