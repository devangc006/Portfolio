import React, { useRef, useState, useEffect, useMemo, useId } from 'react'

// --- Mathematical and SVG Geometry Helpers ---
const clamp = (v, min, max) => (v < min ? min : v > max ? max : v)
const H_HEIGHT = 100
const F = 19
const sl = 17
const fNum = (n) => String(Math.round(n * 100) / 100)

const rect = (x, y, w, h) => `M${fNum(x)} ${fNum(y)}H${fNum(x + w)}V${fNum(y + h)}H${fNum(x)}Z`
const slant = (x1, y1, x2, y2, w) => `M${fNum(x1)} ${fNum(y1)}H${fNum(x1 + w)}L${fNum(x2 + w)} ${fNum(y2)}H${fNum(x2)}Z`
const at = (cx, cy, rx, ry, deg) => {
  const rad = (deg * Math.PI) / 180
  return `${fNum(cx + rx * Math.cos(rad))} ${fNum(cy + ry * Math.sin(rad))}`
}
const band = (cx, cy, rx, ry, w, h, startDeg, endDeg) => {
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  const sweep = endDeg > startDeg ? 1 : 0
  const inRx = rx - w
  const inRy = ry - h
  return `M${at(cx, cy, rx, ry, startDeg)}A${fNum(rx)} ${fNum(ry)} 0 ${largeArc} ${sweep} ${at(cx, cy, rx, ry, endDeg)}L${at(cx, cy, inRx, inRy, endDeg)}A${fNum(inRx)} ${fNum(inRy)} 0 ${largeArc} ${1 - sweep} ${at(cx, cy, inRx, inRy, startDeg)}Z`
}
const ring = (cx, cy, rx, ry, w, h) => {
  const e = (rX, rY) =>
    `M${fNum(cx - rX)} ${fNum(cy)}A${fNum(rX)} ${fNum(rY)} 0 1 1 ${fNum(cx + rX)} ${fNum(cy)}A${fNum(rX)} ${fNum(rY)} 0 1 1 ${fNum(cx - rX)} ${fNum(cy)}Z`
  return e(rx, ry) + e(rx - w, ry - h)
}
const bowl = (x, y, w, h, strokeW, strokeH) => {
  const rH = h / 2
  const rW = Math.min(w - strokeW, rH * 0.95)
  const arcX = x + w - rW
  return `M${fNum(x)} ${fNum(y)}H${fNum(arcX)}A${fNum(rW)} ${fNum(rH)} 0 0 1 ${fNum(arcX)} ${fNum(y + h)}H${fNum(x)}ZM${fNum(x + strokeW)} ${fNum(y + strokeH)}H${fNum(arcX)}A${fNum(rW - strokeW)} ${fNum(rH - strokeH)} 0 0 1 ${fNum(arcX)} ${fNum(y + h - strokeH)}H${fNum(x + strokeW)}Z`
}

