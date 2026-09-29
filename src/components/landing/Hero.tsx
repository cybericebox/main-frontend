import { preload } from "react-dom"
import { HeroChallenge, WARMUP_COMMENT } from "./HeroChallenge"

// Landing hero: left — headline, subhead, «Спробувати розминку» + «Лабораторії»; right — the event
// app window; the warm-up challenge opens over it (the real flag form). Both columns: HeroChallenge.
export function Hero() {
  // The hero waves (a CSS ::before background, see ds/base.css) are the LCP image: announce them in the
  // document head so the fetch starts with the HTML, not after the CSS is parsed.
  preload("/assets/waves.webp", { as: "image", type: "image/webp", fetchPriority: "high" })
  return (
    <section className="pl-hero ib-waves-quiet" aria-labelledby="hero-h">
      {/* the warm-up trail starts in an HTML comment of the static page (see HeroChallenge) */}
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static constant comment */}
      <div hidden dangerouslySetInnerHTML={{ __html: WARMUP_COMMENT }} />
      {/* TODO(public-events): when GET /events/upcoming returns an event, show the nearest-event panel on the right. */}
      <HeroChallenge />
    </section>
  )
}
