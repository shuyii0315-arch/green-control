// NotesBooklet — a small booklet for the About page.
// Hover: the page slides out and the components snap into the screen.
// Click: the page is pulled out and laid in front of the reader, with paper sounds.
// Paste this whole file into Framer: Assets → Code → New Component (replace everything).
import * as React from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"

const BASE = "https://shuyii0315-arch.github.io/green-control/notes/"
const ART_URL = BASE + "cover-art.svg"
const SHOT = BASE + "guide-sheet.jpg"
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=Nothing+You+Could+Do&family=Reenie+Beanie&display=swap"
const E = "cubic-bezier(.32,.72,0,1)"

const CSS = `
.nb-book{all:unset;position:absolute;left:0;top:0;width:420px;height:594px;transform-origin:0 0;cursor:pointer}
.nb-book:focus-visible .nb-cover{outline:3px solid #2f55e4;outline-offset:8px}
.nb-cover{position:absolute;inset:0;background:#f6f4ef;overflow:hidden;box-shadow:inset 0 0 0 1px #e4e0d7,0 2px 4px rgba(0,0,0,.05),0 22px 36px -22px rgba(0,0,0,.4);transition:transform .5s cubic-bezier(.34,1.36,.64,1)}
.nb-fold{position:absolute;left:24px;top:0;bottom:0;width:1px;background:#e4e0d7}.nb-staple{position:absolute;left:12px;width:3px;height:20px;background:#c3c0b8}
.nb-top,.nb-foot{position:absolute;left:52px;right:34px;display:flex;justify-content:space-between;align-items:baseline;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#7d7a72}
.nb-top{top:36px}.nb-foot{bottom:34px}
svg.nb-art{position:absolute;left:30px;top:84px;width:366px!important;height:310px!important;max-width:none}
.nb-cover h1{position:absolute;left:52px;right:30px;bottom:84px;margin:0;font-family:'Nothing You Could Do',cursive;font-weight:400;font-size:34px;line-height:1.35;color:#1c1b19;text-align:left}
.nb-sig{font-family:'Reenie Beanie',cursive;font-size:34px;color:#2f55e4;line-height:.6}
.nb-paper{position:absolute;inset:0;background:#fff url(${SHOT}) 0 0/100% auto no-repeat;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 10px 24px -14px rgba(0,0,0,.3);transform:translate(6px,4px) rotate(1deg);transition:transform .5s cubic-bezier(.34,1.36,.64,1),opacity .15s}
.nb-book.nb-hot .nb-paper{transform:translate(118px,-26px) rotate(5deg)}
.nb-book.nb-hot .nb-cover{transform:translate(-14px,6px) rotate(-1.5deg)}
.nb-book.nb-out .nb-paper{opacity:0}
.nb-ov{position:fixed;inset:0;z-index:9999}
.nb-scrim{position:absolute;inset:0;background:rgba(236,235,230,.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.nb-sheet{position:fixed;background:#fff;overflow:hidden;border-radius:6px;transform-origin:50% 50%;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 40px 80px -30px rgba(0,0,0,.4)}
.nb-sheet img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:top center}
.nb-sheet iframe{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;transition:opacity .35s;background:#f6f4ef}
.nb-sheet.nb-landed iframe.nb-ready{opacity:1}
.nb-tools{position:fixed;display:flex;gap:8px;opacity:0;z-index:2}.nb-tools.nb-col{flex-direction:column}
.nb-ib{all:unset;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;color:#3a3833;cursor:pointer;background:rgba(246,244,239,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 0 0 1px rgba(0,0,0,.07),0 4px 12px -4px rgba(0,0,0,.18);transition:background .15s,transform .1s}
.nb-ib:hover{background:#fff}.nb-ib:active{transform:scale(.94)}.nb-ib:focus-visible{outline:2px solid #2f55e4}
.nb-ib svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion: reduce){.nb-paper,.nb-cover{transition:none!important}}
`

// ---- paper sounds, synthesised (no audio files) ----
let AC: AudioContext | null = null
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
function ac() {
    try {
        AC = AC || new ((window as any).AudioContext || (window as any).webkitAudioContext)()
        if (AC!.state === "suspended") AC!.resume()
        return AC
    } catch { return null }
}
function noise(c: AudioContext, dur: number) {
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
    const s = c.createBufferSource(); s.buffer = b; return s
}
function swish(on: boolean, vol = 0.16, dur = 0.42, f0 = 700, f1 = 2600) {
    if (!on || reduced()) return
    const c = ac(); if (!c) return
    const t = c.currentTime, s = noise(c, dur), f = c.createBiquadFilter(), g = c.createGain()
    f.type = "bandpass"; f.Q.value = 0.9
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7)
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + dur)
}
function tap(on: boolean, vol = 0.1) {
    if (!on || reduced()) return
    const c = ac(); if (!c) return
    const t = c.currentTime, s = noise(c, 0.07), f = c.createBiquadFilter(), g = c.createGain()
    f.type = "lowpass"; f.frequency.value = 1400
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + 0.07)
}

