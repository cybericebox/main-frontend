// Inbox categories (docs/INBOX-DESIGN.md §3): tolerant parsing, default tab per app,
// request ordering, optimistic counts and the resolved line keys.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Dynamic path: node runs the .ts source directly, tsc doesn't resolve it.
const source = "../src/components/site/inboxModel.ts"
const inbox = await import(source) as typeof import("../src/components/site/inboxModel")
type Message = import("../src/components/site/inboxModel").InboxMessage

const ROOT = join(import.meta.dirname, "..")
const messages = (lang: string) => JSON.parse(readFileSync(join(ROOT, "messages", `${lang}.json`), "utf8")) as Record<string, string>

function item(id: string, fields: Partial<Message> = {}): Message {
  return { ID: id, Title: id, Body: "", Link: "", ReadAt: null, CreatedAt: "2026-09-29T09:00:00Z", ...fields }
}

test("older backend: no Counts means no categories", () => {
  assert.equal(inbox.parseCounts(undefined), null)
  assert.equal(inbox.parseCounts(null), null)
  assert.equal(inbox.parseCounts(3), null)
  assert.equal(inbox.resolveDefaultTab("personal", null), "all")
  assert.equal(inbox.resolveDefaultTab("requestsIfOpen", null), "all")
})

test("counts are parsed tolerantly", () => {
  assert.deepEqual(inbox.parseCounts({ All: 4, Requests: 2, Personal: "x", Activity: -1 }), { all: 4, requests: 2, personal: 0, activity: 0 })
  assert.deepEqual(inbox.parseCounts({}), { all: 0, requests: 0, personal: 0, activity: 0 })
  assert.equal(inbox.parseOtherEvents(5), 5)
  assert.equal(inbox.parseOtherEvents(undefined), 0)
  assert.equal(inbox.parseOtherEvents("5"), 0)
})

test("default tab per app", () => {
  const none = { all: 0, requests: 0, personal: 0, activity: 0 }
  const open = { ...none, requests: 2 }
  assert.equal(inbox.resolveDefaultTab("all", open), "all") // landing, event participant
  assert.equal(inbox.resolveDefaultTab("personal", open), "personal") // id
  assert.equal(inbox.resolveDefaultTab("requests", none), "requests") // event /manage
  assert.equal(inbox.resolveDefaultTab("requestsIfOpen", open), "requests") // admin, exercises
  assert.equal(inbox.resolveDefaultTab("requestsIfOpen", none), "all")
})

test("requests: open first, resolved below, order kept inside each group", () => {
  const list = [
    item("r1", { Category: "requests", ResolvedAt: "2026-09-29T10:00:00Z" }),
    item("o1", { Category: "requests" }),
    item("r2", { Category: "requests", ResolvedAt: "2026-09-29T08:00:00Z" }),
    item("o2", { Category: "requests" }),
  ]
  assert.deepEqual(inbox.orderForTab(list, "requests").map((entry) => entry.ID), ["o1", "o2", "r1", "r2"])
  assert.deepEqual(inbox.orderForTab(list, "all").map((entry) => entry.ID), ["r1", "o1", "r2", "o2"])
})

test("a resolved request is read and not open", () => {
  const resolved = item("r", { Category: "requests", ResolvedAt: "2026-09-29T10:00:00Z" })
  assert.equal(inbox.isUnread(resolved), false)
  assert.equal(inbox.isOpenRequest(resolved), false)
  assert.equal(inbox.isOpenRequest(item("o", { Category: "requests" })), true)
  assert.equal(inbox.isOpenRequest(item("p", { Category: "personal" })), false)
})

test("tab membership", () => {
  assert.equal(inbox.inTab(item("x"), "all"), true)
  assert.equal(inbox.inTab(item("x"), "personal"), false)
  assert.equal(inbox.inTab(item("x", { Category: "activity" }), "activity"), true)
})

test("optimistic counts", () => {
  const counts = { all: 5, requests: 2, personal: 3, activity: 2 }
  assert.deepEqual(inbox.countsAfterRead(counts, item("p", { Category: "personal" })), { all: 4, requests: 2, personal: 2, activity: 2 })
  assert.deepEqual(inbox.countsAfterRead(counts, item("q", { Category: "requests" })), { all: 4, requests: 2, personal: 3, activity: 2 })
  assert.deepEqual(inbox.countsAfterRead(counts, item("x", { ReadAt: "2026-09-29T10:00:00Z", Category: "personal" })), counts)
  assert.deepEqual(inbox.countsAfterReadAll(counts, "personal"), { all: 2, requests: 2, personal: 0, activity: 2 })
  assert.deepEqual(inbox.countsAfterReadAll(counts, "all"), { all: 0, requests: 2, personal: 0, activity: 0 })
  assert.deepEqual(inbox.countsAfterReadAll(counts, "requests"), counts)
})

test("queries carry the category and the event scope", () => {
  assert.equal(inbox.inboxQuery("all"), "")
  assert.equal(inbox.inboxQuery("requests"), "?category=requests")
  assert.equal(inbox.inboxQuery("personal", "ev1"), "?category=personal&event=ev1")
  assert.equal(inbox.inboxQuery("all", undefined, { since_id: "a" }), "?since_id=a")
})

test("resolved line keys exist in both catalogs", () => {
  assert.equal(inbox.resolutionKey("approved", true), "inbox.resolved.approved")
  assert.equal(inbox.resolutionKey("expired", false), "inbox.resolved.expired.system")
  assert.equal(inbox.resolutionKey("something-new", true), "inbox.resolved.other")
  assert.equal(inbox.resolutionKey(null, false), "inbox.resolved.other.system")
  for (const lang of ["uk", "en"]) {
    const catalog = messages(lang)
    for (const resolution of [...inbox.INBOX_RESOLUTIONS, "other"]) {
      for (const named of [true, false]) {
        const key = inbox.resolutionKey(resolution, named)
        assert.ok(catalog[key], `${lang}: ${key}`)
        assert.ok(catalog[key].includes("{time}"), `${lang}: ${key} has {time}`)
        if (named && resolution !== "expired") assert.ok(catalog[key].includes("{name}"), `${lang}: ${key} has {name}`)
      }
    }
    for (const tab of inbox.INBOX_TABS) assert.ok(catalog[`inbox.tab.${tab}`], `${lang}: inbox.tab.${tab}`)
  }
})

test("row time: HH:MM today, date with time otherwise", () => {
  const now = new Date(2026, 8, 29, 18, 0)
  assert.equal(inbox.formatInboxTime(new Date(2026, 8, 29, 12, 4).toISOString(), now, "en-GB"), "12:04")
  assert.match(inbox.formatInboxTime(new Date(2026, 8, 27, 9, 30).toISOString(), now, "en-GB"), /27 Sept?, 09:30/)
  assert.equal(inbox.formatInboxTime("not a date", now), "")
})