// Full Geometric SVG Alphabet
const GLYPHS = {
  A: { w: 96, d: [slant(37, 0, 0, 100, 23), slant(37, 0, 73, 100, 23), rect(18, 60, 60, 16)] },
  B: { w: 84, d: [rect(0, 0, F, 100), bowl(0, 0, 78, 52, F, sl), bowl(0, 52 - sl, 84, 48 + sl, F, sl)] },
  C: { w: 90, d: [band(45, 50, 45, 50, F + 2, sl, -40, -320)] },
  D: { w: 90, d: [rect(0, 0, F + 1, 100), bowl(0, 0, 90, 100, F + 2, sl)] },
  E: { w: 72, d: [rect(0, 0, F, 100), rect(0, 0, 72, sl), rect(0, 41.5, 64, sl), rect(0, 100 - sl, 72, sl)] },
  F: { w: 70, d: [rect(0, 0, F, 100), rect(0, 0, 70, sl), rect(0, 43, 62, sl)] },
  G: { w: 94, d: [band(47, 50, 47, 50, F + 2, sl, -38, -360), rect(48, 46, 46, sl)] },
  H: { w: 86, d: [rect(0, 0, F, 100), rect(86 - F, 0, F, 100), rect(0, 42, 86, sl)] },
  I: { w: F + 2, d: [rect(0, 0, F + 2, 100)] },
  J: { w: 72, d: [rect(72 - F, 0, F, 64), band(36, 62, 36, 38, F, sl, 0, 180)] },
  K: { w: 86, d: [rect(0, 0, F, 100), slant(62, 0, 10, 62, 24), slant(30, 42, 62, 100, 24)] },
  L: { w: 68, d: [rect(0, 0, F, 100), rect(0, 100 - sl, 68, sl)] },
  M: { w: 112, d: [rect(0, 0, F + 3, 100), slant(0, 0, 46, 100, 9), slant(68, 0, 40, 100, 22), rect(112 - F - 3, 0, F + 3, 100)] },
  N: { w: 88, d: [rect(0, 0, F, 100), rect(88 - F, 0, F, 100), slant(0, 0, 63, 100, 25)] },
  O: { w: 100, d: [ring(50, 50, 50, 50, F + 2, sl)] },
  P: { w: 80, d: [rect(0, 0, F, 100), bowl(0, 0, 80, 60, F, sl)] },
  Q: { w: 100, d: [ring(50, 50, 50, 50, F + 2, sl), slant(50, 62, 78, 100, 22)] },
  R: { w: 84, d: [rect(0, 0, F, 100), bowl(0, 0, 82, 58, F, sl), slant(34, 50, 62, 100, 22)] },
  S: { w: 80, d: [band(40, 29.25, 40, 29.25, F, sl, -22, -273), band(40, 70.75, 40, 29.25, F, sl, -93, 158)] },
  T: { w: 82, d: [rect(0, 0, 82, sl), rect(41 - F / 2 - 1, 0, F + 2, 100)] },
  U: { w: 86, d: [rect(0, 0, F, 60), rect(86 - F, 0, F, 60), band(43, 58, 43, 42, F, sl, 0, 180)] },
  V: { w: 94, d: [slant(0, 0, 36, 100, 22), slant(72, 0, 36, 100, 22)] },
  W: { w: 132, d: [slant(0, 0, 26, 100, 20), slant(56, 0, 26, 100, 20), slant(56, 0, 86, 100, 20), slant(112, 0, 86, 100, 20)] },
  X: { w: 92, d: [slant(0, 0, 68, 100, 24), slant(68, 0, 0, 100, 24)] },
  Y: { w: 92, d: [slant(0, 0, 35, 56, 22), slant(70, 0, 35, 56, 22), rect(35, 50, 22, 50)] },
  Z: { w: 80, d: [rect(0, 0, 80, sl), rect(0, 100 - sl, 80, sl), slant(56, sl - 1, 0, 100 - sl + 1, 24)] },
}

const glyphOf = (ch) => GLYPHS[ch.toUpperCase()] ?? { w: 42, d: [] }

// --- Camera Shutter Aperture Kinematics ---
const SHUTTER_W = 100
const UF = 21
const HR = 77

const turn = (x, y, quad) => {
  const d = ((quad % 4) + 4) % 4
  let curX = x
  let curY = y
  for (let i = 0; i < d; i++) {
    const nextX = curX
    curX = SHUTTER_W - curY
    curY = nextX
  }
  return [curX, curY]
}

const restPivot = (quad) => turn(HR, HR, quad)

const calcBlades = (pX, pY, quad) => {
  const [bx, by] = turn(clamp(pX, 8, 92), clamp(pY, 8, 92), -quad)
  const rawBlades = [
    [0, 0, UF, 0, bx, by, 0, UF],
    [bx, 0, SHUTTER_W, 0, SHUTTER_W, UF, bx, by],
    [0, by, bx, by, UF, SHUTTER_W, 0, SHUTTER_W],
  ]
  return rawBlades.map((poly) => {
    const transformed = []
    for (let i = 0; i < poly.length; i += 2) {
      transformed.push(...turn(poly[i], poly[i + 1], quad))
    }
    return transformed
  })
}

