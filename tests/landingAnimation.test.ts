import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { FEED_EVENTS, FEED_LINES, feedLines } from "@/components/landing/heroFeed"

const read = (p: string) => readFileSync(p, "utf8")
const hero = read("src/components/landing/HeroChallenge.tsx")
const heroCss = read("src/components/landing/heroChallenge.css")
const topo = read("src/components/ib/Topology.tsx")
const topoCss = read("src/styles/ds/components/topology.css")
const uk = JSON.parse(read("messages/uk.json")) as Record<string, string>
const en = JSON.parse(read("messages/en.json")) as Record<string, string>

test("the feed shows two lines, newest first, and cycles through the demo list", () => {
  const first = feedLines(FEED_LINES - 1)
  assert.deepEqual(first.map((l) => l.n), [1, 0])
  const later = feedLines(FEED_EVENTS.length + 2)
  assert.equal(later.length, FEED_LINES)
  assert.equal(later[0].event, FEED_EVENTS[2])
  assert.equal(later[0].n, FEED_EVENTS.length + 2)
})

test("every feed team and tile has texts in uk and en", () => {
  for (const cat of [uk, en]) {
    assert.ok(cat["landing.ch.feed.line"])
    for (const e of FEED_EVENTS) {
      assert.ok(cat[`landing.ch.feed.team.${e.team}`], e.team)
      assert.ok(cat[`landing.ch.tiles.${e.tile}`], e.tile)
    }
  }
})

test("the feed is decorative and separate from the warm-up state", () => {
  assert.match(hero, /className="hc-feed" aria-hidden="true"/)
  assert.doesNotMatch(read("src/components/landing/heroFeed.ts"), /warmup|sessionStorage|setDone/i)
  assert.match(heroCss, /@media \(prefers-reduced-motion:reduce\)\{\.hc-feed p\.is-new\{animation:none\}/)
  assert.match(heroCss, /\.hc-feed\{height:var\(--hc-feed-h\)/)
})

test("the topology assembles perimeter, nodes, links, then packets; reduced motion shows everything", () => {
  const steps = [...topo.matchAll(/step\((\w+)\)/g)].map((m) => m[1])
  assert.equal(steps[0], "0")
  assert.ok(steps.includes("LINKS_STEP"))
  assert.match(topo, /prefers-reduced-motion: reduce[\s\S]*return/)
  assert.match(topoCss, /\.ib-topo\.is-build \[data-ib-b\]\{opacity:0\}/)
  assert.match(topoCss, /\.ib-topo\.is-build \.ib-topo__flow\{opacity:0\}/)
})
