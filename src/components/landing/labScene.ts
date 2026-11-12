// The landing lab demo: two schemes on one base. The shared part stays in place and shows the two separate ways in:
// the VPN (your PC → vpn-gw → r1 → the whole network) and external access (browser → access → one host directly,
// never through the VPN gateway or the router); «Змагання» adds a DMZ and an internal network to attack, «Навчання» adds one server to set up and
// the automatic checker. Pure data and state here (no React, no DOM), so node --test reads it directly.

export type Mode = "ctf" | "learn"
export const MODES: Mode[] = ["ctf", "learn"]
export const other = (mode: Mode): Mode => (mode === "ctf" ? "learn" : "ctf")

export const LAB = "lab-07"
export const LAB_CIDR = "10.10.0.0/16"
/* the demo flag: shown in the terminal and the outcome; the warm-up form (HeroChallenge) recognises it and teases */
export const FLAG = "ICE{p1v0t_thr0ugh_dmz}"
export const FLAG_POINTS = 400
export const STEPS = 4

/* text of a label: a literal (host names, ports, addresses) or a message key with variables */
export type Label = string | { key: string; vars?: Record<string, string> }
const k = (key: string, vars?: Record<string, string>): Label => ({ key: `landing.labs.${key}`, vars })

export type Zone = { id: string; kind: "zone" | "subnet"; x: number; y: number; w: number; h: number; label: Label; lx: number; ly: number; mode?: Mode }
export type Node = { id: string; x: number; y: number; w: number; h: number; name: Label; addr: Label; port?: string; mode?: Mode }
export type Path = { id: string; d: string; mode?: Mode }
export type Seg = Path & { packet?: string }
export type Scheme = {
  id: "wide" | "tall"
  w: number
  h: number
  zones: Zone[]
  links: Path[]
  segs: Seg[]
  probe: { d: string; x: number; y: number }
  notes: { id: string; text: Label; x: number; y: number }[]
  nodes: Node[]
}

const DMZ = "10.10.1.0/24"
const INTERNAL = "10.10.2.0/24"
const LAN = "10.10.3.0/24"
const SRV_PORTS = ":22 :23 :80"
export const SRV_PORTS_FIXED = ":22 :80"

const base = (pos: Record<string, [number, number, number, number]>): Node[] =>
  [
    { id: "you", name: k("topoYou"), addr: "10.66.0.7" },
    { id: "vpn", name: "vpn-gw", addr: "udp 51820" },
    { id: "r1", name: "r1", addr: "10.10.0.1" },
    { id: "web", name: "web", addr: "10.10.1.10", port: ":80 :443", mode: "ctf" as const },
    { id: "db", name: "db", addr: "10.10.2.20", port: ":5432", mode: "ctf" as const },
    { id: "files", name: "files", addr: "10.10.2.31", port: ":445", mode: "ctf" as const },
    { id: "srv", name: "srv", addr: "10.10.3.10", port: SRV_PORTS, mode: "learn" as const },
    { id: "check", name: k("topoCheck"), addr: k("topoCheckAuto"), mode: "learn" as const },
    { id: "browser", name: k("topoBrowser"), addr: "https" },
    { id: "proxy", name: k("topoAccess"), addr: k("topoAccessWhat") },
  ].map((n) => ({ ...n, x: pos[n.id][0], y: pos[n.id][1], w: pos[n.id][2], h: pos[n.id][3] }))

/* from 641px: the wide layout, scales down with its column */
export const WIDE: Scheme = {
  id: "wide",
  w: 720,
  h: 440,
  zones: [
    { id: "perimeter", kind: "zone", x: 168.5, y: 16.5, w: 535, h: 407, label: k("topoPerimeter"), lx: 184, ly: 38 },
    { id: "dmz", kind: "subnet", x: 476.5, y: 44.5, w: 212, h: 120, label: k("topoDmz", { cidr: DMZ }), lx: 492, ly: 66, mode: "ctf" },
    { id: "internal", kind: "subnet", x: 476.5, y: 220.5, w: 212, h: 188, label: k("topoInternal", { cidr: INTERNAL }), lx: 492, ly: 242, mode: "ctf" },
    { id: "lan", kind: "subnet", x: 476.5, y: 44.5, w: 212, h: 120, label: k("topoLan", { cidr: LAN }), lx: 492, ly: 66, mode: "learn" },
  ],
  links: [
    { id: "l1", d: "M144 96H192" },
    { id: "l2", d: "M316 96H496" }, // straight into the host
    { id: "l3", d: "M448 224H460V294H496", mode: "ctf" },
    { id: "l4", d: "M460 294V370H496", mode: "ctf" },
    { id: "lc", d: "M584 300V140", mode: "learn" },
  ],
  segs: [
    { id: "a", d: "M144 360H192" },
    { id: "b", d: "M316 360H400V248" },
    { id: "c", d: "M448 224H460V126H496" },
    { id: "p", d: "M460 224V294H496", packet: "M496 126H460V294H496", mode: "ctf" },
  ],
  probe: { d: "M584 300V140", x: 596, y: 226 },
  notes: [
    { id: "wg0", text: "wg0", x: 408, y: 300 },
    { id: "http", text: "web", x: 380, y: 88 },
  ],
  nodes: base({
    you: [16, 336, 127, 48], vpn: [192, 336, 123, 48], r1: [352, 200, 95, 48],
    web: [496, 84, 176, 56], db: [496, 266, 176, 56], files: [496, 342, 176, 56],
    srv: [496, 84, 176, 56], check: [496, 300, 176, 56],
    browser: [16, 72, 127, 48], proxy: [192, 72, 123, 48],
  }),
}

