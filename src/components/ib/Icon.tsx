// ds-v2 stroke icon from the sprite (/assets/icons.svg). Colour = currentColor.
// Base .ib-icon CSS is global (globals.css → styles/ds/components/icon.css).
export function Icon({ name, size, className }: { name: string; size?: 20; className?: string }) {
  const cls = "ib-icon" + (size === 20 ? " ib-icon--20" : "") + (className ? " " + className : "")
  return (
    <svg className={cls} aria-hidden="true">
      <use href={`/assets/icons.svg#i-${name}`} />
    </svg>
  )
}
