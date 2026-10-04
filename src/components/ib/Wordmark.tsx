import "@/styles/wordmark.css"

// Brand wordmark «Cyber ICE Box» — «ICE» in the crest ice blue (--ib-ice, per theme / on mass).
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={"ib-wordmark" + (className ? " " + className : "")}>
      Cyber&nbsp;<span className="ib-wordmark__ice">ICE</span>&nbsp;Box
    </span>
  )
}
