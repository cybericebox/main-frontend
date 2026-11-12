import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { FEED_EVENTS, RESET_AT, TEAMS, applyEvent, ranks, startPoints } from "@/components/landing/heroRating"
import { FEATURES, FLAG, LIT, MODES, STEPS, TALL, WIDE, bootOrder, finalScene, slice, story, type Label } from "@/components/landing/labScene"

const read = (p: string) => readFileSync(p, "utf8")
const hero = read("src/components/landing/HeroChallenge.tsx")
const heroCss = read("src/components/landing/heroChallenge.css")
const rating = read("src/components/landing/heroRating.ts")
const lab = read("src/components/landing/LabDemo.tsx")
const labCss = read("src/components/landing/labDemo.css")
const uk = JSON.parse(read("messages/uk.json")) as Record<string, string>
const en = JSON.parse(read("messages/en.json")) as Record<string, string>

test("the rating starts in the listed order and a solve can overtake a neighbour", () => {
  const start = startPoints()
  assert.deepEqual(ranks(start), { alpha: 0, bravo: 1, charlie: 2, delta: 3 })
  const after = applyEvent(start, FEED_EVENTS[0], 300) // bravo +300
  assert.equal(after.bravo, 1400)
  assert.deepEqual(ranks(after), { bravo: 0, alpha: 1, charlie: 2, delta: 3 })
  assert.equal(start.bravo, 1100) // the previous table is untouched
})

test("equal points keep the starting order, and the demo restarts before the numbers grow a digit", () => {
  assert.deepEqual(ranks({ alpha: 1000, bravo: 1000, charlie: 1000, delta: 1000 }), { alpha: 0, bravo: 1, charlie: 2, delta: 3 })
  const big = { ...startPoints(), alpha: RESET_AT + 1 }
  assert.equal(applyEvent(big, FEED_EVENTS[0], 300).alpha, TEAMS[0].points)
})

test("every rating team and task has texts in uk and en", () => {
  for (const cat of [uk, en]) {
    for (const key of ["landing.ch.rating", "landing.ch.ratingNote", "landing.ch.ownTeam"]) assert.ok(cat[key], key)
    for (const team of TEAMS) assert.ok(cat[`landing.ch.feed.team.${team.id}`], team.id)
    for (const e of FEED_EVENTS) assert.ok(cat[`landing.ch.tiles.${e.tile}`], e.tile)
  }
})

