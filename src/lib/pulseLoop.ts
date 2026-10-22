// One notifications pulse loop per tab (and per scope): the banner bar and the inbox button share it.
// Pure core with injected environment, so node --test runs it directly (no React, no app imports).

export type PulseInbox = { Cursor: string; Unread: number }
export type Pulse = { Banners: string; Inbox: PulseInbox | null }

export const PULSE_INTERVAL_MS = 30_000
export const PULSE_JITTER = 0.2
export const PULSE_MIN_GAP_MS = 5_000

/** 30 s ± 20 %; `random` is in [0, 1). */
export function pulseDelay(random: () => number = Math.random): number {
  return Math.round(PULSE_INTERVAL_MS * (1 + (random() * 2 - 1) * PULSE_JITTER))
}

export type PulseEnv = {
  fetchPulse: () => Promise<Pulse>
  isVisible: () => boolean
  now: () => number
  random: () => number
  setTimer: (fn: () => void, ms: number) => unknown
  clearTimer: (handle: unknown) => void
  /** Subscribes `wake` to visible / focus / online; returns the unsubscribe. */
  listenWake: (wake: () => void) => () => void
}

export type PulseListener = (pulse: Pulse) => void

export type PulseLoop = {
  /** Starts the loop on the first subscriber and stops it after the last one leaves. A late subscriber gets the last pulse at once. */
  subscribe: (listener: PulseListener) => () => void
  /** An own action changed the state: pulse now (coalesced with a pulse in flight). */
  trigger: () => void
  last: () => Pulse | null
}

export function createPulseLoop(env: PulseEnv): PulseLoop {
  const listeners = new Set<PulseListener>()
  let last: Pulse | null = null
  let timer: unknown = null
  let stopWake: (() => void) | null = null
  let inflight = false
  let again = false
  let lastAt = -Infinity

  const clear = () => { if (timer !== null) { env.clearTimer(timer); timer = null } }
  const schedule = () => {
    clear()
    if (listeners.size === 0 || !env.isVisible()) return
    timer = env.setTimer(() => { timer = null; void run() }, pulseDelay(env.random))
  }
  const run = async (): Promise<void> => {
    if (listeners.size === 0 || !env.isVisible()) return
    if (inflight) { again = true; return }
    inflight = true
    lastAt = env.now()
    try {
      const pulse = await env.fetchPulse()
      last = pulse
      for (const listener of [...listeners]) listener(pulse)
    } catch { /* a failed pulse is retried by the next tick */ }
    finally {
      inflight = false
      if (again) { again = false; void run() } else schedule()
    }
  }
  const wake = () => {
    if (!env.isVisible()) { clear(); return }
    if (env.now() - lastAt < PULSE_MIN_GAP_MS) { if (timer === null && !inflight) schedule(); return }
    clear()
    void run()
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      if (listeners.size === 1) {
        stopWake = env.listenWake(wake)
        if (last) listener(last)
        if (env.isVisible()) void run()
      } else if (last) listener(last)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) { clear(); stopWake?.(); stopWake = null }
      }
    },
    trigger() {
      clear()
      void run()
    },
    last: () => last,
  }
}

/** The Banners version of an empty list (the first 16 hex of sha256 of nothing); a newer backend may send "". */
export const EMPTY_BANNERS_VERSION = "e3b0c44298fc1c14"

/** Whether a pulse Banners version stands for a non-empty list: only then is the list worth a request. */
export function hasBanners(version: string): boolean {
  return version !== "" && version !== EMPTY_BANNERS_VERSION
}

/** The list last fetched and the pulse version it stands for; a module-level hold survives a remount. */
export type BannerHold<T> = { current: { version: string; banners: T } | null }

/**
 * Refetches banners only when the pulse Banners version differs from the held one (and once on load).
 * A version of an empty list is never fetched: `empty` (default []) is applied instead.
 */
export function createBannerSync<T>(
  fetchBanners: () => Promise<T>,
  apply: (banners: T) => void,
  { hold = { current: null }, empty = [] as unknown as T }: { hold?: BannerHold<T>; empty?: T } = {},
): (pulse: Pulse) => void {
  let pending: string | null = null
  return (pulse) => {
    const version = pulse.Banners
    if (version === pending || (pending === null && version === hold.current?.version)) return
    if (!hasBanners(version)) {
      pending = null
      hold.current = { version, banners: empty }
      apply(empty)
      return
    }
    pending = version
    fetchBanners()
      .then((banners) => {
        if (pending !== version) return // a newer version is on its way
        pending = null
        hold.current = { version, banners }
        apply(banners)
      })
      .catch(() => { if (pending === version) pending = null })
  }
}

/** Held when the baseline cursor is empty (empty inbox): only the very first request may send an empty since. */
export const EPOCH_CURSOR = "1970-01-01T00:00:00Z_00000000-0000-0000-0000-000000000000"

export type InboxFeed = { Cursor: string }

/** Asks `since=<cursor>` (empty = baseline) until the returned Cursor equals the pulse cursor; at least one round, bounded. */
export async function drainInbox<R extends InboxFeed>(opts: {
  target: string
  cursor: string
  fetchSince: (since: string) => Promise<R>
  apply: (result: R) => void | Promise<void>
  maxRounds?: number
}): Promise<string> {
  let cursor = opts.cursor
  let since = opts.cursor
  for (let round = 0; round < (opts.maxRounds ?? 5); round++) {
    const result = await opts.fetchSince(since)
    await opts.apply(result)
    cursor = result.Cursor
    since = cursor || EPOCH_CURSOR
    if (cursor === opts.target) break
  }
  return cursor
}

/** Whether a pulse asks for an inbox sync: first load, or the cursor / unread count moved. */
export function inboxChanged(inbox: PulseInbox, known: { cursor: string; unread: number } | null): boolean {
  return !known || known.cursor !== inbox.Cursor || known.unread !== inbox.Unread
}
