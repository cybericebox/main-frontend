// Pulse loop: interval + jitter, pause when hidden, debounced wake, banner refetch only on version change, inbox since-loop.
import { test } from "node:test"
import assert from "node:assert/strict"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/lib/pulseLoop.ts"
const mod = await import(source) as typeof import("../src/lib/pulseLoop")
type Pulse = import("../src/lib/pulseLoop").Pulse

const pulse = (Banners = "v1", cursor = "c1", unread = 0): Pulse => ({ Banners, Inbox: { Cursor: cursor, Unread: unread } })

function harness(opts: { random?: () => number } = {}) {
  let now = 0
  let visible = true
  let nextId = 1
  const timers = new Map<number, { at: number; fn: () => void }>()
  let wake: () => void = () => {}
  let fetches = 0
  let answer: Pulse | Error = pulse()
  const delays: number[] = []
  const env = {
    fetchPulse: async () => { fetches++; if (answer instanceof Error) throw answer; return answer },
    isVisible: () => visible,
    now: () => now,
    random: opts.random ?? (() => 0.5),
    setTimer: (fn: () => void, ms: number) => { const id = nextId++; delays.push(ms); timers.set(id, { at: now + ms, fn }); return id },
    clearTimer: (handle: unknown) => { timers.delete(handle as number) },
    listenWake: (fn: () => void) => { wake = fn; return () => { wake = () => {} } },
  }
  const flush = () => new Promise((resolve) => setImmediate(resolve))
  const advance = async (ms: number) => {
    now += ms
    for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn() }
    await flush()
  }
  return {
    env, delays, timers, flush, advance,
    fetches: () => fetches,
    setAnswer: (value: Pulse | Error) => { answer = value },
    setVisible: (value: boolean) => { visible = value },
    wake: () => wake(),
    tick: (ms: number) => { now += ms },
  }
}

test("delay stays within 30 s +- 20 %", () => {
  assert.equal(mod.pulseDelay(() => 0.5), 30_000)
  assert.equal(mod.pulseDelay(() => 0), 24_000)
  assert.equal(mod.pulseDelay(() => 0.999999), 36_000)
  for (let i = 0; i <= 100; i++) {
    const delay = mod.pulseDelay(() => i / 101)
    assert.ok(delay >= 24_000 && delay <= 36_000)
  }
})

test("pulses at once, then on the jittered interval; guests included", async () => {
  const h = harness({ random: () => 0 })
  const seen: Pulse[] = []
  mod.createPulseLoop(h.env).subscribe((p) => seen.push(p))
  await h.flush()
  assert.equal(h.fetches(), 1)
  assert.deepEqual(h.delays, [24_000])
  await h.advance(23_999)
  assert.equal(h.fetches(), 1)
  await h.advance(1)
  assert.equal(h.fetches(), 2)
  assert.equal(seen.length, 2)
  h.setAnswer({ Banners: "v1", Inbox: null })
  await h.advance(24_000)
  assert.equal(seen[2].Inbox, null)
})

test("no timer while the tab is hidden; becoming visible pulses once", async () => {
  const h = harness()
  const loop = mod.createPulseLoop(h.env)
  loop.subscribe(() => {})
  await h.flush()
  assert.equal(h.timers.size, 1)
  h.setVisible(false)
  h.wake()
  assert.equal(h.timers.size, 0)
  await h.advance(120_000)
  assert.equal(h.fetches(), 1)
  h.setVisible(true)
  h.wake()
  await h.flush()
  assert.equal(h.fetches(), 2)
  assert.equal(h.timers.size, 1)
})

test("wake events are debounced to one pulse per 5 s", async () => {
  const h = harness()
  mod.createPulseLoop(h.env).subscribe(() => {})
  await h.flush()
  h.tick(1_000)
  h.wake(); h.wake()
  await h.flush()
  assert.equal(h.fetches(), 1)
  h.tick(5_000)
  h.wake(); h.wake()
  await h.flush()
  assert.equal(h.fetches(), 2)
})

test("one loop for several subscribers; it stops after the last one leaves; late subscriber gets the last pulse", async () => {
  const h = harness()
  const loop = mod.createPulseLoop(h.env)
  const a: Pulse[] = []
  const b: Pulse[] = []
  const stopA = loop.subscribe((p) => a.push(p))
  await h.flush()
  const stopB = loop.subscribe((p) => b.push(p))
  await h.flush()
  assert.equal(h.fetches(), 1)
  assert.equal(b.length, 1)
  stopA(); stopB()
  assert.equal(h.timers.size, 0)
  await h.advance(100_000)
  assert.equal(h.fetches(), 1)
})

test("a failed pulse keeps the schedule", async () => {
  const h = harness()
  h.setAnswer(new Error("offline"))
  mod.createPulseLoop(h.env).subscribe(() => {})
  await h.flush()
  assert.equal(h.timers.size, 1)
})

test("trigger pulses now and coalesces with a pulse in flight", async () => {
  const h = harness()
  const loop = mod.createPulseLoop(h.env)
  loop.subscribe(() => {})
  await h.flush()
  loop.trigger()
  await h.flush()
  assert.equal(h.fetches(), 2)
})