const layoutWordmark = (text, shutterIndex, spacing = 12) => {
  const items = []
  let x = 0
  Array.from(text).forEach((ch, idx) => {
    const isShutter = idx === shutterIndex && ch.trim() !== ''
    const width = isShutter ? SHUTTER_W : glyphOf(ch).w
    items.push({ ch, x, w: width, shutter: isShutter })
    x += width + spacing
  })
  return { items, width: Math.max(1, x - (items.length ? spacing : 0)) }
}

const approach = (current, target, rate, dt) =>
  target + (current - target) * Math.pow(1 - clamp(rate, 0, 1), clamp(dt, 0, 0.1) * 60)

// Scramble characters
const SCRAMBLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=/<>'
const scrambleText = (text, progress, seed) => {
  const chars = Array.from(text)
  const revealCount = Math.floor(clamp(progress, 0, 1) * chars.length)
  return chars
    .map((c, i) => {
      if (i < revealCount || !/[a-z0-9]/i.test(c)) return c
      const rand = Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453) % 1
      return SCRAMBLE_CHARS[Math.floor(rand * SCRAMBLE_CHARS.length)]
    })
    .join('')
}

const isEmailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((e || '').trim())

// External Link Props
const extProps = (href) => (href && /^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})

// Arrow & Check SVG Components
const ArrowIconSvg = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" className="w-[0.8em] h-[0.8em] shrink-0">
    <path d="M1 6h9.2M6.4 2.2 10.2 6l-3.8 3.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
)

const CheckIconSvg = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" className="w-3 h-3 shrink-0">
    <path d="M1.5 6.4 4.6 9.4 10.6 2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

