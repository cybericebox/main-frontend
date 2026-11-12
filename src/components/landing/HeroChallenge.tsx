"use client"

import { functionalAllowed } from "@/lib/consent"
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react"
import { ChevronDown, Network, Tag } from "lucide-react"
import { Button, buttonClass } from "@/components/ib/Button"
import { Icon } from "@/components/ib/Icon"
import { Modal } from "@/components/ib/Modal"
import { BrandLoading } from "@/components/site/BrandLoading"
import { t, tRich } from "@/i18n/t"
import { WARMUP_SHA256 } from "@/lib/warmup.generated"
import { useApi } from "@/lib/useApi"
import { idUrl } from "@/lib/auth"
import { EVENT_DOMAIN, SIGN_IN_URI } from "@/lib/links"
import "@/styles/ds/components/icon-button.css"
import "@/styles/ds/components/input.css"
import "@/styles/ds/components/status-text.css"
import "./heroChallenge.css"
import { TEAMS, burst, fly, useDemoRating, useRoll } from "./heroRating"
import { FLAG as DEMO_FLAG } from "./labScene"
import { STORAGE_WARMUP_SOLVED } from "@/lib/storageKeys"

// Hero content (both columns). Left: headline, subhead, «Спробувати розминку» + «Лабораторії».
// The card is an overlay anchored to the window: opening/closing never shifts the layout.
// Right: an event app window with the challenges board. The «Розминка» challenge opens as a card over
// the board (from the left button or the «Розминка» tile), like a challenge in the event app; it holds
// the real warm-up form. The flag never ships: it is set at build time (scripts/warmup.mjs) and the page
// only knows its SHA-256. Trail: the HTML comment in the hero → robots.txt → /.well-known/ice/warmup.txt.
// A correct flag marks the tile solved, remembers it for the session (sessionStorage) and, after a short
// pause, closes the card and opens the «accepted» dialog. No registration offer (no users to register yet).
// Phones / touch screens: the card sits below the fold and the on-screen keyboard would cover it, so there it
// opens as a bottom sheet (native modal <dialog>) kept above the keyboard via visualViewport.

export const WARMUP_COMMENT = `<!-- ${t("landing.warmup.trail")} -->`
const SOLVED_EVENT = "ib:warmup-solved"
/* A solve this fast means the visitor already knew the flag: only then the dialog names the time (and smiles). */
const FAST_SOLVE_S = 30

const COMPACT_QUERY = "(max-width: 640px), (pointer: coarse)"

/* display text of the window address: this year's event on the event domain (not a link) */
const eventHost = (year: number, host: string) => "ctf" + year + "." + host
const URL_PATH = "/challenges"
const SSR_URL = eventHost(new Date().getFullYear(), EVENT_DOMAIN)

/* The board mirrors the participant board of the event app (event-frontend ChallengeTile.tsx, BoardFilterBar.tsx):
   a tile = name, difficulty, a lab mark, points; solved = green with the points earned.
   Tile texts: landing.ch.tiles.<name>, landing.ch.diff.<diff>. */
type Tile = { name: string; diff: "elementary" | "easy" | "medium" | "hard"; points: number; solved?: boolean; lab?: boolean; warm?: boolean }
/* 8 tiles (2 rows); the warm-up tile (`warm`) is a real button and takes the warm-up texts; ≤640px shows the first 4 */
const TILES: Tile[] = [
  { name: "jwt", diff: "medium", points: 250, solved: true },
  { name: "warm", diff: "elementary", points: 100, warm: true }, // 2nd: never cut off when the window bleeds off the right edge
  { name: "idor", diff: "easy", points: 150, lab: true },
  { name: "rsa", diff: "medium", points: 300, solved: true },
  { name: "fmt", diff: "hard", points: 350 },
  { name: "pcap", diff: "easy", points: 200, solved: true },
  { name: "oracle", diff: "hard", points: 400 },
  { name: "rop", diff: "hard", points: 450, lab: true },
]
const WARM = TILES.find((x) => x.warm)!
/* where a +100 team lands in the demo ranking, and its result */
const RANK = { place: 7, points: WARM.points }
const TOTAL = 43
const SOLVED_BEFORE = 3

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
}

const CHECK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

// The console lines end with a smile, so the teasing stays friendly. Emoji live here, not in the messages:
// the catalogs hold only glyphs the page font has (tests/glyphs.test.ts), and the console uses its own font.
const WINK = "\u{1F609}"
const SMILE = "\u{1F642}"
const smiling = (text: string, face: string) => `${text} ${face}`