/* phones: a compact column — the two subnets side by side, so the terminal and the scheme fit one screen */
export const TALL: Scheme = {
  id: "tall",
  w: 340,
  h: 372,
  zones: [
    { id: "perimeter", kind: "zone", x: 6.5, y: 72.5, w: 327, h: 292, label: k("topoPerimeter"), lx: 18, ly: 90 },
    { id: "dmz", kind: "subnet", x: 14.5, y: 222.5, w: 150, h: 134, label: k("topoDmz", { cidr: DMZ }), lx: 24, ly: 346, mode: "ctf" }, // label under the host: two lines come in from above
    { id: "internal", kind: "subnet", x: 176.5, y: 222.5, w: 150, h: 134, label: k("topoInternalShort", { cidr: INTERNAL }), lx: 186, ly: 240, mode: "ctf" },
    { id: "lan", kind: "subnet", x: 14.5, y: 222.5, w: 150, h: 134, label: k("topoLanShort", { cidr: LAN }), lx: 24, ly: 346, mode: "learn" },
  ],
  links: [
    { id: "l1", d: "M87 56V98" },
    { id: "l2", d: "M60 142V248" }, // straight into the host
    { id: "l3", d: "M170 204V272H184", mode: "ctf" },
    { id: "l4", d: "M170 272V324H184", mode: "ctf" },
    { id: "lc", d: "M184 272H156", mode: "learn" },
  ],
  segs: [
    { id: "a", d: "M253 56V98" },
    { id: "b", d: "M253 142V160" },
    { id: "c", d: "M150 182H120V248" },
    { id: "p", d: "M170 204V272H184", mode: "ctf" },
  ],
  probe: { d: "M184 272H156", x: 184, y: 316 },
  notes: [
    { id: "wg0", text: "wg0", x: 262, y: 155 },
    { id: "http", text: "web", x: 68, y: 200 },
  ],
  nodes: base({
    you: [178, 12, 150, 44], vpn: [184, 98, 144, 44], r1: [150, 160, 140, 44],
    web: [22, 248, 134, 48], db: [184, 250, 134, 44], files: [184, 302, 134, 44],
    srv: [22, 248, 134, 48], check: [184, 250, 134, 44],
    browser: [12, 12, 150, 44], proxy: [18, 98, 144, 44],
  }),
}

/* a feature row of the «Лабораторії» list lights up its part of the scheme */
export const FEATURES = ["wg", "net", "hosts", "proxy"] as const
export type Feature = (typeof FEATURES)[number]
export const LIT: Record<Feature, string[]> = {
  wg: ["you", "vpn", "seg-a", "seg-b", "note-wg0"],
  net: ["r1", "dmz", "internal", "lan", "l3", "l4", "seg-c", "seg-p"],
  hosts: ["web", "db", "files", "srv", "check", "lc", "note-probe"],
  proxy: ["browser", "proxy", "l1", "l2", "note-http"],
}

/* hosts that come up when the lab starts, in order */
export const bootOrder = (mode: Mode): string[] => ["vpn", "r1", "proxy", ...(mode === "ctf" ? ["web", "db", "files"] : ["srv", "check"])]

export type Line = { text: Label; kind?: "cmd" | "ok" }
export type Probe = { text: Label; ok: boolean }

/* everything the story changes on the card */
export type Scene = {
  booting: boolean
  boot: string[] // hosts still starting
  drawn: string[] // route segments drawn
  on: string[] // hosts on the route
  own: string[] // hosts taken (attack) or fixed (training)
  ping: string | null // host named by the command being typed
  flash: { id: string; ok: boolean } | null // the checker's verdict on a host
  lines: Line[]
  typing: boolean
  steps: number
  won: boolean // the flag is in
  wonNow: boolean // …in this run: the numbers count up
  probe: Probe | null
  srvPorts: string
}

export const emptyScene = (): Scene => ({
  booting: false, boot: [], drawn: [], on: [], own: [], ping: null, flash: null, lines: [], typing: false,
  steps: 0, won: false, wonNow: false, probe: null, srvPorts: SRV_PORTS,
})

const stepsVars = { done: String(STEPS), total: String(STEPS) }

