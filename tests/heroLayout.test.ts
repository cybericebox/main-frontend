import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const hero = readFileSync("src/components/landing/heroChallenge.css", "utf8")
const consent = readFileSync("src/styles/consent.css", "utf8")

test("the warm-up card offset never goes negative", () => {
  assert.match(hero, /\.hc-card\{[^}]*left:max\(0px,min\(230px,calc\(100% - \d+px\)\)\)/)
})

test("the bleeding hero window fades out instead of clipping mid-word", () => {
  assert.match(hero, /@media \(min-width:981px\) and \(max-width:1359px\)\{\s*\.hc\{[^}]*mask-image:linear-gradient/)
})

test("the cookie settings link keeps a 24px target (44px on touch)", () => {
  assert.match(consent, /\.cb-consent-link\{[^}]*min-height:24px/)
  assert.match(consent, /pointer:coarse\)\{\.cb-consent-link\{min-height:44px/)
})