type Pose = { cx: number; cy: number; w: number; h: number; ang: number; rad?: number }
const kf = (p: Pose) => ({ left: p.cx - p.w / 2 + "px", top: p.cy - p.h / 2 + "px", width: p.w + "px", height: p.h + "px", transform: `rotate(${p.ang}deg)`, borderRadius: (p.rad ?? 2) + "px" })

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 252
 * @framerIntrinsicHeight 356
 */
export default function NotesBooklet(props: any) {
    const { title, number, minutes, signature, url, sound, tilt, style } = props
    const box = React.useRef<HTMLDivElement>(null)
    const book = React.useRef<HTMLButtonElement>(null)
    const paper = React.useRef<HTMLDivElement>(null)
    const sheet = React.useRef<HTMLElement>(null)
    const scrim = React.useRef<HTMLDivElement>(null)
    const tools = React.useRef<HTMLDivElement>(null)
    const frame = React.useRef<HTMLIFrameElement>(null)
    const closeBtn = React.useRef<HTMLButtonElement>(null)
    const state = React.useRef<"closed" | "busy" | "open">("closed")
    const full = React.useRef(false)
    const [open, setOpen] = React.useState(false)
    const [isFull, setIsFull] = React.useState(false)
    const [scale, setScale] = React.useState(0.6)
    const [mounted, setMounted] = React.useState(false)
    const [art, setArt] = React.useState("")

    React.useEffect(() => {
        setMounted(true)
        fetch(ART_URL).then((r) => r.text()).then(setArt).catch(() => {})
        if (!document.getElementById("nb-fonts")) {
            const l = document.createElement("link"); l.id = "nb-fonts"; l.rel = "stylesheet"; l.href = FONTS; document.head.appendChild(l)
        }
        const el = box.current; if (!el) return
        const ro = new ResizeObserver(() => setScale(el.clientWidth / 420)); ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const T = (ms: number) => (reduced() ? 1 : ms)
    const go = (el: Element, frames: Keyframe[], ms: number, ease = E, delay = 0) =>
        el.animate(frames, { duration: T(ms), easing: ease, delay: reduced() ? 0 : delay, fill: "forwards" }).finished

    const paperPose = (): Pose => {
        const r = paper.current!.getBoundingClientRect()
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: 420 * scale, h: 594 * scale, ang: book.current!.classList.contains("nb-hot") ? 3 + tilt : tilt }
    }
    const readerBox = (): Pose => full.current
        ? { cx: innerWidth / 2, cy: innerHeight / 2, w: innerWidth, h: innerHeight, ang: 0, rad: 0 }
        : { cx: innerWidth / 2, cy: innerHeight / 2, w: Math.min(900, innerWidth * 0.92), h: innerHeight * 0.88, ang: 0, rad: 6 }
    const place = (p: Pose) => {
        Object.assign(sheet.current!.style, kf(p))
        const right = p.cx + p.w / 2, roomy = !full.current && innerWidth - right >= 64, t = tools.current!
        t.classList.toggle("nb-col", roomy)
        Object.assign(t.style, roomy ? { left: right + 14 + "px", top: p.cy - p.h / 2 + "px", right: "auto", bottom: "auto" } : { left: "auto", top: "auto", right: "18px", bottom: "18px" })
    }
    const clear = (...els: (Element | null)[]) => els.forEach((el) => el?.getAnimations().forEach((a) => a.cancel()))
    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

    const hot = (on: boolean) => {
        const b = book.current; if (!b || state.current !== "closed") return
        b.classList.remove("nb-hot")
        if (on) { void b.offsetWidth; b.classList.add("nb-hot"); swish(sound, 0.05, 0.3, 1200, 3000) }
    }

    async function openIt() {
        if (state.current !== "closed") return
        state.current = "busy"
        const a = paperPose()
        setOpen(true); await nextFrame()
        const b = readerBox()
        place(b); book.current!.classList.add("nb-out")
        document.documentElement.style.overflow = "hidden"
        swish(sound, 0.18, 0.55, 600, 2800)
        go(scrim.current!, [{ opacity: 0 }, { opacity: 1 }], 420, "ease-out")
        const mid: Pose = { cx: a.cx + (b.cx - a.cx) * 0.35, cy: a.cy + (b.cy - a.cy) * 0.35 - 50, w: a.w * 1.35, h: a.h * 1.35, ang: -3, rad: 3 }
        await go(sheet.current!, [kf(a), { ...kf(mid), offset: 0.38 }, kf(b)], 820)
        clear(sheet.current, scrim.current); scrim.current!.style.opacity = "1"
        place(b); sheet.current!.classList.add("nb-landed"); tap(sound, 0.1)
        go(tools.current!, [{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], 240, "ease-out")
        closeBtn.current?.focus({ preventScroll: true })
        state.current = "open"
    }
    async function closeIt() {
        if (state.current !== "open") return
        state.current = "busy"
        if (full.current) await toggleFull()
        const b = readerBox(); book.current!.classList.remove("nb-hot"); await nextFrame()
        const a = paperPose()
        sheet.current!.classList.remove("nb-landed")
        go(tools.current!, [{ opacity: 1 }, { opacity: 0 }], 140)
        go(scrim.current!, [{ opacity: 1 }, { opacity: 0 }], 520, "ease-in", 160)
        swish(sound, 0.12, 0.45, 2400, 700)
        await go(sheet.current!, [kf(b), kf(a)], 620)
        tap(sound, 0.07)
        book.current!.classList.remove("nb-out")
        document.documentElement.style.overflow = ""
        setOpen(false)
        book.current!.focus({ preventScroll: true })
        state.current = "closed"
    }
    async function toggleFull() {
        const a = readerBox(); full.current = !full.current; setIsFull(full.current); const b = readerBox()
        await go(sheet.current!, [kf(a), kf(b)], 460)
        clear(sheet.current); place(b)
    }

    React.useEffect(() => {
        if (!open) return
        const key = (e: KeyboardEvent) => {
            if (e.key !== "Escape" || state.current !== "open") return
            e.preventDefault(); full.current ? toggleFull() : closeIt()
        }
        const resize = () => { if (state.current === "open") place(readerBox()) }
        addEventListener("keydown", key); addEventListener("resize", resize)
        return () => { removeEventListener("keydown", key); removeEventListener("resize", resize) }
    }, [open])

    const lines = String(title).split("\n")
    const cover = (
        <div className="nb-cover">
            <div className="nb-fold" /><div className="nb-staple" style={{ top: 148 }} /><div className="nb-staple" style={{ top: 426 }} />
            <div className="nb-top"><span>notes</span><span>no. {number}</span></div>
            <div dangerouslySetInnerHTML={{ __html: art }} />
            <h1>{lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</h1>
            <div className="nb-foot"><span className="nb-sig">{signature}</span><span>{minutes}</span></div>
        </div>
    )

    return (
        <div ref={box} style={{ ...style, position: "relative", width: "100%", aspectRatio: "420 / 594" }}>
            <style>{CSS}</style>
            <button ref={book} className="nb-book" aria-label={"Open note: " + lines.join(" ")}
                style={{ transform: `scale(${scale}) rotate(${tilt}deg)` }}
                onMouseEnter={() => hot(true)} onMouseLeave={() => hot(false)}
                onFocus={() => hot(true)} onBlur={() => hot(false)} onClick={openIt}>
                <div ref={paper} className="nb-paper" />
                {cover}
            </button>
            {mounted && open && createPortal(
                <div className="nb-ov">
                    <style>{CSS}</style>
                    <div ref={scrim} className="nb-scrim" style={{ opacity: 0 }} onClick={closeIt} />
                    <article ref={sheet as any} className="nb-sheet" role="dialog" aria-modal="true" aria-label={lines.join(" ")}>
                        <img src={SHOT} alt="" />
                        <iframe ref={frame} src={url} title={lines.join(" ")} onLoad={(e) => e.currentTarget.classList.add("nb-ready")} />
                    </article>
                    <div ref={tools} className="nb-tools">
                        <button className="nb-ib" aria-label={isFull ? "Exit full screen" : "Full screen"} onClick={() => state.current === "open" && toggleFull()}>
                            <svg viewBox="0 0 24 24"><path d={isFull ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"} /></svg>
                        </button>
                        <button ref={closeBtn} className="nb-ib" aria-label="Close" onClick={closeIt}>
                            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

NotesBooklet.defaultProps = {
    title: "Teaching AI\nmy design system",
    number: "01",
    minutes: "18 min read",
    signature: "Shuyi",
    url: "https://shuyii0315-arch.github.io/green-control/guide/",
    sound: true,
    tilt: -2,
}

addPropertyControls(NotesBooklet, {
    title: { type: ControlType.String, title: "Title", displayTextArea: true },
    number: { type: ControlType.String, title: "No." },
    minutes: { type: ControlType.String, title: "Read time" },
    signature: { type: ControlType.String, title: "Signature" },
    url: { type: ControlType.String, title: "Page URL" },
    sound: { type: ControlType.Boolean, title: "Sound" },
    tilt: { type: ControlType.Number, title: "Tilt", min: -8, max: 8, step: 0.5, unit: "°" },
})
