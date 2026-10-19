// Landing / legal UI pass: FAQ keeps one answer open, the legal TOC marks the section being read, the warm-up
// submit names its operation while busy, legal text glues only short words, the lab scheme never scrolls.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { currentSection } from "@/components/legal/tocSpy"
import { legalNbsp, nbsp } from "@/i18n/typo"

const ROOT = join(import.meta.dirname, "..")
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")
const NB = " "

test("FAQ: every answer shares one <details> name, so opening one closes the other", () => {
  assert.match(read("src/components/landing/Faq.tsx"), /<Accordion [^>]*name="faq"/)
  assert.match(read("src/components/ib/Accordion.tsx"), /<details [^>]*name=\{name\}/)
})

test("TOC: the last section whose top passed the line is current", () => {
  assert.equal(currentSection([-900, -300, 80, 600], 120, 800, false), 2)
  assert.equal(currentSection([-900, -300, 130, 600], 120, 800, false), 1)
})

test("TOC: above the first section, the first one counts once it is on screen", () => {
  assert.equal(currentSection([400, 1200], 120, 800, false), 0)
  assert.equal(currentSection([1400, 2200], 120, 800, false), -1)
})

test("TOC: at the bottom of the page the last section is current, even if it never reached the line", () => {
  assert.equal(currentSection([-900, 300, 500], 120, 800, true), 2)
  assert.equal(currentSection([], 120, 800, true), -1)
})

test("TOC: the legal list marks the current link with aria-current=location", () => {
  const toc = read("src/components/legal/LegalToc.tsx")
  assert.match(toc, /currentSection\(/)
  assert.match(toc, /aria-current=\{current === item\.id \? "location" : undefined\}/)
})

test("warm-up: the busy submit shows the crest and «Перевіряємо…» in both catalogs", () => {
  const src = read("src/components/landing/HeroChallenge.tsx")
  const button = src.slice(src.indexOf('<Button type="submit"'), src.indexOf("</Button>", src.indexOf('<Button type="submit"')))
  assert.match(button, /aria-busy=\{checking \|\| undefined\}/)
  assert.match(button, /<BrandLoading inline label=\{t\("landing\.warmup\.checking"\)\} \/>/)
  assert.match(button, /\{t\("landing\.warmup\.checking"\)\}/)
  assert.doesNotMatch(button, /(?<!-)disabled=\{[^}]*checking/) // aria-disabled while busy keeps focus (DS busy rule)
  assert.equal(JSON.parse(read("messages/uk.json"))["landing.warmup.checking"], "Перевіряємо…")
  assert.equal(JSON.parse(read("messages/en.json"))["landing.warmup.checking"], "Checking…")
  // the DS busy style makes the label transparent: the hero keeps it readable
  assert.match(read("src/components/landing/heroChallenge.css"), /\.hc-card__form \.ib-btn\[aria-busy="true"\]\{--_fg:var\(--ib-on-action\)/)
})

test("legal text: only 1–2-letter prepositions and single letters stay glued", () => {
  const glued = nbsp("Дані для входу, що зберігаються до 30 днів і не довше")
  assert.equal(legalNbsp(glued), `Дані для входу, що зберігаються до${NB}30 днів і${NB}не довше`)
  assert.equal(legalNbsp(nbsp("слово — далі")), `слово${NB}— далі`)
})

test("lab scheme: no 600px floor, and phones get the column layout", () => {
  const css = read("src/styles/landing.css")
  assert.match(css, /\.ib-topo \.ib-topo__wide\{min-width:0\}/)
  assert.match(css, /@media \(max-width:640px\)\{\s*\.ib-topo \.ib-topo__wide\{display:none\}\s*\.ib-topo \.ib-topo__tall\{display:block\}/)
  assert.match(read("src/components/ib/Topology.tsx"), /className="ib-topo__tall"/)
})

test("touch: 44px targets and a 16px flag field", () => {
  assert.match(read("src/styles/theme-switch.css"), /pointer:coarse\)\{\.ib-theme__btn\{width:44px;height:44px\}/)
  assert.match(read("src/styles/site.css"), /\.ib-navbar__brand\{min-width:44px;min-height:44px\}/)
  assert.match(read("src/styles/site.css"), /\.ib-navbar__toggle\{width:44px;height:44px\}/)
  assert.match(read("src/components/landing/heroChallenge.css"), /pointer:coarse\)\{\s*\.hc-card__form \.ib-input\{font-size:16px\}\s*\.hc-card__close\{width:44px;height:44px/)
  assert.match(read("src/styles/consent.css"), /pointer:coarse\)\{\.cb-consent \.ib-btn\{height:44px/)   // the panel; the banner is 44px everywhere
})