/* the last frame of a mode: shown before the story starts, off screen and with reduced motion */
export function finalScene(mode: Mode): Scene {
  const scene = { ...emptyScene(), drawn: ["a", "b", "c"], on: ["vpn", "r1"] }
  if (mode === "ctf") {
    return {
      ...scene,
      drawn: [...scene.drawn, "p"],
      on: [...scene.on, "web", "db"],
      own: ["web", "db"],
      won: true,
      lines: [
        { text: "www@web:~$ psql -h 10.10.2.20 -U app", kind: "cmd" },
        { text: k("termDb") },
        { text: "app=> select flag from secrets;", kind: "cmd" },
        { text: FLAG, kind: "ok" },
      ],
    }
  }
  return {
    ...scene,
    on: [...scene.on, "srv", "check"],
    own: ["srv"],
    steps: STEPS,
    srvPorts: SRV_PORTS_FIXED,
    probe: { text: k("probeDone", stepsVars), ok: true },
    lines: [
      { text: "student@srv:~$ sudo ufw deny 23", kind: "cmd" },
      { text: "Rule added" },
      { text: "student@srv:~$ sudo passwd -l guest", kind: "cmd" },
      { text: k("termChecked", stepsVars), kind: "ok" },
    ],
  }
}

/* The story of a mode, as steps for the player (LabDemo). Every text the terminal shows is here. */
export type Step =
  | { do: "wait"; ms: number }
  | { do: "set"; patch: (scene: Scene) => Partial<Scene> }
  | { do: "type"; prompt: string; text: string; node?: string }
  | { do: "out"; line: Line }
  | { do: "draw"; seg: string }
  | { do: "packet"; path: string; back?: boolean }
  | { do: "boot" }
  | { do: "probe"; text: Label; ok: boolean }

const wait = (ms: number): Step => ({ do: "wait", ms })
const set = (patch: (scene: Scene) => Partial<Scene>): Step => ({ do: "set", patch })
const type = (prompt: string, text: string, node?: string): Step => ({ do: "type", prompt, text, node })
const out = (text: Label, kind?: Line["kind"]): Step => ({ do: "out", line: { text, kind } })
const draw = (seg: string): Step => ({ do: "draw", seg })
const packet = (path: string): Step => ({ do: "packet", path })
const on = (id: string): Step => set((s) => ({ on: [...s.on, id] }))
const own = (id: string): Step => set((s) => ({ own: [...s.own, id] }))
const steps = (n: number): Step => set(() => ({ steps: n }))

export function story(mode: Mode): Step[] {
  const start: Step[] = [
    { do: "boot" },
    type("$ ", "sudo wg-quick up ./lab-07.conf", "vpn"),
    out("interface: wg0   address: 10.66.0.7/32"),
    draw("a"), on("vpn"), draw("b"), on("r1"),
  ]
  if (mode === "ctf") {
    return [
      ...start,
      wait(400),
      type("$ ", "nmap -sV 10.10.1.10", "web"), draw("c"), packet("c"), out("80/tcp  open  http  nginx"), on("web"), wait(400),
      type("$ ", "ssh www@10.10.1.10", "web"), packet("c"), out("Welcome to web (10.10.1.10)"), own("web"), wait(400),
      type("www@web:~$ ", "psql -h 10.10.2.20 -U app", "db"), draw("p"), packet("p"), on("db"), out(k("termDb")), own("db"), wait(400),
      type("app=> ", "select flag from secrets;"), out(FLAG, "ok"), set(() => ({ won: true, wonNow: true })),
      wait(4500),
    ]
  }
  return [
    ...start,
    steps(1), wait(400),
    type("$ ", "ssh student@10.10.3.10", "srv"), draw("c"), packet("c"), out("Welcome to srv (10.10.3.10)"), on("srv"), steps(2), wait(300),
    on("check"), { do: "probe", text: k("probeOpen"), ok: false },
    type("student@srv:~$ ", "ss -tln"), out("LISTEN   :22   :23   :80"),
    type("student@srv:~$ ", "sudo ufw deny 23"), out("Rule added"), set(() => ({ srvPorts: SRV_PORTS_FIXED })),
    { do: "probe", text: k("probeClosed"), ok: true }, steps(3),
    type("student@srv:~$ ", "sudo passwd -l guest"), out("passwd: password changed"),
    { do: "probe", text: k("probeGuest"), ok: true }, steps(4),
    out(k("termChecked", stepsVars), "ok"), own("srv"), set(() => ({ probe: { text: k("probeDone", stepsVars), ok: true } })),
    wait(4500),
  ]
}

/* a slice of the event rating for «Змагання»: the visitor's team climbs from 5th to 3rd with the flag */
export const SLICE = [
  { id: "charlie", points: 1650 },
  { id: "delta", points: 1500 },
  { id: "own", points: 1300 },
] as const
export const SLICE_FIRST_PLACE = 3

export function slice(won: boolean): { id: string; points: number; place: number }[] {
  const rows = SLICE.map((r) => ({ id: r.id as string, points: r.id === "own" && won ? r.points + FLAG_POINTS : r.points }))
  const order = [...rows].sort((a, b) => b.points - a.points).map((r) => r.id)
  return rows.map((r) => ({ ...r, place: SLICE_FIRST_PLACE + order.indexOf(r.id) }))
}