test("banners are fetched only when the Banners version changes", async () => {
  const fetched: string[] = []
  const applied: string[][] = []
  const sync = mod.createBannerSync(async () => { fetched.push("x"); return ["b"] }, (list) => applied.push(list))
  sync(pulse("v1")); await Promise.resolve(); await Promise.resolve()
  sync(pulse("v1", "c2")); sync(pulse("v1", "c3"))
  assert.equal(fetched.length, 1)
  sync(pulse("v2"))
  assert.equal(fetched.length, 2)
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(applied.length, 2)
})

test("a failed banner fetch is retried by the next pulse", async () => {
  let calls = 0
  const sync = mod.createBannerSync(async () => { calls++; if (calls === 1) throw new Error("x"); return [] }, () => {})
  sync(pulse("v1"))
  await new Promise((resolve) => setImmediate(resolve))
  sync(pulse("v1"))
  assert.equal(calls, 2)
})

test("inbox: changed only on first load, a new cursor or a new unread count", () => {
  const inbox = { Cursor: "c1", Unread: 2 }
  assert.equal(mod.inboxChanged(inbox, null), true)
  assert.equal(mod.inboxChanged(inbox, { cursor: "c1", unread: 2 }), false)
  assert.equal(mod.inboxChanged(inbox, { cursor: "c0", unread: 2 }), true)
  assert.equal(mod.inboxChanged(inbox, { cursor: "c1", unread: 1 }), true)
})

test("inbox since-loop: baseline with empty since, then until the cursor reaches the pulse cursor", async () => {
  const asked: string[] = []
  const chain: Record<string, string> = { "": "c1", c1: "c2", c2: "c3" }
  const applied: string[] = []
  const cursor = await mod.drainInbox({
    target: "c3",
    cursor: "",
    fetchSince: async (since) => { asked.push(since); return { Cursor: chain[since] } },
    apply: (result) => { applied.push(result.Cursor) },
  })
  assert.deepEqual(asked, ["", "c1", "c2"])
  assert.deepEqual(applied, ["c1", "c2", "c3"])
  assert.equal(cursor, "c3")
})

test("inbox since-loop: one round when already current, bounded when the cursor never catches up", async () => {
  let calls = 0
  await mod.drainInbox({ target: "c1", cursor: "c1", fetchSince: async () => { calls++; return { Cursor: "c1" } }, apply: () => {} })
  assert.equal(calls, 1)
  calls = 0
  const cursor = await mod.drainInbox({ target: "zz", cursor: "a", maxRounds: 3, fetchSince: async () => { calls++; return { Cursor: `n${calls}` } }, apply: () => {} })
  assert.equal(calls, 3)
  assert.equal(cursor, "n3")
})

test("banners: no fetch before the first pulse; the first pulse fetches and its version is the stored one", async () => {
  let calls = 0
  const sync = mod.createBannerSync(async () => { calls++; return [] }, () => {})
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(calls, 0)
  sync(pulse("v7"))
  sync(pulse("v7", "c9"))
  assert.equal(calls, 1)
  sync(pulse("v8"))
  assert.equal(calls, 2)
})

test("inbox: an empty baseline cursor is held as the epoch, so the next round is not another baseline", async () => {
  const asked: string[] = []
  const cursor = await mod.drainInbox({
    target: "c1",
    cursor: "",
    fetchSince: async (since) => { asked.push(since); return since === "" ? { Cursor: "", Items: [] as string[] } : { Cursor: "c1", Items: ["new"] } },
    apply: () => {},
  })
  assert.deepEqual(asked, ["", mod.EPOCH_CURSOR])
  assert.equal(cursor, "c1")
})

test("banners: a version of an empty list is never fetched; the list is cleared instead", async () => {
  let calls = 0
  const applied: unknown[] = []
  const sync = mod.createBannerSync(async () => { calls++; return ["b"] }, (list) => applied.push(list))
  sync(pulse(mod.EMPTY_BANNERS_VERSION))
  sync(pulse(""))
  assert.equal(calls, 0)
  assert.deepEqual(applied, [[], []])
  sync(pulse("v1"))
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(calls, 1)
  sync(pulse(mod.EMPTY_BANNERS_VERSION))
  assert.equal(calls, 1)
  assert.deepEqual(applied.at(-1), [])
})

test("banners: a shared hold lets a remounted sync skip the version already fetched", async () => {
  let calls = 0
  const hold: { current: { version: string; banners: string[] } | null } = { current: null }
  const first = mod.createBannerSync(async () => { calls++; return ["b"] }, () => {}, { hold })
  first(pulse("v1"))
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(hold.current, { version: "v1", banners: ["b"] })
  const second = mod.createBannerSync(async () => { calls++; return ["b"] }, () => {}, { hold })
  second(pulse("v1"))
  assert.equal(calls, 1)
  second(pulse("v2"))
  assert.equal(calls, 2)
})

test("banners: an answer for an older version never overwrites a newer one", async () => {
  const answers: Array<(list: string[]) => void> = []
  const applied: string[][] = []
  const sync = mod.createBannerSync(() => new Promise<string[]>((resolve) => { answers.push(resolve) }), (list) => applied.push(list))
  sync(pulse("v1"))
  sync(pulse("v2"))
  answers[1](["new"])
  answers[0](["old"])
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(applied, [["new"]])
})
