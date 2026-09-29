// Empty collection mark (the admin EmptyState pattern): framed tray icon + short message,
// centered in whatever block it fills.
export function EmptyState({ message, className }: { message: string; className?: string }) {
  return (
    <div data-empty-state className={"flex min-h-40 w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center" + (className ? " " + className : "")}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-soft">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-dim">
          <path d="M4.5 5.5h15L21.5 18a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2l2-12.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M3.5 14h4.7l1.5 2h4.6l1.5-2h4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="text-sm text-dim">{message}</p>
    </div>
  )
}
