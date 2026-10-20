import {test, mock} from "node:test"
import assert from "node:assert/strict"
import {CHUNK_RECOVERY_BOOT_SCRIPT, installChunkRecovery} from "@/lib/chunkRecovery"

function browser(storage = new Map<string, string>(), entries: object[] = []) {
  const listeners = new Map<string, EventListener[]>()
  const reload = mock.fn<() => void>(() => {})
  const win = {
    location: {href: "https://site.example/events?q=term#event", origin: "https://site.example", reload},
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
    },
    performance: {getEntriesByType: () => entries},
    addEventListener: (name: string, listener: EventListener) => {
      listeners.set(name, [...(listeners.get(name) ?? []), listener])
    },
  }
  return {win: win as unknown as Window, reload, storage,
    emit: (name: string, event: object) => listeners.get(name)?.forEach(listener => listener(event as Event))}
}
const chunkError = () => Object.assign(new Error("Loading chunk 42 failed."), {name: "ChunkLoadError"})
const resource = (responseStatus: number) => ({name: "https://site.example/_next/static/chunks/old.js", initiatorType: "script", responseStatus})

test("writes the persistent guard before one URL-preserving reload across all callers", () => {
  const b = browser()
  b.reload.mock.mockImplementation(() => assert.ok(b.storage.has("cib:chunk-recovery-at")))
  const recovery = installChunkRecovery(b.win)
  assert.equal(installChunkRecovery(b.win), recovery)
  assert.equal(recovery.recover(chunkError()), true)
  b.emit("unhandledrejection", {reason: chunkError()})
  b.emit("error", {error: chunkError()})
  assert.equal(b.reload.mock.callCount(), 1)
  assert.equal(b.win.location.href, "https://site.example/events?q=term#event")
  const after = browser(b.storage)
  const repeated = installChunkRecovery(after.win)
  const failed = mock.fn()
  repeated.subscribe(failed)
  after.emit("unhandledrejection", {reason: chunkError()})
  assert.equal(after.reload.mock.callCount(), 0)
  assert.equal(failed.mock.callCount(), 1)
  repeated.retry(chunkError(), () => assert.fail("must reload"))
  assert.equal(after.reload.mock.callCount(), 1)
  assert.equal(repeated.recover(chunkError()), false)
})

test("serialized bootstrap replays prelistener HTTP failures and shares the document guard", () => {
  const b = browser(new Map(), [resource(404)])
  new Function("window", CHUNK_RECOVERY_BOOT_SCRIPT)(b.win)
  assert.equal(b.reload.mock.callCount(), 1)
  assert.equal(installChunkRecovery(b.win).recover(chunkError()), false)
  const after = browser(b.storage, [resource(404)])
  const failed = mock.fn()
  installChunkRecovery(after.win).subscribe(failed)
  assert.equal(after.reload.mock.callCount(), 0)
  assert.equal(failed.mock.callCount(), 1)
})

test("unknown/successful resources, ordinary failures and external imports never reload", () => {
  const b = browser(new Map(), [resource(200), resource(0), {...resource(404), initiatorType: "fetch"}, {...resource(404), name: "https://external.example/_next/static/chunks/old.js"}])
  const recovery = installChunkRecovery(b.win)
  const fallback = mock.fn()
  for (const error of [new Error("Failed to fetch"), new Error("Cannot read properties of undefined"), new Error("API request failed"), new TypeError("Failed to fetch dynamically imported module: https://external.example/module.js")]) {
    assert.equal(recovery.recover(error), false)
    b.emit("unhandledrejection", {reason: error})
    recovery.retry(error, fallback)
  }
  assert.equal(b.reload.mock.callCount(), 0)
  assert.equal(fallback.mock.callCount(), 4)
})

for (const method of ["getItem", "setItem"] as const) test(`storage ${method} failures cannot cause automatic loops`, () => {
  const b = browser()
  b.win.sessionStorage[method] = () => { throw new Error("disabled") }
  const recovery = installChunkRecovery(b.win)
  assert.equal(recovery.recover(chunkError()), false)
  assert.equal(recovery.recover(chunkError()), false)
  assert.equal(b.reload.mock.callCount(), 0)
})

for (const message of ["Failed to fetch dynamically imported module: https://site.example/_next/static/chunks/old.js", "error loading dynamically imported module: https://site.example/_next/static/chunks/old.js", "Importing a module script failed.", "Failed to load chunk /_next/static/chunks/old.js from module 42"]) test(`recognizes ${message}`, () => {
  const b = browser()
  assert.equal(installChunkRecovery(b.win).recover(new TypeError(message)), true)
  assert.equal(b.reload.mock.callCount(), 1)
})

test("captures initial script resource errors only for same-origin Next JavaScript", () => {
  const b = browser()
  installChunkRecovery(b.win)
  for (const src of ["https://external.example/_next/static/chunks/old.js", "https://site.example/analytics.js", "https://site.example/_next/static/chunks/old.css"]) b.emit("error", {target: {tagName: "SCRIPT", src}})
  assert.equal(b.reload.mock.callCount(), 0)
  b.emit("error", {target: {tagName: "SCRIPT", src: "https://site.example/_next/static/chunks/old.js?v=old"}})
  assert.equal(b.reload.mock.callCount(), 1)
})