// ScrambleLink Component
function ScrambleLink({ link, still, onFollow, style }) {
  const spanRef = useRef(null)
  const rafRef = useRef(0)
  const label = link.label

  const handlePointerEnter = () => {
    const el = spanRef.current
    if (still || !el) return
    cancelAnimationFrame(rafRef.current)
    const startTime = performance.now()
    const seed = Math.random() * 100
    let stepCount = 0

    const step = (now) => {
      const elapsed = (now - startTime) / 420
      if (elapsed >= 1) {
        el.textContent = label
        return
      }
      if (stepCount++ % 2 === 0) {
        el.textContent = scrambleText(label, elapsed, seed + Math.floor(stepCount / 2))
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <li className="sgf-fade" style={style}>
      <a
        className="sgf-link"
        href={link.href || '#'}
        aria-label={label}
        onPointerEnter={handlePointerEnter}
        onFocus={handlePointerEnter}
        onClick={(e) => onFollow(e, link)}
        {...extProps(link.href)}
      >
        <span ref={spanRef} aria-hidden="true">
          {label}
        </span>
        <ArrowIconSvg />
      </a>
    </li>
  )
}

// Scoped Component Styles
const FOOTER_CSS = `
.sgf {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  container-type: inline-size;
  color: var(--sgf-ink, #070210);
  background: var(--sgf-bg, #71C9CE);
  font-family: var(--font-rajdhani, 'Rajdhani', sans-serif);
  font-size: clamp(12px, 1.15cqw, 15px);
  line-height: 1.25;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  -webkit-font-smoothing: antialiased;
}
.sgf ::selection {
  background: var(--sgf-ink, #070210);
  color: var(--sgf-bg, #71C9CE);
}
:where(.sgf) a {
  color: inherit;
  text-decoration: none;
}
:where(.sgf) button {
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
:where(.sgf) ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
:where(.sgf) p {
  margin: 0;
}
.sgf svg {
  max-width: none;
}
.sgf-top {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr);
  column-gap: 28px;
  row-gap: 36px;
  padding: clamp(56px, 9cqw, 110px) clamp(20px, 3.5cqw, 48px) 0;
}
.sgf-fade {
  transition: opacity 0.8s ease var(--sgf-d, 0ms), translate 0.8s cubic-bezier(0.2, 0.7, 0.1, 1) var(--sgf-d, 0ms);
}
.sgf[data-in='false'] .sgf-fade {
  opacity: 0;
  translate: 0 10px;
}
.sgf-form {
  max-width: 320px;
}
.sgf-lede {
  max-width: 280px;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 1.1em;
}
.sgf-field {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: clamp(16px, 2cqw, 24px);
  padding: 6px 0 7px;
  border-bottom: 2px solid var(--sgf-ink, #070210);
}
.sgf-field::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: #9df133;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sgf-field:focus-within::after {
  transform: scaleX(1);
}
.sgf-field[data-state='error'] {
  animation: sgf-shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes sgf-shake {
  20%, 60% { translate: -5px 0; }
  40%, 80% { translate: 5px 0; }
}
.sgf-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-weight: 600;
  letter-spacing: inherit;
  text-transform: uppercase;
  color: inherit;
  background: transparent;
  border: 0;
  outline: none;
  padding: 0;
  margin: 0;
  border-radius: 0;
  -webkit-appearance: none;
  appearance: none;
}
.sgf-input::placeholder {
  color: var(--sgf-ink, #070210);
  opacity: 0.55;
  transition: opacity 0.25s;
}
.sgf-input:focus::placeholder {
  opacity: 0.25;
}
.sgf-go {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 24px;
  margin-right: -4px;
}
.sgf-go svg {
  width: 14px;
  height: 14px;
  transition: translate 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sgf-go:hover svg,
.sgf-go:focus-visible svg {
  translate: 4px 0;
}
.sgf-go:focus-visible {
  outline: 1px dashed var(--sgf-ink, #070210);
  outline-offset: 2px;
}
.sgf-spin {
  display: inline-block;
  width: 1ch;
  text-align: center;
}
.sgf-done {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sgf-done svg {
  width: 14px;
  height: 14px;
  flex: none;
}
.sgf-done button {
  margin-left: auto;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.sgf-done button:hover,
.sgf-done button:focus-visible {
  opacity: 1;
  outline: none;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sgf-msg {
  min-height: 1.2em;
  margin-top: 8px;
  font-size: 0.86em;
  opacity: 0.85;
}
.sgf-list-title {
  font-size: 0.85em;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.55;
  margin-bottom: 8px;
}
.sgf-list {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 0.7cqw, 10px);
}
.sgf-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.65em;
  white-space: nowrap;
  padding: 2px 0;
  font-weight: 600;
  font-size: 1.05em;
}
.sgf-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 1.6em;
  bottom: -2px;
  height: 1.5px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: 100% 50%;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sgf-link:hover::after,
.sgf-link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: 0 50%;
}
.sgf-link svg {
  transition: translate 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sgf-link:hover svg,
.sgf-link:focus-visible svg {
  translate: 5px 0;
}
.sgf-link:focus-visible {
  outline: none;
}
.sgf-copy {
  white-space: pre-line;
  line-height: 1.5;
  font-weight: 600;
  opacity: 0.8;
}
.sgf-mark {
  box-sizing: border-box;
  padding: clamp(36px, 4.6cqw, 64px) clamp(16px, 2.6cqw, 40px) clamp(14px, 2.1cqw, 28px);
}
.sgf-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: hidden;
  fill: var(--sgf-ink, #070210);
}
.sgf-rise {
  transition: transform 1.15s cubic-bezier(0.16, 0.84, 0.2, 1) var(--sgf-d, 0ms);
}
.sgf[data-in='false'] .sgf-rise {
  transform: translateY(112px);
}
.sgf-g {
  cursor: pointer;
}
.sgf-flip {
  transform-box: fill-box;
  transform-origin: 50% 50%;
}
.sgf-flip.is-flip {
  animation: sgf-flip 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes sgf-flip {
  0% { transform: scaleY(1); }
  45% { transform: scaleY(-1); }
  100% { transform: scaleY(1); }
}
.sgf-half {
  transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.25, 1.15);
}
.sgf-g:hover .sgf-up {
  transform: translate(5px, -1.5px);
}
.sgf-g:hover .sgf-dn {
  transform: translate(-5px, 1.5px);
}
.sgf-sh polygon {
  transition: none;
}

@container (max-width: 820px) {
  .sgf-top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .sgf-top > :first-child {
    grid-column: 1 / -1;
  }
  .sgf-copy {
    order: 4;
  }
  .sgf-form {
    max-width: 100%;
  }
}
@container (max-width: 480px) {
  .sgf-top {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (prefers-reduced-motion: reduce) {
  .sgf .sgf-rise,
  .sgf .sgf-fade,
  .sgf .sgf-half,
  .sgf .sgf-link svg,
  .sgf .sgf-link::after,
  .sgf .sgf-field::after,
  .sgf .sgf-go svg {
    transition: none !important;
  }
  .sgf .sgf-field,
  .sgf .sgf-flip {
    animation: none !important;
  }
  .sgf[data-in='false'] .sgf-rise {
    transform: none;
  }
  .sgf[data-in='false'] .sgf-fade {
    opacity: 1;
    translate: none;
  }
}
`

export default function Footer() {
  const brand = 'DEVANG'
  const shutterAt = 2 // Replaces 'V' in DEVANG with the animated camera shutter!
  const background = 'var(--soft-turquoise)'
  const ink = 'var(--text-black, #070210)'

  const { items, width } = useMemo(() => layoutWordmark(brand, shutterAt), [brand, shutterAt])
  const shutterItem = items.find((it) => it.shutter)

  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipUpId = `sgf-up-${rawId}`
  const clipDnId = `sgf-dn-${rawId}`

  const footerRef = useRef(null)
  const svgRef = useRef(null)
  const bladeRefs = useRef([])
  const pointerRef = useRef({ x: 0, y: 0, inside: false })
  const [orientation, setOrientation] = useState(0)
  const currentPivotRef = useRef(restPivot(0))
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReducedMotion(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  const still = reducedMotion
  const [inView, setInView] = useState(false)
  const [intersecting, setIntersecting] = useState(false)

  // Intersection observer for entrance transition
  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Camera Shutter Aperture Animation Loop
  useEffect(() => {
    if (!shutterItem) return

    const paint = (pX, pY) => {
      calcBlades(pX, pY, orientation).forEach((poly, idx) => {
        const blade = bladeRefs.current[idx]
        if (blade) blade.setAttribute('points', poly.map(fNum).join(' '))
      })
    }

    const rest = restPivot(orientation)
    if (still || !intersecting) {
      currentPivotRef.current = rest
      paint(rest[0], rest[1])
      return
    }

    let rafId = 0
    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now

      const ptr = pointerRef.current
      const targetX = ptr.inside ? clamp(ptr.x, 8, 92) : rest[0]
      const targetY = ptr.inside ? clamp(ptr.y, 8, 92) : rest[1]

      const [curX, curY] = currentPivotRef.current
      currentPivotRef.current = [
        approach(curX, targetX, 0.12, dt),
        approach(curY, targetY, 0.12, dt),
      ]

      paint(currentPivotRef.current[0], currentPivotRef.current[1])
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [shutterItem, still, intersecting, orientation])

  const onPointer = (e) => {
    const svgEl = svgRef.current
    const ptr = pointerRef.current
    ptr.inside = e.type !== 'pointerleave'
    if (!svgEl || !shutterItem) return
    const rectBounds = svgEl.getBoundingClientRect()
    const scale = rectBounds.width / width || 1
    ptr.x = (e.clientX - rectBounds.left) / scale - shutterItem.x
    ptr.y = (e.clientY - rectBounds.top) / scale
  }

  const handleFlip = (e) => {
    if (still) return
    const target = e.currentTarget
    target.classList.remove('is-flip')
    void target.getBoundingClientRect()
    target.classList.add('is-flip')
  }

  // Links Data
  const portfolioLinks = [
    { label: 'Live Demos', href: '#work' },
    { label: 'GitHub', href: 'https://github.com/devangc006' },
  ]

  const socialLinks = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/devangc006/' },
    { label: 'Shoot a message', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=devangc006@gmail.com' },
    { label: 'Download CV', href: '/cv/DevangC_CV.pdf' },
  ]

  const handleLinkClick = (e, link) => {
    if (link?.href && link.href.startsWith('#')) {
      e.preventDefault()
      if (link.href === '#' || link.href === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const target = document.querySelector(link.href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  // Newsletter Form Logic
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState('idle')
  const [errorTick, setErrorTick] = useState(0)
  const [spinTick, setSpinTick] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (errorTick && formState === 'error') {
      inputRef.current?.focus()
    }
  }, [errorTick, formState])

  useEffect(() => {
    if (formState !== 'sending' || still) return
    const interval = window.setInterval(() => setSpinTick((p) => p + 1), 90)
    return () => window.clearInterval(interval)
  }, [formState, still])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formState === 'sending') return
    if (!isEmailValid(email)) {
      setFormState('error')
      setErrorTick((p) => p + 1)
      return
    }
    setFormState('sending')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFormState('done')
    } catch {
      setFormState('failed')
      setErrorTick((p) => p + 1)
    }
  }

  const handleReset = () => {
    setEmail('')
    setFormState('idle')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const formMsg =
    formState === 'error'
      ? "That doesn't look like an email address"
      : formState === 'failed'
      ? "Couldn't send. Please try again"
      : formState === 'sending'
      ? 'Connecting...'
      : ''

  let delayCounter = 0
  const getDelay = () => ({ '--sgf-d': `${(delayCounter += 60)}ms` })

  const cssVars = {
    '--sgf-bg': background,
    '--sgf-top': background,
    '--sgf-ink': ink,
  }

  return (
    <div className="footer-dock">
      <footer
        ref={footerRef}
        className="site-footer sgf relative w-full"
        data-surface="green"
        style={{ ...cssVars, padding: 0 }}
        data-in={inView || still ? 'true' : 'false'}
        onPointerMove={onPointer}
        onPointerEnter={onPointer}
        onPointerLeave={onPointer}
      >
        <style>{FOOTER_CSS}</style>

        {/* Top Header Row with Newsletter, Links & Metadata */}
        <div className="sgf-top">
          {/* Newsletter / Direct Inquiry Form */}
          <form className="sgf-form sgf-fade" style={getDelay()} onSubmit={handleSubmit} noValidate>
            <label htmlFor={`sgf-email-${rawId}`} className="sgf-lede block font-heading">
              WHAT IF we actually built it?
            </label>
            <div className="sgf-field" data-state={formState}>
              {formState === 'done' ? (
                <div className="sgf-done" role="status">
                  <CheckIconSvg />
                  <span>Message Dispatched</span>
                  <button type="button" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={inputRef}
                    id={`sgf-email-${rawId}`}
                    className="sgf-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="Enter your email"
                    value={email}
                    aria-invalid={formState === 'error' || undefined}
                    aria-describedby={`sgf-msg-${rawId}`}
                    disabled={formState === 'sending'}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formState === 'error' || formState === 'failed') setFormState('idle')
                    }}
                  />
                  <button className="sgf-go" type="submit" aria-label="Submit inquiry" disabled={formState === 'sending'}>
                    {formState === 'sending' ? (
                      <span className="sgf-spin" aria-hidden="true">
                        {still ? '…' : '|/-\\'[spinTick % 4]}
                      </span>
                    ) : (
                      <ArrowIconSvg />
                    )}
                  </button>
                </>
              )}
            </div>
            <p id={`sgf-msg-${rawId}`} className="sgf-msg font-mono" aria-live="polite">
              {formMsg}
            </p>
          </form>

          {/* Column 1: Portfolio & Photography Links */}
          <nav aria-label="Portfolio & Work">
            <p className="sgf-list-title font-heading">PORTFOLIO / WORK</p>
            <ul className="sgf-list">
              {portfolioLinks.map((link) => (
                <ScrambleLink key={link.label} link={link} still={still} onFollow={handleLinkClick} style={getDelay()} />
              ))}
            </ul>
          </nav>

          {/* Column 2: Social & Contact Links */}
          <nav aria-label="Social & Direct Contacts">
            <p className="sgf-list-title font-heading">CONNECT & RESUME</p>
            <ul className="sgf-list">
              {socialLinks.map((link) => (
                <ScrambleLink key={link.label} link={link} still={still} onFollow={handleLinkClick} style={getDelay()} />
              ))}
            </ul>
          </nav>

          {/* Column 3: Copyright & Coordinates */}
          <div className="sgf-copy sgf-fade font-mono" style={getDelay()}>
            <p className="font-heading font-bold text-base text-[var(--text-black)]">DEVANG C</p>
            <p className="text-xs opacity-75 mt-1">Creative Technologist & UI Engineer</p>
            <p className="text-xs opacity-60 mt-3">
              9°55'52.3"N • 76°16'02.3"E
              <br />
              Kochi, Kerala, India
            </p>
            <p className="text-xs opacity-60 mt-2">© {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
        </div>

        {/* Edge-to-Edge Geometric SVG Wordmark with Camera-Shutter Glyph */}
        <div className="sgf-mark select-none">
          <p className="sr-only">{brand}</p>
          <svg
            ref={svgRef}
            className="sgf-svg"
            viewBox={`0 0 ${fNum(width)} ${H_HEIGHT}`}
            style={{ aspectRatio: `${width} / ${H_HEIGHT}` }}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <clipPath id={clipUpId} clipPathUnits="userSpaceOnUse">
                <rect x={-40} y={-200} width={400} height={252.6} />
              </clipPath>
              <clipPath id={clipDnId} clipPathUnits="userSpaceOnUse">
                <rect x={-40} y={51.4} width={400} height={250} />
              </clipPath>
            </defs>

            {items.map((item, idx) => {
              if (item.ch.trim() === '') return null
              const delayStyle = { '--sgf-d': `${200 + idx * 90}ms` }

              // Camera-Shutter Interactive Glyph
              if (item.shutter) {
                const rest = restPivot(orientation)
                return (
                  <g key={idx} transform={`translate(${fNum(item.x)} 0)`}>
                    <g className="sgf-rise" style={delayStyle}>
                      <g
                        className="sgf-g sgf-sh"
                        onClick={() => setOrientation((prev) => prev + 1)}
                        title="Click to rotate shutter aperture"
                      >
                        <rect width={SHUTTER_W} height={H_HEIGHT} fill="transparent" />
                        {calcBlades(rest[0], rest[1], orientation).map((poly, bIdx) => (
                          <polygon
                            key={bIdx}
                            ref={(el) => {
                              bladeRefs.current[bIdx] = el
                            }}
                            points={poly.map(fNum).join(' ')}
                          />
                        ))}
                      </g>
                    </g>
                  </g>
                )
              }

              // Standard Geometric Alphabet Glyphs with Split-Flap 3D Flip
              const glyph = glyphOf(item.ch)
              const paths = glyph.d.map((dStr, pIdx) => <path key={pIdx} d={dStr} fillRule="evenodd" />)

              return (
                <g key={idx} transform={`translate(${fNum(item.x)} 0)`}>
                  <g className="sgf-rise" style={delayStyle}>
                    <g
                      className="sgf-g sgf-flip"
                      onClick={handleFlip}
                      onAnimationEnd={(e) => e.currentTarget.classList.remove('is-flip')}
                      title="Click to flip letter"
                    >
                      <rect width={glyph.w} height={H_HEIGHT} fill="transparent" />
                      <g clipPath={`url(#${clipUpId})`}>
                        <g className="sgf-half sgf-up">{paths}</g>
                      </g>
                      <g clipPath={`url(#${clipDnId})`}>
                        <g className="sgf-half sgf-dn">{paths}</g>
                      </g>
                    </g>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
      </footer>
    </div>
  )
}
