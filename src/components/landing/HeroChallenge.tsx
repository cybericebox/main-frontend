"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
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
const MODAL_DELAY_MS = 1200
/* where a +100 team lands in the demo ranking, and its result */
const RANK = { place: 13, points: 100, flags: 1 }
const TOTAL = 43
const SOLVED_BEFORE = 3

const COMPACT_QUERY = "(max-width: 640px), (pointer: coarse)"

/* display text of the window address: this year's event on the event domain (not a link) */
const eventHost = (year: number, host: string) => "ctf" + year + "." + host + "/challenges"
const SSR_URL = eventHost(new Date().getFullYear(), EVENT_DOMAIN)

/* category and tile texts: landing.ch.cats.<cat>, landing.ch.tiles.<name> */
const CATS = ["web", "pwn", "crypto", "forensics"]
/* 8 tiles (2 rows); the warm-up tile (`warm`) is a real button and takes the warm-up texts; ≤640px shows the first 6 */
const TILES: { cat: string; name: string; points: number; solved?: boolean; warm?: boolean }[] = [
  { cat: "web", name: "jwt", points: 250, solved: true },
  { cat: "", name: "warm", points: 100, warm: true }, // 2nd: never cut off when the window bleeds off the right edge
  { cat: "web", name: "idor", points: 150 },
  { cat: "crypto", name: "rsa", points: 300, solved: true },
  { cat: "pwn", name: "fmt", points: 350 },
  { cat: "forensics", name: "pcap", points: 200, solved: true },
  { cat: "crypto", name: "oracle", points: 400 },
  { cat: "pwn", name: "rop", points: 450 },
]

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
}

