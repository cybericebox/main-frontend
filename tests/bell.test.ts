// The bell never shows the crest: a loader stands in for content that replaces it, the bell keeps its icon.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const read = (p: string) => readFileSync(join(import.meta.dirname, "..", p), "utf8")

test("inbox bell placeholder renders the bell icon, not the crest loader", () => {
  const header = read("src/components/site/SiteHeader.tsx")
  assert.doesNotMatch(header, /BrandLoading/)
  assert.match(header, /loading: \(\) => .*name="bell"/)
})

test("the inbox button itself keeps the bell icon while data loads", () => {
  const inbox = read("src/components/site/InboxButton.tsx")
  const trigger = inbox.slice(inbox.indexOf("<Popover.Trigger"), inbox.indexOf("</Popover.Trigger>"))
  assert.match(trigger, /name="bell"/)
  assert.doesNotMatch(trigger, /BrandLoading|loading/)
})