const tilePoints = (tile: string) => TILES.find((x) => x.name === tile)?.points ?? 0

/* a result number that counts up while its dialog is open */
function RollStat({ from, to, active }: { from: number; to: number; active: boolean }) {
  return <dd className="ib-num">{useRoll(active ? to : from, true, 1100)}</dd>
}

export function HeroChallenge() {
  const [url, setUrl] = useState(SSR_URL)
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(false)
  const [card, setCard] = useState(false)
  const [modal, setModal] = useState(false)
  const [compact, setCompact] = useState(false)
  const openerRef = useRef<HTMLElement | null>(null)
  const tryRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)
  const hcRef = useRef<HTMLDivElement>(null)
  const rating = useDemoRating(hcRef, tilePoints)
  // solved in this visit (not restored from the session): only then the reward plays
  const [fresh, setFresh] = useState(false)
  // seconds from the first opening of the warm-up to the accepted flag, when that was fast (see FAST_SOLVE_S)
  const [fastSeconds, setFastSeconds] = useState<number | null>(null)
  const ownPlace = useRoll(done ? RANK.place : TOTAL, fresh, 900)
  const ownPoints = useRoll(done ? RANK.points : 0, fresh, 900)
  useEffect(() => {
    doneRef.current = done
  }, [done])
  /* the window shows this year's event on the visitor's host; solved state survives a reload */
  useEffect(() => {
    setUrl(eventHost(new Date().getFullYear(), EVENT_DOMAIN))
    try {
      if (sessionStorage.getItem(STORAGE_WARMUP_SOLVED) === "1") setDone(true)
    } catch {
      // storage blocked — start fresh
    }
    const mq = window.matchMedia(COMPACT_QUERY)
    const onMq = () => setCompact(mq.matches)
    onMq()
    mq.addEventListener("change", onMq)
    return () => {
      mq.removeEventListener("change", onMq)
    }
  }, [])

  /* Easter eggs for those who look in the developer tools instead of the page code. They appear the first time
     the warm-up is opened, never on page load: a line in the console and a request named flag.txt in Network
     (public/flag.txt says it is not the flag). */
  const teasedRef = useRef(false)
  const startedRef = useRef(0) // when the warm-up was first opened on this page
  const tease = () => {
    if (teasedRef.current) return
    teasedRef.current = true
    startedRef.current = Date.now()
    console.info(smiling(t("landing.console.hint"), WINK))
    void fetch("/flag.txt", { priority: "low" }).catch(() => {})
  }
  const openCard = (from: HTMLElement) => {
    openerRef.current = from
    setCard(true)
    tease()
  }
  const closeCard = (restore = true) => {
    setCard(false)
    if (restore) openerRef.current?.focus()
  }

  /* opened: focus the flag field (or the card itself when solved); Esc closes */
  useEffect(() => {
    if (!card) return
    // sheet: a native modal dialog (top layer, focus trap, Esc/backdrop close it — see onSheetClose)
    const el = cardRef.current
    if (el instanceof HTMLDialogElement && !el.open) el.showModal()
    // the card overlays the window: nothing moves, and focusing must not scroll the page either
    if (doneRef.current) cardRef.current?.focus({ preventScroll: true })
    else inputRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
        setCard(false)
        openerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [card])

  /* sheet: sit on top of the on-screen keyboard (the visual viewport shrinks, the layout one may not) */
  useEffect(() => {
    const vv = window.visualViewport
    const el = cardRef.current
    if (!card || !compact || !vv || !el) return
    const place = () => el.style.setProperty("--hc-kb", Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px")
    place()
    vv.addEventListener("resize", place)
    vv.addEventListener("scroll", place)
    return () => {
      vv.removeEventListener("resize", place)
      vv.removeEventListener("scroll", place)
    }
  }, [card, compact])

  const onSheetClose = () => {
    // Esc / backdrop / programmatic close of the native dialog
    if (!cardRef.current?.isConnected) return
    setCard(false)
    openerRef.current?.focus()
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (checking || done) return
    const v = value.trim()
    if (!v) return setError(t("landing.warmup.empty"))
    // the flag of the lab demo one screen down (labScene.FLAG, the one place it is defined): copied, not solved
    if (v === DEMO_FLAG) {
      console.info(smiling(t("landing.console.demoFlag"), SMILE))
      return setError(t("landing.warmup.demoFlag"))
    }
    setChecking(true)
    const ok = await sha256Hex(v)
      .then((h) => h === WARMUP_SHA256)
      .catch(() => false) // no WebCrypto (insecure context) — cannot verify
    setChecking(false)
    if (!ok) return setError(t("landing.warmup.wrong"))
    setError("")
    // the time is kept in memory only (never in storage): it needs no consent and ends with the page
    const started = startedRef.current
    const seconds = Math.max(1, Math.round((Date.now() - started) / 1000))
    if (started > 0 && seconds <= FAST_SOLVE_S) setFastSeconds(seconds)
    setFresh(true)
    setDone(true)
    const hc = hcRef.current
    if (hc) void fly(hc, hc.querySelector(".hc-tile.is-warm"), hc.querySelector(".hc-rk__row--own .hc-rk__pts"), t("landing.ch.pointsValue", { points: RANK.points }), true)
    try {
      // functional storage: the solved state is kept only with functional consent
      if (functionalAllowed()) sessionStorage.setItem(STORAGE_WARMUP_SOLVED, "1")
    } catch {
      // storage blocked — the solved state just won't survive a reload
    }
    window.dispatchEvent(new CustomEvent(SOLVED_EVENT))
    // One message, not two: the card closes at once, the screen dims and the ice box opens (heroRating.burst),
    // then the result dialog opens on the same dim.
    setCard(false)
    await burst(WARM.points)
    setModal(true)
  }

  const closeModal = () => setModal(false)
  // «Увійти» only when the API answered and nobody is signed in — the next step after the
  // warm-up is real events, which need an account.
  const api = useApi()
  const canSignIn = api.status === "up" && !api.me

  // The card mirrors the challenge dialog of the event app (event-frontend ChallengeModal.tsx): title, a meta line
  // (points, difficulty, state), the task, then the answer block on paper. Solved: the green result takes its place.
  const cardInner = (
    <>
      <header className="hc-card__head">
        <h2 id="warmup-title">{t("landing.ch.title")}</h2>
        <p className="hc-card__meta">
          <span className="ib-num">{t("landing.ch.pointsFull", { points: RANK.points })}</span>
          <span className="hc-tag">{t(`landing.ch.diff.${WARM.diff}`)}</span>
          {done ? (
            <span className="hc-tag hc-tag--ok">
              {CHECK}
              {t("landing.ch.solved")}
            </span>
          ) : null}
        </p>
        <button type="button" className="ib-icon-btn ib-icon-btn--sm hc-card__close" aria-label={t("common.close")} onClick={() => closeCard()}>
          <Icon name="x" />
        </button>
      </header>
      <div className="hc-card__body">
        {done ? (
          <p>
            {t("landing.ch.solvedText")}
            {/* its own line */}
            <span>{t("landing.ch.solvedNext")}</span>
          </p>
        ) : (
          <p>{tRich("landing.ch.text", { source: <code>view-source</code> })}</p>
        )}
      </div>
      {done ? (
        <div className="hc-card__flag">
          <p className="hc-card__ok" role="status">
            {CHECK}
            <b>{t("landing.ch.solved")}</b>
            <span className="ib-num">{t("landing.ch.pointsValue", { points: RANK.points })}</span>
          </p>
          <p id="warmup-msg" className="hc-card__msg">
            {t("landing.ch.solvedPlace", { place: RANK.place, beaten: TOTAL - RANK.place })}
          </p>
        </div>
      ) : (
        <form className="hc-card__flag hc-card__form" autoComplete="off" noValidate onSubmit={submit}>
          <label className="hc-card__label" htmlFor="warmup-flag">
            {t("landing.ch.flag")}
          </label>
          <div className="hc-card__field">
            <input
              ref={inputRef}
              className="ib-input ib-input--mono"
              id="warmup-flag"
              name="flag"
              placeholder={t("landing.ch.flagPlaceholder")}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={error ? "warmup-error" : undefined}
              // sheet: keep the field in view inside the (keyboard-shortened) sheet
              onFocus={compact ? (e) => e.currentTarget.scrollIntoView({ block: "nearest" }) : undefined}
              aria-invalid={error ? true : undefined}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError("")
              }}
            />
            {error && <p id="warmup-error" className="hc-card__field-error" role="alert">{error}</p>}
          </div>
          <Button type="submit" variant="primary" aria-disabled={checking || undefined} aria-busy={checking || undefined}>
              {/* both labels share one cell, so the button keeps the width of the longer one */}
              <span className="hc-card__submit">
                <span className={checking ? "is-off" : undefined}>{t("landing.warmup.submit")}</span>
                <span className={checking ? undefined : "is-off"}>
                  {checking ? <BrandLoading inline label={t("landing.warmup.checking")} /> : null}
                  {t("landing.warmup.checking")}
                </span>
              </span>
            </Button>
        </form>
      )}
    </>
  )

  return (
    <>
      <div className="pl-main">
        <h1 id="hero-h">{tRich("landing.hero.headline", { contests: <span className="pl-nowrap">{t("landing.hero.contests")}</span> })}</h1>
        <p className="pl-sub">
          {t("landing.hero.subhead")}
          {/* its own line: the second sentence never starts at the end of the first one's line */}
          <span>{t("landing.hero.subheadOpen")}</span>
        </p>
        <div className="pl-actions">
          <button
            ref={tryRef}
            type="button"
            className={buttonClass({ variant: "primary", className: done ? "is-done" : undefined })}
            aria-expanded={card}
            aria-controls={card ? "warmup-card" : undefined}
            onClick={(e) => (card ? closeCard(false) : openCard(e.currentTarget))}
          >
            {/* solved: the button speaks the language of a solved tile — green, a check, the points earned */}
            {done ? CHECK : null}
            {done ? t("landing.ch.tryDone") : t("landing.ch.try")}
            {done ? <span className="ib-num">{t("landing.ch.pointsValue", { points: RANK.points })}</span> : null}
          </button>
          <Button href="#labs">{t("landing.nav.labs")}</Button>
        </div>
      </div>

      <div className="pl-side">
        <div ref={hcRef} className={"hc" + (done ? " is-solved" : "") + (card ? " is-open" : "")}>
          {/* the event app: an illustration, except the «Розминка» tile, which opens the card */}
          <div
            className="hc-win"
            onClick={(e) => {
              if (card && !(e.target as Element).closest(".hc-tile.is-warm")) closeCard()
            }}
          >
            <div className="hc-win__bar" aria-hidden="true">
              {/* phones drop the path, so the host is never cut */}
              <span>
                {url}
                <span className="hc-win__path">{URL_PATH}</span>
              </span>
            </div>
            <div className="hc-board">
              <div className="hc-board__head" aria-hidden="true">
                <h3>{t("landing.ch.board")}</h3>
                <span>
                  {tRich("landing.ch.solvedOf", {
                    count: tRich("landing.ch.count", {
                      solved: (
                        <span key={done ? "solved" : "open"} className={"ib-num" + (fresh ? " hc-roll" : "")}>
                          {SOLVED_BEFORE + (done ? 1 : 0)}
                        </span>
                      ),
                      total: <span className="ib-num">{TOTAL}</span>,
                    }),
                  })}
                </span>
              </div>
              {/* the filter bar of the event board: an illustration, nothing is pressed */}
              <div className="hc-board__filters" aria-hidden="true">
                <div className="hc-seg">
                  <b>{t("landing.ch.filter.open")}</b>
                  <b>{t("landing.ch.filter.solved")}</b>
                  <b className="is-on">{t("landing.ch.all")}</b>
                </div>
                <span className="hc-select">
                  <Tag aria-hidden="true" />
                  <span>
                    <small>{t("landing.ch.group")}</small> {t("landing.ch.allGroups")}
                  </span>
                  <ChevronDown aria-hidden="true" />
                </span>
              </div>
              <div className="hc-tiles">
                {TILES.map((x) => {
                  const solved = x.solved || (x.warm && done)
                  const cls = "hc-tile" + (solved ? " is-solved" : "") + (x.warm ? " is-warm" : "") + (!x.warm && rating.hit === x.name ? " is-hit" : "") + (x.warm && fresh ? " is-just" : "")
                  const inner = (
                    <>
                      <span className="hc-tile__main">
                        <span className="hc-tile__name">{x.warm ? t("landing.ch.title") : t(`landing.ch.tiles.${x.name}`)}</span>
                        <span className="hc-tile__diff">{t(`landing.ch.diff.${x.diff}`)}</span>
                      </span>
                      <span className="hc-tile__score">
                        {/* the task has its own infrastructure: the project-wide mark for it is lucide Network */}
                        {x.lab ? <Network className="hc-tile__lab" aria-hidden="true" /> : null}
                        <span className="hc-tile__pts">{solved ? t("landing.ch.pointsValue", { points: x.points }) : x.points}</span>
                      </span>
                    </>
                  )
                  return x.warm ? (
                    <button
                      key="warm"
                      type="button"
                      className={cls}
                      data-tile={x.name}
                      aria-expanded={card}
                      aria-controls={card ? "warmup-card" : undefined}
                      onClick={(e) => (card ? undefined : openCard(e.currentTarget))}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={x.name} className={cls} data-tile={x.name} aria-hidden="true">
                      {inner}
                    </div>
                  )
                })}
              </div>
              {/* other teams: a decorative demo rating, never touches the warm-up state or the counter;
                  the last row is the visitor's own team, which comes alive once the warm-up is solved */}
              <div className="hc-rk" aria-hidden="true">
                <p className="hc-rk__cap">{t("landing.ch.rating")}</p>
                <div className="hc-rk__list">
                  {TEAMS.map((team) => (
                    <RatingRow
                      key={team.id}
                      team={team.id}
                      rank={rating.ranks[team.id]}
                      points={rating.points[team.id]}
                      note={
                        rating.last?.event.team === team.id
                          ? t("landing.ch.ratingNote", { points: tilePoints(rating.last.event.tile), task: t(`landing.ch.tiles.${rating.last.event.tile}`) })
                          : ""
                      }
                    />
                  ))}
                  <div className={"hc-rk__row hc-rk__row--own" + (done ? " is-in" : "") + (fresh && done ? " is-new" : "")}>
                    <span className="hc-rk__place ib-num">{done ? ownPlace : t("landing.ch.noPlace")}</span>
                    <b>{t("landing.ch.ownTeam")}</b>
                    <span className="hc-rk__note">{fresh && done ? t("landing.ch.ratingNote", { points: RANK.points, task: t("landing.ch.title") }) : ""}</span>
                    <span className="hc-rk__pts ib-num">{ownPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* the opened warm-up challenge: a non-blocking dialog over the board (desktop) */}
          {card && !compact ? (
            <section ref={cardRef} className="hc-card" id="warmup-card" role="dialog" aria-modal="false" aria-labelledby="warmup-title" tabIndex={-1}>
              {cardInner}
            </section>
          ) : null}
        </div>
      </div>

      {/* phones / touch: the same card as a bottom sheet */}
      {card && compact ? (
        <dialog
          ref={(el) => {
            cardRef.current = el
          }}
          className="hc-card hc-card--sheet"
          id="warmup-card"
          aria-labelledby="warmup-title"
          tabIndex={-1}
          onClose={onSheetClose}
          onClick={(e) => {
            if (e.target === e.currentTarget) e.currentTarget.close()
          }}
        >
          {cardInner}
        </dialog>
      ) : null}

      <Modal
        open={modal}
        onClose={closeModal}
        title={t("landing.warmup.modalTitle")}
        description={
          <>
            {fastSeconds === null ? t("landing.warmup.modalText") : t("landing.warmup.modalFast", { seconds: fastSeconds })}
            {/* its own line */}
            <span>{t("landing.ch.solvedNext")}</span>
          </>
        }
        // the card is closed by now — focus goes back to «Розминку пройдено»
        returnFocus={() => tryRef.current}
        actions={
          <>
            <Button variant={canSignIn ? "ghost" : "primary"} onClick={closeModal}>
              {t("common.close")}
            </Button>
            {canSignIn ? (
              <Button variant="primary" href={idUrl(SIGN_IN_URI)}>
                {t("common.signIn")}
              </Button>
            ) : null}
          </>
        }
      >
        <div className="pl-won">
          <p className="pl-won__flag ib-num">{value.trim()}</p>
          <dl className="pl-stats">
            <div>
              <dt>{t("landing.warmup.statPlace")}</dt>
              <RollStat from={TOTAL} to={RANK.place} active={modal} />
            </div>
            <div>
              <dt>{t("landing.warmup.statBeaten")}</dt>
              <RollStat from={0} to={TOTAL - RANK.place} active={modal} />
            </div>
            <div>
              <dt>{t("landing.warmup.statPoints")}</dt>
              <RollStat from={0} to={RANK.points} active={modal} />
            </div>
          </dl>
        </div>
      </Modal>
    </>
  )
}

/* one team of the demo rating: it keeps its DOM place and travels to its rank (--hc-i) */
function RatingRow({ team, rank, points, note }: { team: string; rank: number; points: number; note: string }) {
  const shown = useRoll(points)
  return (
    <div className={"hc-rk__row" + (note ? " is-new" : "")} data-team={team} data-rank={rank} style={{ "--hc-i": rank } as CSSProperties}>
      <span className="hc-rk__place ib-num">{rank + 1}</span>
      <b>{t(`landing.ch.feed.team.${team}`)}</b>
      <span className="hc-rk__note">{note}</span>
      <span className="hc-rk__pts ib-num">{shown}</span>
    </div>
  )
}