const CHECK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export function HeroChallenge() {
  const [url, setUrl] = useState(SSR_URL)
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(false)
  const [card, setCard] = useState(false)
  const [modal, setModal] = useState(false)
  const [compact, setCompact] = useState(false)
  const timerRef = useRef(0)
  const openerRef = useRef<HTMLElement | null>(null)
  const tryRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)
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
      window.clearTimeout(timerRef.current)
      mq.removeEventListener("change", onMq)
    }
  }, [])

  const openCard = (from: HTMLElement) => {
    openerRef.current = from
    setCard(true)
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
    setChecking(true)
    const ok = await sha256Hex(v)
      .then((h) => h === WARMUP_SHA256)
      .catch(() => false) // no WebCrypto (insecure context) — cannot verify
    setChecking(false)
    if (!ok) return setError(t("landing.warmup.wrong"))
    setError("")
    setDone(true)
    try {
      sessionStorage.setItem(STORAGE_WARMUP_SOLVED, "1")
    } catch {
      // storage blocked — the solved state just won't survive a reload
    }
    window.dispatchEvent(new CustomEvent(SOLVED_EVENT))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    timerRef.current = window.setTimeout(
      () => {
        setCard(false)
        setModal(true)
      },
      reduce ? 0 : MODAL_DELAY_MS,
    )
  }

  const closeModal = () => setModal(false)
  // «Увійти» only when the API answered and nobody is signed in — the next step after the
  // warm-up is real events, which need an account.
  const api = useApi()
  const canSignIn = api.status === "up" && !api.me

  const cardInner = (
    <>
      <header className="hc-card__head">
        <div>
          <small>{t("landing.ch.cat")}</small>
          <h2 id="warmup-title">{t("landing.ch.title")}</h2>
        </div>
        {done ? (
          <p className="hc-card__done">
            {CHECK}
            {t("landing.ch.solved")}
          </p>
        ) : (
          <p className="hc-card__pts">
            <b className="ib-num">{t("landing.ch.pointsValue", { points: RANK.points })}</b>
            <span>{t("landing.ch.points")}</span>
          </p>
        )}
        <button type="button" className="ib-icon-btn ib-icon-btn--sm hc-card__close" aria-label={t("common.close")} onClick={() => closeCard()}>
          <Icon name="x" />
        </button>
      </header>
      <div className="hc-card__body">
        <p>
          {tRich("landing.ch.text", { source: <code>view-source</code> })}
        </p>
        <dl className="hc-card__kv">
          <dt>{t("landing.ch.format")}</dt>
          <dd className="ib-num">{t("landing.ch.formatValue")}</dd>
          <dt>{t("landing.ch.reward")}</dt>
          <dd>{t("landing.ch.rewardValue")}</dd>
        </dl>
        <form className="hc-card__form" autoComplete="off" noValidate onSubmit={submit}>
          <label className="hc-card__label" htmlFor="warmup-flag">
            {t("landing.ch.flag")}
          </label>
          <input
            ref={inputRef}
            className="ib-input ib-input--mono"
            id="warmup-flag"
            name="flag"
            placeholder={t("landing.ch.flagPlaceholder")}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="warmup-msg"
            // sheet: keep the field in view inside the (keyboard-shortened) sheet
            onFocus={compact ? (e) => e.currentTarget.scrollIntoView({ block: "nearest" }) : undefined}
            aria-invalid={error ? true : undefined}
            disabled={done}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError("")
            }}
          />
          <Button type="submit" variant="primary" disabled={done || checking} aria-busy={checking || undefined}>
            {checking ? <BrandLoading inline label={t("common.loading")} /> : null}
            {t("landing.warmup.submit")}
          </Button>
        </form>
        <p id="warmup-msg" className={"hc-card__msg" + (error ? " is-error" : done ? " ib-status ib-status--ok" : "")} role={error ? "alert" : "status"}>
          {error || (done ? t("landing.ch.solvedPlace", { place: RANK.place }) : "")}
        </p>
      </div>
    </>
  )

  return (
    <>
      <div className="pl-main">
        <h1 id="hero-h">{tRich("landing.hero.headline", { contests: <span className="pl-nowrap">{t("landing.hero.contests")}</span> })}</h1>
        <p className="pl-sub">{t("landing.hero.subhead")}</p>
        <div className="pl-actions">
          <button
            ref={tryRef}
            type="button"
            className={buttonClass({ variant: "primary", className: done ? "is-done" : undefined })}
            aria-expanded={card}
            aria-controls={card ? "warmup-card" : undefined}
            onClick={(e) => (card ? closeCard(false) : openCard(e.currentTarget))}
          >
            {done ? t("landing.ch.tryDone") : t("landing.ch.try")}
            {done ? CHECK : null}
          </button>
          <Button href="#labs">{t("landing.nav.labs")}</Button>
        </div>
      </div>

      <div className="pl-side">
        <div className={"hc" + (done ? " is-solved" : "") + (card ? " is-open" : "")}>
          {/* the event app: an illustration, except the «Розминка» tile, which opens the card */}
          <div
            className="hc-win"
            onClick={(e) => {
              if (card && !(e.target as Element).closest(".hc-tile.is-warm")) closeCard()
            }}
          >
            <div className="hc-win__bar" aria-hidden="true">
              <span>{url}</span>
            </div>
            <div className="hc-board">
              <div className="hc-board__head" aria-hidden="true">
                <h3>{t("landing.ch.board")}</h3>
                <span>
                  {tRich("landing.ch.solvedOf", {
                    count: <span className="ib-num">{t("landing.ch.count", { solved: SOLVED_BEFORE + (done ? 1 : 0), total: TOTAL })}</span>,
                  })}
                </span>
              </div>
              <div className="hc-board__cats" aria-hidden="true">
                <b className="is-on">{t("landing.ch.all")}</b>
                {CATS.map((c) => (
                  <b key={c}>{t(`landing.ch.cats.${c}`)}</b>
                ))}
              </div>
              <div className="hc-tiles">
                {TILES.map((x) => {
                  const solved = x.solved || (x.warm && done)
                  const cls = "hc-tile" + (solved ? " is-solved" : "") + (x.warm ? " is-warm" : "")
                  const inner = (
                    <>
                      <small>{x.warm ? t("landing.ch.cat") : t(`landing.ch.cats.${x.cat}`)}</small>
                      <b>{x.warm ? t("landing.ch.title") : t(`landing.ch.tiles.${x.name}`)}</b>
                      <span className="ib-num">
                        {solved ? CHECK : null}
                        {x.points}
                      </span>
                    </>
                  )
                  return x.warm ? (
                    <button
                      key="warm"
                      type="button"
                      className={cls}
                      aria-expanded={card}
                      aria-controls={card ? "warmup-card" : undefined}
                      onClick={(e) => (card ? undefined : openCard(e.currentTarget))}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={x.name} className={cls} aria-hidden="true">
                      {inner}
                    </div>
                  )
                })}
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
        description={t("landing.warmup.modalText")}
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
        <dl className="pl-stats">
          <div>
            <dt>{t("landing.warmup.statPlace")}</dt>
            <dd className="ib-num">{RANK.place}</dd>
          </div>
          <div>
            <dt>{t("landing.warmup.statPoints")}</dt>
            <dd className="ib-num">{RANK.points}</dd>
          </div>
          <div>
            <dt>{t("landing.warmup.statFlags")}</dt>
            <dd className="ib-num">{RANK.flags}</dd>
          </div>
        </dl>
      </Modal>
    </>
  )
}
