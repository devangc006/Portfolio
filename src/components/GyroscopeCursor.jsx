import React, {
  forwardRef,
  useRef,
  useEffect,
  useId,
  useImperativeHandle,
  useSyncExternalStore,
} from 'react'

const TWO_PI = 2 * Math.PI
const DT = 1 / 240

const INTERACTIVE_SELECTOR =
  'a[href],button:not(:disabled),[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="option"],[role="switch"],[role="checkbox"],input[type="button"],input[type="submit"],input[type="reset"],input[type="checkbox"],input[type="radio"],input[type="range"],input[type="color"],input[type="file"],label[for],select,summary,[data-cursor="pointer"]'

const NATIVE_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="image"]):not([type="hidden"]),textarea,[contenteditable]:not([contenteditable="false"]),[data-cursor="native"]'

const clamp = (val, min, max) => Math.min(max, Math.max(min, val))

const smoothstep = (val) => {
  const t = clamp(val, 0, 1)
  return t * t * (3 - 2 * t)
}

const wrapAngle = (angle) => angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI)
const unwrapAngle = (target, current) => current + wrapAngle(target - current)

// Semi-implicit spring-damper integration
const springOutput = new Float64Array(2)
const stepSpring = (pos, vel, target, omega, zeta, dt) => {
  let v = vel
  let p = pos
  let rem = dt
  while (rem > 1e-6) {
    const step = Math.min(DT, rem)
    rem -= step
    v += (omega * omega * (target - p) - 2 * zeta * omega * v) * step
    p += v * step
  }
  springOutput[0] = p
  springOutput[1] = v
}

// Generate the aerodynamic rounded arrowhead path
function generateArrowPath(size) {
  const half = size / 2
  let d = ''
  const points = [
    [0, 0, 0.09 * size],
    [-size, -half, 0.16 * size],
    [-(0.8 * size), 0, 0.12 * size],
    [-size, half, 0.16 * size],
  ]

  points.forEach(([x, y, r], i) => {
    const [prevX, prevY] = points[(i + points.length - 1) % points.length]
    const [nextX, nextY] = points[(i + 1) % points.length]
    const dPrev = Math.hypot(prevX - x, prevY - y)
    const dNext = Math.hypot(nextX - x, nextY - y)
    const startX = x + ((prevX - x) / dPrev) * r
    const startY = y + ((prevY - y) / dPrev) * r
    const endX = x + ((nextX - x) / dNext) * r
    const endY = y + ((nextY - y) / dNext) * r
    const cmd = i === 0 ? 'M' : 'L'
    d += `${cmd}${startX.toFixed(3)} ${startY.toFixed(3)}Q${x.toFixed(3)} ${y.toFixed(3)} ${endX.toFixed(3)} ${endY.toFixed(3)}`
  })

  return `${d}Z`
}

// Check background luminance to determine dark vs light surfaces
function isElementLight(element) {
  if (!element || typeof window === 'undefined') return false

  // Direct fast check for known light sections / surface tones in the portfolio
  if (
    element.closest(
      '[data-surface="green"], [data-surface="light"], .stat-stage, .selected-work-outer, [data-theme="light"]'
    )
  ) {
    // If the element inside is explicitly a dark container/card on hover, check computed color
    const ownBg = window.getComputedStyle(element).backgroundColor
    if (ownBg && ownBg !== 'transparent' && ownBg !== 'rgba(0, 0, 0, 0)') {
      const match = ownBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) {
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1
        if (a > 0.4) {
          const lum =
            (0.299 * parseInt(match[1], 10) +
              0.587 * parseInt(match[2], 10) +
              0.114 * parseInt(match[3], 10)) /
            255
          return lum > 0.42
        }
      }
    }
    return true
  }

  // Climb ancestors to find non-transparent background color
  let curr = element
  while (curr && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr)
    const bg = style.backgroundColor
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) {
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1
        if (a > 0.25) {
          const r = parseInt(match[1], 10)
          const g = parseInt(match[2], 10)
          const b = parseInt(match[3], 10)
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          return lum > 0.45
        }
      }
    }
    curr = curr.parentElement
  }

  return false
}

const subscribeMotion = (callback) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

const getReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const GyroscopeCursor = forwardRef(function GyroscopeCursor(
  {
    // Color customization matching site theme
    color = '#9df133', // Neon green on dark surfaces
    outlineColor = '#070210', // Deep dark outline on dark surfaces
    lightColor = '#070210', // Sleek deep dark on light surfaces
    lightOutlineColor = '#9df133', // Neon green stroke on light surfaces
    autoTheme = true, // Automatically adapt colors to background

    // Physics & Sizing properties from ReactBits Pro Gyroscope Cursor
    size = 24,
    outlineWidth = 2.5,
    shadow = 0.5,
    turn = 1,
    turnSpeed = 1,
    overshoot = 0.4,
    stretch = 0.4,
    settle = 0.45,
    restAngle = -45,
    press = true,
    ripple = true,
    hover = true,
    label = '',
    autoplay = false,
    autoplaySpeed = 1,
    idleDelay = 1.5,
    interactive = true,
    disabled = false,
    className = '',
    style = {},
    children,
  },
  ref
) {
  const generatedId = useId()
  const cursorId = generatedId.replace(/:/g, '')

  const rootRef = useRef(null)
  const bodyRef = useRef(null)
  const arrowRef = useRef(null)
  const pathRef = useRef(null)
  const tagRef = useRef(null)
  const ringsContainerRef = useRef(null)
  const instanceRef = useRef(null)

  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => false)

  const isGlobal = !children

  const propsRef = useRef({
    color,
    outlineColor,
    lightColor,
    lightOutlineColor,
    autoTheme,
    size,
    outlineWidth,
    shadow,
    turn,
    turnSpeed,
    overshoot,
    stretch,
    settle,
    restAngle,
    press,
    ripple,
    hover,
    label,
    autoplay,
    autoplaySpeed,
    idleDelay,
    interactive,
    disabled,
    reduced: reducedMotion,
    isGlobal,
  })

  useEffect(() => {
    propsRef.current = {
      color,
      outlineColor,
      lightColor,
      lightOutlineColor,
      autoTheme,
      size,
      outlineWidth,
      shadow,
      turn,
      turnSpeed,
      overshoot,
      stretch,
      settle,
      restAngle,
      press,
      ripple,
      hover,
      label,
      autoplay,
      autoplaySpeed,
      idleDelay,
      interactive,
      disabled,
      reduced: reducedMotion,
      isGlobal,
    }
    instanceRef.current?.sync()
  })

  useEffect(() => {
    const rootEl = rootRef.current
    const bodyEl = bodyRef.current
    const arrowEl = arrowRef.current
    const pathEl = pathRef.current
    const tagEl = tagRef.current
    const ringsContainer = ringsContainerRef.current

    if (!rootEl || !bodyEl || !arrowEl || !pathEl || !tagEl || !ringsContainer) return

    const rings = Array.from(ringsContainer.children)
    const doc = rootEl.ownerDocument || document
    const win = doc.defaultView || window
    const finePointerMql = win.matchMedia('(pointer: fine)')

    let rafId = 0
    let lastFrameTime = 0
    let isDestroyed = false
    let isIntersecting = true
    let mode = 'none'
    let lastLayoutKey = ''
    let ringIndex = 0
    let isHoveringInteractive = false
    let isOverNativeInput = false
    let elementCursorLabel = ''
    let isAutoplayHovering = false
    let autoplayLabel = ''
    let currentShownLabel = ''
    let flipSign = 1
    let isCurrentlyLight = false
    let lastElementUnderPointer = null

    const pointerState = {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      vx: 0,
      vy: 0,
      time: 0,
      inside: false,
      seen: false,
      fresh: true,
      leftAt: -1e9,
      heard: 0,
    }

    const cursorState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      spin: 0,
      aim: 0,
      lastFast: -1e9,
      stretch: 0,
      press: 0,
      pressV: 0,
      pressed: false,
      hover: 0,
      hoverV: 0,
      presence: 0,
      presenceV: 0,
      wiggleAt: -1e9,
      placed: false,
    }

    const tagState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      show: 0,
      showV: 0,
    }

    const autoplayState = {
      phase: 'idle',
      t0: 0,
      duration: 1,
      from: { x: 0, y: 0 },
      c1: { x: 0, y: 0 },
      c2: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      until: 0,
      clickAt: -1,
      releaseAt: -1,
      wiggle: false,
      manualUntil: -1e9,
      last: null,
      arrive: [],
    }

    const getRestAngleRad = () => ((propsRef.current.restAngle - 90) * Math.PI) / 180

    const isPointerInteractive = () => {
      const p = propsRef.current
      return p.interactive && !p.disabled && finePointerMql.matches
    }

    // Get active theme colors based on current background luminance
    const getActiveColors = () => {
      const p = propsRef.current
      if (!p.autoTheme) {
        return {
          fill: p.color,
          outline: p.outlineColor,
        }
      }
      if (isCurrentlyLight) {
        return {
          fill: p.lightColor,
          outline: p.lightOutlineColor,
        }
      }
      return {
        fill: p.color,
        outline: p.outlineColor,
      }
    }

    // Update geometry, SVG path, dimensions and colors
    const syncStyles = () => {
      const p = propsRef.current
      const arrowSize = clamp(p.size, 8, 160)
      const strokeW = clamp(p.outlineWidth, 0, 0.35 * arrowSize)
      const layoutKey = `${arrowSize}:${strokeW}`

      if (layoutKey !== lastLayoutKey) {
        lastLayoutKey = layoutKey
        const padding = strokeW + 2
        const totalSize = arrowSize + 2 * padding

        arrowEl.setAttribute('viewBox', `${-arrowSize - padding} ${-arrowSize / 2 - padding} ${totalSize} ${totalSize}`)
        arrowEl.setAttribute('width', `${totalSize}`)
        arrowEl.setAttribute('height', `${totalSize}`)
        arrowEl.style.left = `${-arrowSize - padding}px`
        arrowEl.style.top = `${-arrowSize / 2 - padding}px`
        arrowEl.style.transformOrigin = `${arrowSize + padding}px ${arrowSize / 2 + padding}px`

        pathEl.setAttribute('d', generateArrowPath(arrowSize))
        pathEl.setAttribute('stroke-width', `${2 * strokeW}`)
        tagEl.style.fontSize = `${clamp(0.5 * arrowSize, 11, 16)}px`
      }

      const { fill, outline } = getActiveColors()
      pathEl.setAttribute('fill', fill)
      pathEl.setAttribute('stroke', strokeW > 0 ? outline : 'none')

      const shadowStrength = clamp(p.shadow, 0, 1)
      bodyEl.style.filter =
        shadowStrength > 0
          ? `drop-shadow(0 ${0.5 + shadowStrength}px ${1 + shadowStrength}px rgba(0,0,0,${(0.25 * shadowStrength).toFixed(3)})) drop-shadow(0 ${2 + 3 * shadowStrength}px ${4 + 6 * shadowStrength}px rgba(0,0,0,${(0.2 * shadowStrength).toFixed(3)}))`
          : 'none'

      tagEl.style.background = fill
      tagEl.style.color = outline
      const outlineBoxShadow =
        strokeW > 0 ? `0 0 0 ${Math.min(0.6 * strokeW, 2).toFixed(2)}px ${outline},` : ''
      tagEl.style.boxShadow = `${outlineBoxShadow}0 ${1 + 2 * shadowStrength}px ${3 + 6 * shadowStrength}px rgba(0,0,0,${(0.22 * shadowStrength).toFixed(3)})`

      for (const ring of rings) {
        ring.style.borderColor = fill
        ring.style.boxShadow =
          strokeW > 0 ? `0 0 0 1px ${outline}, inset 0 0 0 1px ${outline}` : 'none'
      }
    }

    let isActiveAttributeSet = false
    const setActive = (active) => {
      if (active !== isActiveAttributeSet) {
        isActiveAttributeSet = active
        if (active) {
          rootEl.setAttribute('data-active', '')
          if (isGlobal) {
            doc.documentElement.setAttribute('data-gyroscope-active', '')
          }
        } else {
          rootEl.removeAttribute('data-active')
          if (isGlobal) {
            doc.documentElement.removeAttribute('data-gyroscope-active')
          }
        }
      }
    }

    // Inspect hovered element for native inputs, interactive links/buttons, labels and background tone
    const inspectElement = (target) => {
      const node = target && target.nodeType === 1 ? target : null
      if (node === lastElementUnderPointer) return
      lastElementUnderPointer = node

      const nativeEl = node?.closest(NATIVE_SELECTOR)
      isOverNativeInput = !!nativeEl && (isGlobal || rootEl.contains(nativeEl))

      const interactiveEl = node?.closest(INTERACTIVE_SELECTOR)
      isHoveringInteractive = !!interactiveEl && (isGlobal || rootEl.contains(interactiveEl))

      const labelEl = node?.closest('[data-cursor-label]')
      elementCursorLabel =
        labelEl && (isGlobal || rootEl.contains(labelEl))
          ? labelEl.getAttribute('data-cursor-label') || ''
          : ''

      // Background color tone adaptation
      if (propsRef.current.autoTheme && node) {
        const light = isElementLight(node)
        if (light !== isCurrentlyLight) {
          isCurrentlyLight = light
          syncStyles()
        }
      }
    }

    // Emit expanding click ripple ring
    const triggerRipple = (x, y) => {
      const p = propsRef.current
      if (!p.ripple || p.reduced) return

      const ring = rings[ringIndex++ % rings.length]
      const radius = 1.05 * clamp(p.size, 8, 160)

      ring.style.width = `${2 * radius}px`
      ring.style.height = `${2 * radius}px`
      ring.style.left = `${-radius}px`
      ring.style.top = `${-radius}px`

      for (const anim of ring.getAnimations()) anim.cancel()

      ring.animate(
        [
          {
            transform: `translate3d(${x}px, ${y}px, 0) scale(0.12)`,
            opacity: 1,
          },
          {
            transform: `translate3d(${x}px, ${y}px, 0) scale(1)`,
            opacity: 0,
          },
        ],
        {
          duration: 560,
          easing: 'cubic-bezier(0.16, 0.84, 0.3, 1)',
          fill: 'forwards',
        }
      )
    }

    const resetPosition = (x, y) => {
      cursorState.x = x
      cursorState.y = y
      cursorState.vx = 0
      cursorState.vy = 0
      cursorState.spin = 0
      cursorState.angle = unwrapAngle(getRestAngleRad(), cursorState.angle)
      cursorState.aim = cursorState.angle
      cursorState.lastFast = -1e9
      cursorState.stretch = 0
      cursorState.placed = true
      tagState.x = x
      tagState.y = y
      tagState.vx = 0
      tagState.vy = 0
    }

    const getBounds = () => {
      if (isGlobal) {
        return {
          rect: { left: 0, top: 0, width: win.innerWidth, height: win.innerHeight },
          width: Math.max(1, win.innerWidth),
          height: Math.max(1, win.innerHeight),
        }
      }
      const rect = rootEl.getBoundingClientRect()
      return {
        rect,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      }
    }

    const startTravel = (targetX, targetY, customDuration, clickOnArrive) => {
      const now = performance.now() / 1000
      const dx = targetX - cursorState.x
      const dy = targetY - cursorState.y
      const dist = Math.hypot(dx, dy)
      const speedFactor = clamp(propsRef.current.autoplaySpeed, 0.1, 5)

      autoplayState.from = { x: cursorState.x, y: cursorState.y }
      autoplayState.to = { x: targetX, y: targetY }

      if (dist < 1) {
        autoplayState.c1 = { ...autoplayState.from }
        autoplayState.c2 = { ...autoplayState.to }
      } else {
        const perpX = -dy / dist
        const perpY = dx / dist
        const bend = (Math.random() - 0.5) * 0.7 * dist
        autoplayState.c1 = {
          x: cursorState.x + 0.3 * dx + perpX * bend,
          y: cursorState.y + 0.3 * dy + perpY * bend,
        }
        autoplayState.c2 = {
          x: cursorState.x + 0.72 * dx - perpX * bend * 0.45,
          y: cursorState.y + 0.72 * dy - perpY * bend * 0.45,
        }
      }

      autoplayState.t0 = now
      autoplayState.duration = Math.max(
        0.05,
        customDuration ?? clamp(0.36 + dist / 820, 0.45, 1.5) / speedFactor
      )
      isAutoplayHovering = false
      autoplayLabel = ''
      autoplayState.phase = 'travel'
      autoplayState.wiggle = !clickOnArrive && Math.random() < 0.35
      autoplayState.clickAt = clickOnArrive ? 1 : -1
    }

    const flushArriveCallbacks = () => {
      for (const cb of autoplayState.arrive.splice(0)) cb()
    }

    const initGhost = () => {
      if (!cursorState.placed || mode === 'pointer') {
        const { width, height } = getBounds()
        const pt = cursorState.placed
          ? {
              x: clamp(cursorState.x, 0.1 * width, 0.9 * width),
              y: clamp(cursorState.y, 0.1 * height, 0.9 * height),
            }
          : {
              x: width * (0.3 + 0.4 * Math.random()),
              y: height * (0.3 + 0.4 * Math.random()),
            }
        resetPosition(pt.x, pt.y)
        cursorState.presence = 0
        cursorState.presenceV = 0
      }
      autoplayState.phase = 'idle'
      autoplayState.releaseAt = -1
      cursorState.pressed = false
    }

    const scheduleLoop = () => {
      if (!isDestroyed && isIntersecting && !rafId) {
        rafId = win.requestAnimationFrame(renderLoop)
      }
    }

    function renderLoop(frameTime) {
      rafId = 0
      if (isDestroyed) return

      const p = propsRef.current
      const dt = lastFrameTime ? clamp((frameTime - lastFrameTime) / 1000, 0, 0.05) : 1 / 60
      lastFrameTime = frameTime
      const now = performance.now() / 1000

      // Determine active tracking mode
      const nextMode = (() => {
        if (p.disabled) return 'none'
        if (isPointerInteractive() && pointerState.inside) return 'pointer'
        const hasManualTask = autoplayState.arrive.length > 0 || now < autoplayState.manualUntil
        const isAutoplayActive = p.autoplay && !p.reduced
        if (
          (!hasManualTask && !isAutoplayActive) ||
          (!hasManualTask && isPointerInteractive() && pointerState.seen && now - pointerState.leftAt < p.idleDelay)
        ) {
          return 'none'
        }
        return 'ghost'
      })()

      if (nextMode !== mode) {
        if (nextMode === 'pointer') {
          resetPosition(pointerState.x, pointerState.y)
          cursorState.presence = 0
          cursorState.presenceV = 0
        } else if (nextMode === 'ghost') {
          initGhost()
        }
        mode = nextMode
      }

      setActive(isPointerInteractive() && pointerState.seen)

      if (mode === 'pointer') {
        const decay = now - pointerState.heard > 0.03 ? Math.exp(-dt / 0.05) : 1
        pointerState.vx *= decay
        pointerState.vy *= decay
        cursorState.x = pointerState.x
        cursorState.y = pointerState.y
        cursorState.vx = pointerState.vx
        cursorState.vy = pointerState.vy
      } else if (mode === 'ghost') {
        // AI roaming / Scripted movement along cubic bezier
        const speedMultiplier = clamp(p.autoplaySpeed, 0.1, 5)
        if (autoplayState.phase === 'travel') {
          const tRaw = clamp((now - autoplayState.t0) / autoplayState.duration, 0, 1)
          const easeT =
            tRaw < 0.5 ? 4 * tRaw * tRaw * tRaw : 1 - Math.pow(2 - 2 * tRaw, 3) / 2
          const speedCurve =
            (tRaw < 0.5 ? 12 * tRaw * tRaw : 3 * Math.pow(2 - 2 * tRaw, 2)) / autoplayState.duration

          const u = 1 - easeT
          const b0 = u * u * u
          const b1 = 3 * u * u * easeT
          const b2 = 3 * u * easeT * easeT
          const b3 = easeT * easeT * easeT

          const posX =
            b0 * autoplayState.from.x +
            b1 * autoplayState.c1.x +
            b2 * autoplayState.c2.x +
            b3 * autoplayState.to.x
          const posY =
            b0 * autoplayState.from.y +
            b1 * autoplayState.c1.y +
            b2 * autoplayState.c2.y +
            b3 * autoplayState.to.y

          const d0 = 3 * u * u
          const d1 = 6 * u * easeT
          const d2 = 3 * easeT * easeT
          const velX =
            d0 * (autoplayState.c1.x - autoplayState.from.x) +
            d1 * (autoplayState.c2.x - autoplayState.c1.x) +
            d2 * (autoplayState.to.x - autoplayState.c2.x)
          const velY =
            d0 * (autoplayState.c1.y - autoplayState.from.y) +
            d1 * (autoplayState.c2.y - autoplayState.c1.y) +
            d2 * (autoplayState.to.y - autoplayState.c2.y)

          cursorState.x = posX
          cursorState.y = posY
          cursorState.vx = velX * speedCurve
          cursorState.vy = velY * speedCurve

          if (tRaw >= 1) {
            const bounds = getBounds()
            const hitEl = doc.elementFromPoint(
              bounds.rect.left + cursorState.x,
              bounds.rect.top + cursorState.y
            )
            if (hitEl && (isGlobal || rootEl.contains(hitEl))) {
              const target = hitEl.closest(INTERACTIVE_SELECTOR)
              const labelElem = hitEl.closest('[data-cursor-label]')
              isAutoplayHovering = !!target
              autoplayLabel = labelElem?.getAttribute('data-cursor-label') || ''
            }
            autoplayState.phase = 'dwell'
            autoplayState.until = now + (0.55 + 0.6 * Math.random()) / speedMultiplier
            autoplayState.clickAt = autoplayState.clickAt > 0 ? now + 0.12 / speedMultiplier : -1
            if (autoplayState.wiggle) {
              cursorState.wiggleAt = now + 0.08
            }
            flushArriveCallbacks()
          }
        } else if (autoplayState.phase === 'dwell') {
          cursorState.vx = 0
          cursorState.vy = 0
          if (autoplayState.clickAt >= 0 && now >= autoplayState.clickAt) {
            autoplayState.clickAt = -1
            cursorState.pressed = true
            autoplayState.releaseAt = now + 0.11
            triggerRipple(cursorState.x, cursorState.y)
          }
          if (autoplayState.releaseAt >= 0 && now >= autoplayState.releaseAt) {
            autoplayState.releaseAt = -1
            cursorState.pressed = false
          }
          if (now >= autoplayState.until) {
            autoplayState.phase = 'idle'
          }
        } else if (p.autoplay && !p.reduced && now >= autoplayState.manualUntil) {
          const { rect, width, height } = getBounds()
          const explicitTargets = Array.from(rootEl.querySelectorAll('[data-cursor-target]'))
          const candidateNodes = (
            explicitTargets.length ? explicitTargets : Array.from(rootEl.querySelectorAll(INTERACTIVE_SELECTOR))
          ).filter((el) => {
            if (el === autoplayState.last || bodyEl.contains(el)) return false
            const b = el.getBoundingClientRect()
            return (
              b.width > 4 &&
              b.height > 4 &&
              b.left >= rect.left - 1 &&
              b.right <= rect.right + 1 &&
              b.top >= rect.top - 1 &&
              b.bottom <= rect.bottom + 1
            )
          })

          if (candidateNodes.length && Math.random() < 0.82) {
            const targetEl = candidateNodes[Math.floor(Math.random() * candidateNodes.length)]
            const b = targetEl.getBoundingClientRect()
            autoplayState.last = targetEl
            startTravel(
              b.left - rect.left + b.width * (0.35 + 0.3 * Math.random()),
              b.top - rect.top + b.height * (0.4 + 0.25 * Math.random()),
              null,
              true
            )
          } else {
            autoplayState.last = null
            const margin = Math.min(0.16, 60 / Math.min(width, height))
            startTravel(
              width * (margin + (1 - 2 * margin) * Math.random()),
              height * (margin + (1 - 2 * margin) * Math.random()),
              null,
              Math.random() < 0.3
            )
          }
        }
      }

      // Gyroscopic directional rotation physics
      const currentSpeed = Math.hypot(cursorState.vx, cursorState.vy)
      const turnPower = p.reduced ? 0 : clamp(p.turn, 0, 1)
      const defaultAngle = getRestAngleRad()

      if (smoothstep((currentSpeed - 40) / 260) > 0.25 && turnPower > 0) {
        cursorState.aim = unwrapAngle(Math.atan2(cursorState.vy, cursorState.vx), cursorState.angle)
        cursorState.lastFast = now
      } else if (now - cursorState.lastFast > Math.max(0, p.settle)) {
        cursorState.aim = unwrapAngle(defaultAngle, cursorState.angle)
      }

      const restAngleUnwrapped = unwrapAngle(defaultAngle, cursorState.angle)
      let headingDelta = wrapAngle(cursorState.aim - restAngleUnwrapped)

      if (Math.abs(headingDelta) > 0.9 * Math.PI) {
        headingDelta = Math.abs(headingDelta) * flipSign
      } else {
        flipSign = Math.sign(headingDelta) || 1
      }

      const desiredAngle = unwrapAngle(restAngleUnwrapped + turnPower * headingDelta, cursorState.angle)
      const turnOmega = 2.6 * TWO_PI * clamp(p.turnSpeed, 0.1, 4)
      const turnZeta = 1 - 0.62 * clamp(p.overshoot, 0, 1)

      stepSpring(cursorState.angle, cursorState.spin, desiredAngle, turnOmega, turnZeta, dt)
      cursorState.angle = springOutput[0]
      cursorState.spin = springOutput[1]

      if (Math.abs(cursorState.angle) > 64 * TWO_PI) {
        const wrapped = wrapAngle(cursorState.angle)
        cursorState.aim += wrapped - cursorState.angle
        cursorState.angle = wrapped
      }

      // Wiggle offset for agent animation
      const wiggleDt = now - cursorState.wiggleAt
      const wiggleOffset =
        wiggleDt >= 0 && wiggleDt < 0.8 && !p.reduced
          ? 0.22 * Math.sin(wiggleDt * TWO_PI * 6.5) * Math.pow(1 - wiggleDt / 0.8, 1.5)
          : 0

      // Squash and stretch along movement vector
      const targetStretch = p.reduced
        ? 0
        : 0.24 * clamp(p.stretch, 0, 1) * smoothstep((currentSpeed - 120) / 1600)
      cursorState.stretch += (targetStretch - cursorState.stretch) * (1 - Math.exp(-dt / 0.06))

      // Press spring
      const targetPress = p.press && cursorState.pressed ? 1 : 0
      if (p.reduced) {
        cursorState.press = targetPress
        cursorState.pressV = 0
      } else {
        stepSpring(cursorState.press, cursorState.pressV, targetPress, 42, 0.5, dt)
        cursorState.press = springOutput[0]
        cursorState.pressV = springOutput[1]
      }

      // Hover grow spring
      const isTargetHovered =
        p.hover && ((mode === 'pointer' && isHoveringInteractive) || (mode === 'ghost' && isAutoplayHovering))
      const targetHover = isTargetHovered ? 1 : 0
      stepSpring(cursorState.hover, cursorState.hoverV, targetHover, 26, 0.72, dt)
      cursorState.hover = springOutput[0]
      cursorState.hoverV = springOutput[1]

      // Presence / visibility spring
      const targetPresence = mode === 'pointer' ? (isOverNativeInput ? 0 : 1) : mode === 'ghost' ? 1 : 0
      stepSpring(cursorState.presence, cursorState.presenceV, targetPresence, 24, 0.9, dt)
      cursorState.presence = springOutput[0]
      cursorState.presenceV = springOutput[1]

      // Calculate final scale & translate transforms
      const presenceFactor = clamp(cursorState.presence, 0, 1)
      const baseScale =
        (0.62 + 0.38 * presenceFactor) *
        (1 - 0.16 * cursorState.press) *
        (1 + 0.14 * cursorState.hover)
      const scaleX = baseScale * (1 + cursorState.stretch)
      const scaleY = baseScale * (1 - 0.45 * cursorState.stretch)

      bodyEl.style.transform = `translate3d(${cursorState.x.toFixed(2)}px, ${cursorState.y.toFixed(2)}px, 0)`
      bodyEl.style.opacity = presenceFactor.toFixed(3)
      arrowEl.style.transform = `rotate(${(cursorState.angle + wiggleOffset).toFixed(4)}rad) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`

      // Name tag trailing spring physics
      const activeLabel =
        (mode === 'pointer' ? elementCursorLabel : mode === 'ghost' ? autoplayLabel : '') || p.label
      if (activeLabel && activeLabel !== currentShownLabel) {
        tagEl.textContent = activeLabel
        if (currentShownLabel) tagState.showV += 4
        currentShownLabel = activeLabel
      }

      const targetTagVisibility = activeLabel ? presenceFactor : 0
      stepSpring(tagState.show, tagState.showV, targetTagVisibility, 24, 0.8, dt)
      tagState.show = springOutput[0]
      tagState.showV = springOutput[1]

      const arrowSize = clamp(p.size, 8, 160)
      const strokeW = clamp(p.outlineWidth, 0, 0.35 * arrowSize)
      const targetTagX = cursorState.x + 0.58 * arrowSize + 0.8 * strokeW
      const targetTagY = cursorState.y + 0.82 * arrowSize + 0.8 * strokeW

      if (p.reduced) {
        tagState.x = targetTagX
        tagState.y = targetTagY
      } else {
        stepSpring(tagState.x, tagState.vx, targetTagX, 34, 0.86, dt)
        tagState.x = springOutput[0]
        tagState.vx = springOutput[1]

        stepSpring(tagState.y, tagState.vy, targetTagY, 34, 0.86, dt)
        tagState.y = springOutput[0]
        tagState.vy = springOutput[1]
      }

      const tagShowFactor = clamp(tagState.show, 0, 1.2)
      tagEl.style.transform = `translate3d(${tagState.x.toFixed(2)}px, ${tagState.y.toFixed(2)}px, 0) scale(${(0.7 + 0.3 * tagShowFactor).toFixed(4)})`
      tagEl.style.opacity = clamp(tagShowFactor, 0, 1).toFixed(3)

      // Check whether animation loop should stay active
      const hasOngoingPhysics =
        currentSpeed > 1 ||
        Math.abs(cursorState.spin) > 0.001 ||
        Math.abs(desiredAngle - cursorState.angle) > 0.001 ||
        Math.abs(cursorState.pressV) > 0.001 ||
        Math.abs(cursorState.press - targetPress) > 0.001 ||
        Math.abs(cursorState.hoverV) > 0.001 ||
        Math.abs(cursorState.hover - targetHover) > 0.001 ||
        Math.abs(cursorState.presenceV) > 0.001 ||
        Math.abs(cursorState.presence - targetPresence) > 0.001 ||
        Math.abs(cursorState.stretch) > 1e-4 ||
        Math.abs(tagState.x - targetTagX) > 0.05 ||
        Math.abs(tagState.y - targetTagY) > 0.05 ||
        Math.abs(tagState.showV) > 0.001 ||
        Math.abs(tagState.show - targetTagVisibility) > 0.001 ||
        wiggleOffset !== 0 ||
        now - cursorState.lastFast < p.settle + 0.05

      const isAwaitingAutoplay =
        !p.disabled &&
        isPointerInteractive() &&
        !pointerState.inside &&
        pointerState.seen &&
        p.autoplay &&
        !p.reduced &&
        now - pointerState.leftAt < p.idleDelay + 0.05

      const isCompletelyIdle =
        mode === 'none' &&
        cursorState.presence < 0.001 &&
        Math.abs(cursorState.presenceV) < 0.001 &&
        tagState.show < 0.001 &&
        Math.abs(tagState.showV) < 0.001

      if (isCompletelyIdle) {
        tagState.x = targetTagX
        tagState.y = targetTagY
        tagState.vx = 0
        tagState.vy = 0
        cursorState.spin = 0
        cursorState.angle = desiredAngle
        cursorState.stretch = 0
      }

      if (mode === 'ghost' || isAwaitingAutoplay || (hasOngoingPhysics && !isCompletelyIdle)) {
        scheduleLoop()
      }
    }

    // Pointer Event Listeners
    const onPointerMove = (e) => {
      if (e.pointerType === 'touch' || !isPointerInteractive()) return

      const bounds = isGlobal
        ? { left: 0, top: 0 }
        : rootEl.getBoundingClientRect()

      const coalesced = e.getCoalescedEvents?.() ?? []
      for (const pt of coalesced.length ? coalesced : [e]) {
        const px = pt.clientX - bounds.left
        const py = pt.clientY - bounds.top
        const t = pt.timeStamp / 1000

        if (pointerState.fresh) {
          pointerState.vx = 0
          pointerState.vy = 0
          pointerState.fresh = false
        } else {
          const deltaT = Math.max(t - pointerState.time, 0.004)
          const smoothing = 1 - Math.exp(-deltaT / 0.045)
          pointerState.vx += ((px - pointerState.x) / deltaT - pointerState.vx) * smoothing
          pointerState.vy += ((py - pointerState.y) / deltaT - pointerState.vy) * smoothing
        }
        pointerState.x = px
        pointerState.y = py
        pointerState.time = t
      }

      pointerState.clientX = e.clientX
      pointerState.clientY = e.clientY
      pointerState.heard = performance.now() / 1000
      pointerState.inside = true
      pointerState.seen = true

      setActive(true)
      inspectElement(e.target)
      scheduleLoop()
    }

    const onPointerLeave = () => {
      if (pointerState.inside) {
        pointerState.inside = false
        pointerState.fresh = true
        pointerState.leftAt = performance.now() / 1000
        cursorState.pressed = false
        isHoveringInteractive = false
        isOverNativeInput = false
        elementCursorLabel = ''
        lastElementUnderPointer = null
        scheduleLoop()
      }
    }

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch' || !isPointerInteractive() || e.button > 0) return
      onPointerMove(e)
      cursorState.pressed = true
      if (!isOverNativeInput) {
        triggerRipple(pointerState.x, pointerState.y)
      }
      scheduleLoop()
    }

    const onPointerUp = () => {
      if (mode !== 'ghost') {
        cursorState.pressed = false
        scheduleLoop()
      }
    }

    const onScroll = () => {
      if (!pointerState.inside) return
      lastElementUnderPointer = null
      const target = doc.elementFromPoint(pointerState.clientX, pointerState.clientY)
      inspectElement(target)
      if (!isGlobal) {
        const bounds = rootEl.getBoundingClientRect()
        pointerState.x = pointerState.clientX - bounds.left
        pointerState.y = pointerState.clientY - bounds.top
      }
      scheduleLoop()
    }

    // Attach listeners
    const listenTarget = isGlobal ? win : rootEl
    listenTarget.addEventListener('pointermove', onPointerMove, { passive: true })
    listenTarget.addEventListener('pointerover', onPointerMove, { passive: true })
    listenTarget.addEventListener('pointerdown', onPointerDown, { passive: true })
    listenTarget.addEventListener('pointerleave', onPointerLeave)
    listenTarget.addEventListener('pointercancel', onPointerLeave)

    win.addEventListener('pointerup', onPointerUp, { passive: true })
    win.addEventListener('blur', onPointerLeave)
    win.addEventListener('scroll', onScroll, { passive: true, capture: true })

    const onPointerFineChange = () => {
      if (!finePointerMql.matches) onPointerLeave()
      scheduleLoop()
    }
    finePointerMql.addEventListener('change', onPointerFineChange)

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            isIntersecting = entry.isIntersecting
            if (isIntersecting) {
              lastFrameTime = 0
              scheduleLoop()
            } else if (rafId) {
              win.cancelAnimationFrame(rafId)
              rafId = 0
            }
          })

    observer?.observe(rootEl)

    cursorState.angle = getRestAngleRad()
    cursorState.aim = cursorState.angle

    syncStyles()
    scheduleLoop()

    instanceRef.current = {
      sync: () => {
        syncStyles()
        if (propsRef.current.disabled || !isPointerInteractive()) {
          setActive(false)
        }
        scheduleLoop()
      },
      moveTo: (targetX, targetY, duration) =>
        new Promise((resolve) => {
          if (
            isDestroyed ||
            !Number.isFinite(targetX) ||
            !Number.isFinite(targetY) ||
            propsRef.current.disabled
          ) {
            resolve()
            return
          }
          autoplayState.manualUntil =
            performance.now() / 1000 + Math.max(propsRef.current.idleDelay, 2) + (duration ?? 1.2)
          if (mode !== 'ghost') {
            initGhost()
            mode = 'ghost'
          }
          autoplayState.arrive.push(resolve)
          startTravel(
            targetX,
            targetY,
            duration != null && Number.isFinite(duration) ? Math.max(0, duration) : null,
            false
          )
          autoplayState.wiggle = false
          scheduleLoop()
        }),
      click: () => {
        if (isDestroyed) return
        const now = performance.now() / 1000
        if (mode === 'ghost') {
          autoplayState.manualUntil = Math.max(
            autoplayState.manualUntil,
            now + Math.max(propsRef.current.idleDelay, 2)
          )
          cursorState.pressed = true
          autoplayState.releaseAt = now + 0.11
        }
        triggerRipple(cursorState.x, cursorState.y)
        scheduleLoop()
      },
      wiggle: () => {
        if (isDestroyed) return
        cursorState.wiggleAt = performance.now() / 1000
        if (mode === 'ghost') {
          autoplayState.manualUntil = Math.max(
            autoplayState.manualUntil,
            performance.now() / 1000 + Math.max(propsRef.current.idleDelay, 2)
          )
        }
        scheduleLoop()
      },
      destroy: () => {
        isDestroyed = true
        if (rafId) win.cancelAnimationFrame(rafId)
        observer?.disconnect()
        listenTarget.removeEventListener('pointermove', onPointerMove)
        listenTarget.removeEventListener('pointerover', onPointerMove)
        listenTarget.removeEventListener('pointerdown', onPointerDown)
        listenTarget.removeEventListener('pointerleave', onPointerLeave)
        listenTarget.removeEventListener('pointercancel', onPointerLeave)
        win.removeEventListener('pointerup', onPointerUp)
        win.removeEventListener('blur', onPointerLeave)
        win.removeEventListener('scroll', onScroll, { capture: true })
        finePointerMql.removeEventListener('change', onPointerFineChange)
        setActive(false)
        flushArriveCallbacks()
        for (const ring of rings) {
          for (const anim of ring.getAnimations()) anim.cancel()
        }
      },
    }

    return () => {
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
  }, [cursorId, isGlobal])

  useImperativeHandle(
    ref,
    () => ({
      moveTo: (x, y, duration) => instanceRef.current?.moveTo(x, y, duration) ?? Promise.resolve(),
      click: () => instanceRef.current?.click(),
      wiggle: () => instanceRef.current?.wiggle(),
    }),
    []
  )

  const activeCssRule = isGlobal
    ? `html[data-gyroscope-active], html[data-gyroscope-active] * { cursor: none !important; }
       html[data-gyroscope-active] :is(${NATIVE_SELECTOR}), html[data-gyroscope-active] :is(${NATIVE_SELECTOR}) * { cursor: auto !important; }`
    : `[data-gyroscope-cursor="${cursorId}"][data-active], [data-gyroscope-cursor="${cursorId}"][data-active] * { cursor: none !important; }
       [data-gyroscope-cursor="${cursorId}"][data-active] :is(${NATIVE_SELECTOR}), [data-gyroscope-cursor="${cursorId}"][data-active] :is(${NATIVE_SELECTOR}) * { cursor: auto !important; }`

  return (
    <div
      ref={rootRef}
      data-gyroscope-cursor={cursorId}
      className={
        isGlobal
          ? 'pointer-events-none fixed inset-0 z-[99999] overflow-hidden'
          : `relative isolate h-full min-h-[240px] w-full ${className}`
      }
      style={style}
    >
      <style>{activeCssRule}</style>
      {children}
      <div
        aria-hidden="true"
        style={{
          position: isGlobal ? 'fixed' : 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 2147483647,
        }}
      >
        {/* Ripple rings */}
        <div ref={ringsContainerRef}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                borderStyle: 'solid',
                borderWidth: 2,
                opacity: 0,
                pointerEvents: 'none',
                willChange: 'transform, opacity',
                transition:
                  'border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>

        {/* Dynamic Name Tag */}
        <div
          ref={tagRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0,
            padding: '0.36em 0.62em 0.4em',
            borderRadius: '0.55em',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            transformOrigin: '0 0',
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            fontFamily: 'var(--font-sans, sans-serif)',
            transition:
              'background-color 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Gyroscope Arrowhead Body */}
        <div
          ref={bodyRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            opacity: 0,
            willChange: 'transform, opacity',
            pointerEvents: 'none',
          }}
        >
          <svg
            ref={arrowRef}
            style={{
              position: 'absolute',
              overflow: 'visible',
              willChange: 'transform',
            }}
            focusable="false"
          >
            <path
              ref={pathRef}
              strokeLinejoin="round"
              paintOrder="stroke"
              style={{
                transition:
                  'fill 0.22s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  )
})

export default GyroscopeCursor