test("the rating is decorative and separate from the warm-up state", () => {
  assert.match(hero, /className="hc-rk" aria-hidden="true"/)
  assert.doesNotMatch(rating, /warmup|sessionStorage|setDone/i)
  assert.match(rating, /reducedMotion\(\)\) return\n/) // no ticking with reduced motion
  assert.match(heroCss, /\.hc-rk\{height:var\(--hc-feed-h\)/) // a fixed block: nothing shifts
  assert.match(heroCss, /@media \(prefers-reduced-motion:reduce\)\{\.hc-rk__row,/)
})

test("the warm-up reward plays only for a flag solved in this visit", () => {
  assert.match(hero, /const \[fresh, setFresh\] = useState\(false\)/)
  assert.match(hero, /useRoll\(done \? RANK\.place : TOTAL, fresh, 900\)/)
  assert.match(hero, /x\.warm && fresh \? " is-just" : ""/)
})

const labels = (mode: (typeof MODES)[number]): Label[] => [
  ...[WIDE, TALL].flatMap((s) => [...s.zones.map((z) => z.label), ...s.nodes.flatMap((n) => [n.name, n.addr]), ...s.notes.map((n) => n.text)]),
  ...finalScene(mode).lines.map((l) => l.text),
  ...story(mode).flatMap((step) => (step.do === "out" ? [step.line.text] : step.do === "probe" ? [step.text] : [])),
]

test("every text key of the lab demo exists in uk and en", () => {
  const keys = new Set(MODES.flatMap(labels).flatMap((l) => (typeof l === "string" ? [] : [l.key])))
  for (const id of WIDE.nodes.map((n) => n.id)) keys.add(`landing.labs.tip.${id}`)
  for (let i = 1; i <= STEPS; i++) keys.add(`landing.labs.step${i}`)
  for (const key of ["modeCtf", "modeLearn", "starting", "ready", "termBoot", "termReady", "outPlace", "outTimer", "outNote", "stepsDone", "hint", "featHint"]) keys.add(`landing.labs.${key}`)
  assert.ok(keys.size > 30)
  for (const cat of [uk, en]) for (const key of keys) assert.ok(cat[key], key)
})

test("both layouts hold the same parts, so the story and the feature rows work on a phone too", () => {
  const ids = (s: typeof WIDE) => [...s.zones, ...s.links, ...s.nodes].map((p) => p.id).concat(s.segs.map((p) => `seg-${p.id}`)).sort()
  assert.deepEqual(ids(TALL), ids(WIDE))
  const known = new Set([...ids(WIDE), "note-wg0", "note-http", "note-probe"])
  for (const f of FEATURES) for (const key of LIT[f]) assert.ok(known.has(key), `${f}: ${key}`)
})

test("the story draws only what the scheme has and ends on the last frame", () => {
  for (const mode of MODES) {
    const steps = story(mode)
    assert.equal(steps[0].do, "boot")
    const segs = new Set(WIDE.segs.filter((s) => !s.mode || s.mode === mode).map((s) => s.id))
    for (const step of steps) {
      if (step.do === "draw") assert.ok(segs.has(step.seg), `${mode}: ${step.seg}`)
      if (step.do === "packet") assert.ok(segs.has(step.path), `${mode}: ${step.path}`)
    }
    const drawn = steps.flatMap((s) => (s.do === "draw" ? [s.seg] : []))
    assert.deepEqual(drawn, finalScene(mode).drawn)
    const nodes = new Set(WIDE.nodes.filter((n) => !n.mode || n.mode === mode).map((n) => n.id))
    for (const host of bootOrder(mode)) assert.ok(nodes.has(host), `${mode}: ${host}`)
  }
})

test("competition ends with a flag and a step up; training ends with every step checked and no flag", () => {
  const ctf = finalScene("ctf")
  assert.equal(ctf.won, true)
  assert.match(FLAG, /^ICE\{.+\}$/)
  assert.equal(ctf.lines.at(-1)?.text, FLAG)
  assert.deepEqual(slice(false).map((r) => [r.id, r.place]), [["charlie", 3], ["delta", 4], ["own", 5]])
  assert.deepEqual(slice(true).map((r) => [r.id, r.place]), [["charlie", 4], ["delta", 5], ["own", 3]])
  const learn = finalScene("learn")
  assert.equal(learn.won, false)
  assert.equal(learn.steps, STEPS)
  assert.ok(!learn.lines.some((l) => l.text === FLAG))
})

test("the warm-up recognises the demo flag and says it was copied, in both catalogs", () => {
  assert.match(hero, /import \{ FLAG as DEMO_FLAG \} from "\.\/labScene"/)
  assert.match(hero, /if \(v === DEMO_FLAG\) \{\s*console\.info\(smiling\(t\("landing\.console\.demoFlag"\), SMILE\)\)\s*return setError\(t\("landing\.warmup\.demoFlag"\)\)/)
  assert.equal([...read("src/components/landing/labScene.ts").matchAll(/ICE\{p1v0t/g)].length, 1) // defined once
  for (const cat of [uk, en]) for (const key of ["landing.warmup.demoFlag", "landing.console.demoFlag"]) assert.ok(cat[key], key)
})

test("the result dialog names the time only for a suspiciously fast solve, and shows honest numbers", () => {
  assert.match(hero, /const FAST_SOLVE_S = 30/)
  assert.match(hero, /if \(started > 0 && seconds <= FAST_SOLVE_S\) setFastSeconds\(seconds\)/)
  assert.match(hero, /fastSeconds === null \? t\("landing\.warmup\.modalText"\) : t\("landing\.warmup\.modalFast", \{ seconds: fastSeconds \}\)/)
  assert.match(hero, /<RollStat from=\{0\} to=\{TOTAL - RANK\.place\} active=\{modal\} \/>/) // «обійшли» = the demo table itself
  assert.match(rating, /export function burst\(points: number\): Promise<void> \{\s*if \(reducedMotion\(\)\) return Promise\.resolve\(\)/) // no burst with reduced motion
  assert.match(hero, /setCard\(false\)\s*await burst\(WARM\.points\)\s*setModal\(true\)/) // one message: the card closes, then the dialog
  assert.doesNotMatch(rating, /Math\.random/)
  for (const cat of [uk, en]) for (const key of ["landing.warmup.modalFast", "landing.warmup.statBeaten"]) assert.ok(cat[key], key)
})

test("the developer-tools easter eggs wait for the first opening of the warm-up", () => {
  const open = hero.slice(hero.indexOf("const openCard ="), hero.indexOf("const closeCard ="))
  assert.match(open, /tease\(\)/)
  const tease = hero.slice(hero.indexOf("const tease ="), hero.indexOf("const openCard ="))
  assert.match(tease, /if \(teasedRef\.current\) return/) // once
  assert.match(tease, /console\.info\(smiling\(t\("landing\.console\.hint"\), WINK\)\)/)
  assert.match(tease, /fetch\("\/flag\.txt"/)
  assert.equal([...hero.matchAll(/fetch\("\/flag\.txt"/g)].length, 1) // nowhere else: nothing is requested on page load
  assert.doesNotMatch(read("public/flag.txt"), /ICE\{/) // not a decoy flag
})

test("the lab card shows its last frame off screen and with reduced motion, and keeps its height", () => {
  assert.match(lab, /if \(!visible \|\| reducedMotion\(\)\) \{\s*setScene\(finalScene\(mode\)\)/)
  assert.match(labCss, /\.ld-term\{--ld-rows:4;height:calc\(var\(--ld-rows\) \* 1\.7em \+ 24px\)/)
  assert.match(labCss, /\.ld-out>div\{grid-area:1\/1/) // both outcomes share one cell
  assert.match(labCss, /@media \(prefers-reduced-motion:reduce\)\{\s*\.ld \[data-k\]/)
})
