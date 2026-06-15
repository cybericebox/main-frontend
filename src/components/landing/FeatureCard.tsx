import type { ComponentType } from "react"

export default function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="frost-panel rounded-lg p-6 text-left">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
