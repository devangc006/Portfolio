import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useSyncExternalStore,
} from 'react'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Color,
  DataArrayTexture,
  ShaderMaterial,
  Mesh,
  Vector2,
  Vector4,
  RGBAFormat,
  UnsignedByteType,
  SRGBColorSpace,
  LinearMipmapLinearFilter,
  LinearFilter,
} from 'three'

const TWO_PI = 2 * Math.PI

export const DEFAULT_ITEMS = [
  {
    id: 'ente-ksrtc',
    src: '/images/work/ente-ksrtc.png',
    alt: 'Ente KSRTC Case Study',
    title: 'Ente KSRTC',
    subtitle: 'Bus Reservation System',
    href: 'https://enteksrtc-4bda.vercel.app/',
  },
  {
    id: 'odoo-hackathon',
    src: '/images/work/odoo-hackathon.png',
    alt: 'Odoo Hackathon',
    title: 'BRIGHTLOOP',
    subtitle: 'Subscription Management System',
    href: 'https://huggingface.co/spaces/devangc006/odoo-hackathon',
  },
  {
    id: 'grandma-remedies',
    src: '/images/work/grandma-remedies.png',
    alt: 'Grandma\'s Remedies',
    title: 'Grandma\'s Remedies',
    subtitle: 'Home Remedies',
    href: '#grandma',
  },
  {
    id: 'vitalsync',
    src: '/images/work/vitalsync.png',
    alt: 'VitalSync App',
    title: 'VitalSync',
    subtitle: 'Personal Health & Environment Wellness Recommendation System',
    href: '#vitalsync',
  },
  {
    id: 'convergex',
    src: '/images/work/aws-sbg.jpg',
    alt: 'Convergex',
    title: 'Convergex',
    subtitle: 'Social media for various clubs',
    href: '#convergex',
  },
]

export const REEL_PRESETS = {
  column: {
    direction: 'vertical',
    aspect: 1.6,
    size: 0.36,
    curvature: 0.72,
    distance: 3.0,
    tilt: 6,
    gap: 18,
    radius: 14,
    dim: 0.45,
    motionBlur: 0.7,
    friction: 0.5,
    autoplay: 'step',
    speed: 0.25,
  },
  ring: {
    direction: 'horizontal',
    aspect: 1.5,
    size: 0.58,
    curvature: 0.52,
    distance: 2.75,
    tilt: 5,
    gap: 24,
    radius: 16,
    dim: 0.48,
    motionBlur: 0.6,
    friction: 0.5,
    autoplay: 'step',
    speed: 0.25,
  },
  drum: {
    direction: 'horizontal',
    aspect: 1.45,
    size: 0.44,
    curvature: 0.8,
    distance: 2.8,
    tilt: 10,
    gap: 14,
    radius: 14,
    dim: 0.5,
    motionBlur: 0.6,
    friction: 0.5,
    autoplay: 'step',
    speed: 0.25,
  },
  portrait: {
    direction: 'horizontal',
    aspect: 0.72,
    size: 0.6,
    curvature: 0.55,
    distance: 3.2,
    tilt: 4,
    gap: 20,
    radius: 16,
    dim: 0.45,
    motionBlur: 0.6,
    friction: 0.5,
    autoplay: 'step',
    speed: 0.25,
  },
  cinema: {
    direction: 'horizontal',
    aspect: 2.35,
    size: 0.32,
    curvature: 0.45,
    distance: 3.4,
    tilt: 4,
    gap: 16,
    radius: 6,
    dim: 0.55,
    motionBlur: 0.6,
    friction: 0.5,
    autoplay: 'step',
    speed: 0.25,
  },
  showreel: {
    direction: 'horizontal',
    aspect: 1.6,
    size: 0.42,
    curvature: 0.7,
    distance: 3.0,
    tilt: 8,
    gap: 18,
    radius: 14,
    dim: 0.45,
    motionBlur: 1.4,
    friction: 0.35,
    autoplay: 'spin',
    speed: 0.25,
  },
  marquee: {
    direction: 'horizontal',
    aspect: 1.4,
    size: 0.36,
    curvature: 0.25,
    distance: 3.0,
    tilt: 0,
    gap: 16,
    radius: 12,
    dim: 0.4,
    motionBlur: 0.6,
    friction: 0.5,
    autoplay: 'drift',
    speed: 0.35,
  },
}

const clamp = (val, min, max) => Math.min(max, Math.max(min, val))
const smoothstep = (min, max, val) => {
  const t = clamp((val - min) / (max - min), 0, 1)
  return t * t * (3 - 2 * t)
}
const sinc = (x) => (Math.abs(x) < 1e-4 ? 1 - (x * x) / 6 : Math.sin(x) / x)

const subscribeReducedMotion = (cb) => {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const getReducedMotionSnapshot = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const parseHexColor = (hex) => {
  const clean = hex.trim().replace('#', '')
  if (!/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(clean)) return null
  const expanded = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean
  return [0, 2, 4].map((i) => Number.parseInt(expanded.slice(i, i + 2), 16) / 255)
}

const springStep = (pos, vel, target, dt, damping, stiffness) => {
  const w = TWO_PI / Math.max(damping, 0.02)
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
  const subDt = dt / steps
  let v = vel
  let p = pos
  for (let i = 0; i < steps; i++) {
    v += (w * w * (target - p) - 2 * stiffness * w * v) * subDt
    p += v * subDt
  }
  return [p, v]
}

const SR_STYLES = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

const FILL_STYLES = {
  position: 'absolute',
  inset: 0,
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
}

const CAPTION_CONTAINER_STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  opacity: 0,
  willChange: 'transform, opacity',
  zIndex: 20,
}

const VERTEX_SHADER = `
uniform vec4 uBand;

void main() {
  vec2 p = mix(uBand.xy, uBand.zw, position.xy * 0.5 + 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray uImages;
uniform float uAspect[32];
uniform float uFade[32];
uniform int uCount;
uniform vec2 uView;
uniform float uDpr;
uniform vec2 uCenter;
uniform float uVertical;
uniform float uDist;
uniform float uTilt;
uniform float uK;
uniform float uPitch;
uniform float uAlong;
uniform float uAcross;
uniform float uCardAspect;
uniform float uRadius;
uniform float uPos;
uniform float uMotion;
uniform int uSamples;
uniform float uDim;
uniform float uEdge;
uniform float uIntro;
uniform vec3 uPlaceholder;

float sinc(float x) {
  return abs(x) < 1e-4 ? 1.0 - x * x / 6.0 : sin(x) / x;
}

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 sp = frag - uCenter;
  vec2 rp = uVertical > 0.5 ? vec2(-sp.y, sp.x) : sp;
  float edgeDistance = uVertical > 0.5 ? min(frag.y, uView.y - frag.y) : min(frag.x, uView.x - frag.x);
  float edge = uEdge > 0.5 ? smoothstep(0.0, uEdge, edgeDistance) : 1.0;

  float ct = cos(uTilt);
  float st = sin(uTilt);
  vec3 o = vec3(0.0, uDist * st, uDist * ct);
  vec3 forward = -vec3(0.0, st, ct);
  vec3 up = vec3(0.0, ct, -st);
  vec3 d = normalize(forward * uDist + vec3(rp.x, 0.0, 0.0) + up * rp.y);

  float A = uK * (d.x * d.x + d.z * d.z);
  float B = 2.0 * (uK * (o.x * d.x + o.z * d.z) + d.z);
  float C = uK * (o.x * o.x + o.z * o.z) + 2.0 * o.z;
  float disc = B * B - 4.0 * A * C;
  float t;
  if (disc >= 0.0) {
    float q = -0.5 * (B + (B < 0.0 ? -1.0 : 1.0) * sqrt(disc));
    t = C / q;
  } else {
    t = -B / max(2.0 * A, 1e-12);
  }
  vec3 h = o + t * d;
  float s = uK > 1e-7 ? atan(uK * h.x, 1.0 + uK * h.z) / uK : h.x;

  vec2 gs = vec2(dFdx(s), dFdy(s));
  vec2 gy = vec2(dFdx(h.y), dFdy(h.y));
  float gLimit = 0.35 * min(uAlong, uAcross);
  gs = clamp(gs, -gLimit, gLimit);
  gy = clamp(gy, -gLimit, gLimit);
  float pixel = 1.0 / (uDist * uDpr);

  vec2 imgDx;
  vec2 imgDy;
  if (uVertical > 0.5) {
    imgDx = vec2(gy.x / uAcross, -gs.x / uAlong);
    imgDy = vec2(gy.y / uAcross, -gs.y / uAlong);
  } else {
    imgDx = vec2(gs.x / uAlong, gy.x / uAcross);
    imgDy = vec2(gs.y / uAlong, gy.y / uAcross);
  }

  int samples = max(uSamples, 1);
  float travel = abs(uMotion) * uPitch / float(samples);
  if (uVertical > 0.5) {
    imgDy += vec2(0.0, travel / uAlong);
  } else {
    imgDx += vec2(travel / uAlong, 0.0);
  }

  float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec2 halfSize = 0.5 * vec2(uAlong, uAcross);
  float radius = min(uRadius, min(halfSize.x, halfSize.y));
  vec4 total = vec4(0.0);

  for (int k = 0; k < 28; k++) {
    if (k >= samples) break;
    float tk = samples > 1 ? (float(k) + jitter) / float(samples) - 0.5 : 0.0;
    float sigma = s / uPitch + uPos + uMotion * tk;
    float j = floor(sigma + 0.5);
    float side = sigma - j > 0.0 ? 1.0 : -1.0;
    for (int m = 0; m < 2; m++) {
      float panel = m == 0 ? j : j + side;
      float sc = (panel - uPos - uMotion * tk) * uPitch;
      float a = sc * uK;
      float sa = sin(a);
      float ca = cos(a);
      vec3 n = vec3(sa, 0.0, ca);
      float denom = dot(n, d);
      if (denom > -1e-4) continue;
      float hs = sinc(0.5 * a);
      vec3 P = vec3(sc * sinc(a), 0.0, -sc * 0.5 * a * hs * hs);
      float tt = dot(n, P - o) / denom;
      vec3 hp = o + tt * d;
      float u = dot(hp - P, vec3(ca, 0.0, -sa));
      float v = hp.y;
      vec2 lp = vec2(u, v);
      vec2 qd = abs(lp) - halfSize + radius;
      float sd = length(max(qd, 0.0)) + min(max(qd.x, qd.y), 0.0) - radius;
      vec2 g = (qd.x > 0.0 || qd.y > 0.0) ? normalize(max(qd, 1e-6)) : (qd.x > qd.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
      float footprint = tt * pixel;
      float footprintU = footprint / max(-denom, 0.12);
      float aa = 0.75 * length(g * vec2(footprintU, footprint));
      aa = max(aa, 0.5 * travel * g.x);
      float coverage = 1.0 - smoothstep(-aa, aa, sd);
      if (coverage <= 0.0) continue;
      float countF = float(max(uCount, 1));
      float mPanel = mod(panel, countF);
      if (mPanel < 0.0) mPanel += countF;
      int layer = int(floor(mPanel + 0.001));
      if (layer >= uCount) layer = 0;
      if (layer < 0) layer = 0;
      float imageAspect = uAspect[layer];
      vec2 img = uVertical > 0.5
        ? vec2(v / uAcross, -u / uAlong)
        : vec2(u / uAlong, v / uAcross);
      vec2 crop = uCardAspect > imageAspect
        ? vec2(1.0, imageAspect / uCardAspect)
        : vec2(uCardAspect / imageAspect, 1.0);
      vec2 uv = img * crop + 0.5;
      vec3 color = textureGrad(uImages, vec3(uv.x, 1.0 - uv.y, float(layer)), imgDx * crop * vec2(1.0, -1.0), imgDy * crop * vec2(1.0, -1.0)).rgb;
      color = mix(uPlaceholder, color, uFade[layer]);
      float facing = (1.0 - uDim * smoothstep(0.12, 1.5, abs(a))) * smoothstep(0.03, 0.24, -denom);
      float weight = coverage * facing;
      total += vec4(color * weight, weight);
    }
  }

  total /= float(samples);
  float alpha = clamp(total.a, 0.0, 1.0) * edge * uIntro;
  vec3 rgb = total.a > 1e-5 ? total.rgb / total.a : vec3(0.0);
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`

let testCanvasCtx = null
const normalizeCssColor = (colorStr) => {
  if (!colorStr || /^rgba?\(/i.test(colorStr)) return colorStr
  if (typeof document === 'undefined') return colorStr
  if (!testCanvasCtx) {
    const c = document.createElement('canvas')
    testCanvasCtx = c.getContext('2d', { willReadFrequently: true })
  }
  if (!testCanvasCtx) return colorStr
  testCanvasCtx.fillStyle = '#010203'
  testCanvasCtx.fillStyle = colorStr
  if (testCanvasCtx.fillStyle === '#010203' && colorStr.trim().toLowerCase() !== '#010203') {
    return colorStr
  }
  testCanvasCtx.clearRect(0, 0, 1, 1)
  testCanvasCtx.fillRect(0, 0, 1, 1)
  const d = testCanvasCtx.getImageData(0, 0, 1, 1).data
  return d[3] === 255
    ? `rgb(${d[0]}, ${d[1]}, ${d[2]})`
    : `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${Math.round((d[3] / 255) * 1e3) / 1e3})`
}

export const VerticalReel = forwardRef(function VerticalReel(
  {
    items = DEFAULT_ITEMS,
    preset = 'column',
    startIndex = 0,
    direction,
    aspect,
    size,
    curvature,
    distance,
    tilt,
    gap,
    radius,
    dim,
    edgeFade = 0.5,
    motionBlur,
    friction,
    snap = true,
    autoplay,
    speed,
    interval = 3.5,
    pauseOnHover = true,
    draggable = true,
    wheel = true,
    captions = true,
    backgroundColor = 'transparent',
    paused = false,
    dpr = 2,
    ariaLabel = 'Interactive 3D image reel. Drag or flick to spin it, scroll or use arrow keys to navigate.',
    onIndexChange,
    onSelect,
    className = '',
    style = {},
  },
  ref
) {
  const containerRef = useRef(null)
  const canvasHolderRef = useRef(null)
  const captionRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const engineRef = useRef(null)

  const selectedPreset = REEL_PRESETS[preset] || REEL_PRESETS.column

  const finalDirection = direction ?? selectedPreset.direction ?? 'vertical'
  const finalAspect = aspect ?? selectedPreset.aspect ?? 1.6
  const finalSize = size ?? selectedPreset.size ?? 0.36
  const finalCurvature = curvature ?? selectedPreset.curvature ?? 0.72
  const finalDistance = distance ?? selectedPreset.distance ?? 3.0
  const finalTilt = tilt ?? selectedPreset.tilt ?? 6
  const finalGap = gap ?? selectedPreset.gap ?? 18
  const finalRadius = radius ?? selectedPreset.radius ?? 14
  const finalDim = dim ?? selectedPreset.dim ?? 0.45
  const finalMotionBlur = motionBlur ?? selectedPreset.motionBlur ?? 0.7
  const finalFriction = friction ?? selectedPreset.friction ?? 0.5
  const finalAutoplay = autoplay ?? selectedPreset.autoplay ?? 'step'
  const finalSpeed = speed ?? selectedPreset.speed ?? 0.25

  const prefersReduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const effectiveItems = items.length ? items : DEFAULT_ITEMS
  const itemsRef = useRef(effectiveItems)

  const [initialIndex] = useState(() => clamp(Math.round(startIndex), 0, Math.max(effectiveItems.length - 1, 0)))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isHeld, setIsHeld] = useState(false)
  const [hasWebGlError, setHasWebGlError] = useState(false)

  const config = {
    direction: finalDirection,
    aspect: finalAspect,
    size: finalSize,
    curvature: finalCurvature,
    distance: finalDistance,
    tilt: finalTilt,
    gap: finalGap,
    radius: finalRadius,
    dim: finalDim,
    edgeFade,
    motionBlur: finalMotionBlur,
    friction: finalFriction,
    snap,
    autoplay: finalAutoplay,
    speed: finalSpeed,
    interval,
    pauseOnHover,
    draggable,
    wheel,
    captions,
    backgroundColor,
    paused,
    dpr,
    reduced: prefersReduced,
    held: isHeld,
  }
  const configRef = useRef(config)
  const callbacksRef = useRef({ onIndexChange, onSelect })

  useEffect(() => {
    configRef.current = config
    itemsRef.current = effectiveItems
    callbacksRef.current = { onIndexChange, onSelect }
    engineRef.current?.sync()
  })

  useEffect(() => {
    const container = containerRef.current
    const canvasHolder = canvasHolderRef.current
    const captionEl = captionRef.current
    const titleEl = titleRef.current
    const subtitleEl = subtitleRef.current
    if (!container || !canvasHolder || !captionEl || !titleEl || !subtitleEl) return

    const engine = ((containerEl, canvasHolderEl, captions, cfgRef, itmsRef, startIdx, cbs) => {
      const doc = containerEl.ownerDocument
      const win = doc.defaultView || window
      const canvas = doc.createElement('canvas')
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'

      let renderer
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          premultipliedAlpha: true,
          powerPreference: 'high-performance',
        })
      } catch {
        return null
      }

      canvasHolderEl.appendChild(canvas)
      renderer.setClearColor(0, 0)

      const scene = new Scene()
      const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
      const quad = new PlaneGeometry(2, 2)
      const placeholderCol = new Color(0.5, 0.5, 0.5)
      const aspects = Array(32).fill(1.6)
      const fades = Array(32).fill(0)

      let texW = 896
      let texH = 560
      let texData = new Uint8Array(texW * texH * 4)
      let dataTexture = new DataArrayTexture(texData, texW, texH, 1)

      const scratch = doc.createElement('canvas')
      const scratchCtx = scratch.getContext('2d', { willReadFrequently: true })

      const material = new ShaderMaterial({
        uniforms: {
          uImages: { value: dataTexture },
          uAspect: { value: aspects },
          uFade: { value: fades },
          uCount: { value: 1 },
          uView: { value: new Vector2(1, 1) },
          uDpr: { value: 1 },
          uCenter: { value: new Vector2(0, 0) },
          uVertical: { value: 0 },
          uDist: { value: 1200 },
          uTilt: { value: 0 },
          uK: { value: 0.001 },
          uPitch: { value: 480 },
          uAlong: { value: 460 },
          uAcross: { value: 288 },
          uCardAspect: { value: 1.6 },
          uRadius: { value: 12 },
          uPos: { value: 0 },
          uMotion: { value: 0 },
          uSamples: { value: 1 },
          uDim: { value: 0.4 },
          uEdge: { value: 0 },
          uIntro: { value: 0 },
          uPlaceholder: { value: placeholderCol },
          uBand: { value: new Vector4(-1, -1, 1, 1) },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        premultipliedAlpha: true,
        depthTest: false,
        depthWrite: false,
      })

      const mesh = new Mesh(quad, material)
      mesh.frustumCulled = false
      scene.add(mesh)

      let layers = []
      let lastSrcKey = ''
      let viewW = 0
      let viewH = 0
      let dprVal = 1
      let hasSize = false
      let pos = startIdx
      let vel = 0
      let smoothedVel = 0
      let lastPos = startIdx
      let springTarget = null
      let springStiffness = 0.7
      let springDamping = 0.9
      let settleTarget = null
      let wheelTime = 0
      let wheelActive = false
      let pauseUntil = 0
      let nextAutoplay = 0
      let autoplayFactor = 1
      let introStarted = false
      let introStartTime = 0
      let introProgress = 0
      let isHovered = false
      let wasDragged = false
      let rafId = 0
      let autoplayTimer = 0
      let lastTime = 0
      let isVisible = false
      let isDestroyed = false
      let isContextLost = false
      let lastActiveIdx = NaN
      let lastCaptionIdx = NaN
      let captionOpacity = -1
      let captionX = NaN
      let captionY = NaN
      let lastBgCheck = -10
      let pointerState = null

      const geom = {
        along: 460,
        across: 288,
        pitch: 484,
        k: 0.001,
        dist: 1200,
        tilt: 0,
        cx: 0,
        cy: 0,
        vertical: false,
        cardW: 460,
        cardH: 288,
      }

      const getCount = () => Math.min(Math.max(itmsRef.current.length, 1), 32)
      const wrapIdx = (i) => ((i % getCount()) + getCount()) % getCount()

      let currentAllocatedLayers = 0
      const allocateTexture = (neededCount) => {
        const targetW = clamp(64 * Math.ceil((geom.cardW * Math.min(dprVal, 2)) / 64), 384, 1536)
        const isMuchLarger = targetW > 1.3 * texW
        if (currentAllocatedLayers === neededCount && !isMuchLarger) return false

        const newW = currentAllocatedLayers === 0 || isMuchLarger ? targetW : texW
        const newH = Math.round(newW / (geom.cardW / Math.max(geom.cardH, 1)))
        currentAllocatedLayers = neededCount
        texW = newW
        texH = newH
        texData = new Uint8Array(texW * texH * 4 * neededCount)
        dataTexture.dispose()

        dataTexture = new DataArrayTexture(texData, texW, texH, neededCount)
        dataTexture.format = RGBAFormat
        dataTexture.type = UnsignedByteType
        dataTexture.colorSpace = SRGBColorSpace
        dataTexture.minFilter = LinearMipmapLinearFilter
        dataTexture.magFilter = LinearFilter
        dataTexture.generateMipmaps = true
        dataTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
        dataTexture.needsUpdate = true

        material.uniforms.uImages.value = dataTexture
        layers.forEach((l) => {
          l.drawn = false
        })
        return true
      }

      const drawLayer = (index) => {
        const layer = layers[index]
        if (!layer || !layer.ready || layer.drawn || !scratchCtx) return false
        scratch.width = texW
        scratch.height = texH
        try {
          scratchCtx.drawImage(layer.image, 0, 0, texW, texH)
          const imgData = scratchCtx.getImageData(0, 0, texW, texH).data
          texData.set(imgData, index * texW * texH * 4)
        } catch {
          return false
        }
        layer.drawn = true
        dataTexture.addLayerUpdate(index)
        dataTexture.needsUpdate = true
        return true
      }

      const syncImages = () => {
        const list = itmsRef.current.slice(0, 32)
        const srcKey = list.map((i) => i.src).join('\0')
        if (srcKey === lastSrcKey) return
        lastSrcKey = srcKey

        layers.forEach((l) => {
          l.image.onload = null
        })

        const total = Math.max(list.length, 1)
        const activeWrap = wrapIdx(Math.round(pos))

        layers = list.map((item, idx) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.decoding = 'async'
          const dist = Math.abs(idx - activeWrap) % total
          img.fetchPriority = Math.min(dist, total - dist) <= 2 ? 'high' : 'low'
          const layerState = {
            image: img,
            ready: false,
            drawn: false,
            aspect: 1.6,
            fade: 0,
          }
          img.onload = () => {
            if (isDestroyed) return
            const onReady = () => {
              if (isDestroyed || layerState.ready) return
              layerState.aspect = img.naturalWidth / Math.max(img.naturalHeight, 1)
              layerState.ready = true
              requestRender()
            }
            if (img.decode) {
              img.decode().then(onReady, onReady)
            } else {
              onReady()
            }
          }
          img.src = item.src
          return layerState
        })

        allocateTexture(total)
        fades.fill(0)
      }

      const updateDimensions = () => {
        const curCfg = cfgRef.current
        const w = Math.round(containerEl.clientWidth)
        const h = Math.round(containerEl.clientHeight)
        if (w < 2 || h < 2) {
          hasSize = false
          return false
        }
        const pixelRatio = Math.min(win.devicePixelRatio || 1, Math.max(curCfg.dpr, 0.5))
        if (!hasSize || w !== viewW || h !== viewH || pixelRatio !== dprVal) {
          hasSize = true
          viewW = w
          viewH = h
          dprVal = pixelRatio
          renderer.setPixelRatio(dprVal)
          renderer.setSize(viewW, viewH, false)
          return true
        }
        return false
      }

      const updateBackgroundColor = () => {
        const bgVal = cfgRef.current.backgroundColor
        const col = new Color()
        if (parseHexColor(bgVal)) {
          col.setStyle(bgVal, SRGBColorSpace)
        } else {
          let node = containerEl
          let found = false
          while (node && !found) {
            const parsed = normalizeCssColor(win.getComputedStyle(node).backgroundColor)
            if (parsed && parsed !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(parsed)) {
              col.setStyle(parsed, SRGBColorSpace)
              found = true
            }
            node = node.parentElement
          }
          if (!found) {
            const textColor = new Color()
            textColor.setStyle(normalizeCssColor(win.getComputedStyle(containerEl).color) || '#fff', SRGBColorSpace)
            col.setHex(textColor.r + textColor.g + textColor.b > 1.5 ? 0x0a0a0a : 0xffffff, SRGBColorSpace)
          }
        }
        const isBright = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b > 0.6
        placeholderCol.copy(col).lerp(new Color(isBright ? 0x000000 : 0xffffff), 0.1)
      }

      const computeGeometry = () => {
        const curCfg = cfgRef.current
        const isVert = curCfg.direction === 'vertical'
        const asp = clamp(curCfg.aspect, 0.4, 3)
        const captionSpace = curCfg.captions && !isVert ? 70 : 0
        let cardH
        if (isVert) {
          cardH = clamp(curCfg.size, 0.15, 0.9) * viewH
          const maxW = 0.62 * viewW
          if (cardH * asp > maxW) cardH = maxW / asp
        } else {
          cardH = clamp(curCfg.size, 0.15, 0.9) * Math.max(viewH - captionSpace, 0.5 * viewH)
          const maxW = 0.68 * viewW
          if (cardH * asp > maxW) cardH = maxW / asp
        }
        const cardW = cardH * asp

        geom.vertical = isVert
        geom.cardW = cardW
        geom.cardH = cardH
        geom.along = isVert ? cardH : cardW
        geom.across = isVert ? cardW : cardH
        geom.pitch = geom.along + Math.max(curCfg.gap, 0)
        geom.k = (0.78 * clamp(curCfg.curvature, 0, 1)) / geom.pitch
        geom.dist = clamp(curCfg.distance, 1.2, 12) * geom.along
        geom.tilt = (clamp(curCfg.tilt, -25, 25) * Math.PI) / 180

        const captionOffset = curCfg.captions && isVert && viewW >= 560 ? Math.min(0.12 * viewW, 150) : 0
        geom.cx = viewW / 2 - captionOffset
        geom.cy = viewH / 2 + captionSpace / 2
      }

      const projectPoint = (alongOffset, acrossOffset, zOffset) => {
        const theta = alongOffset * geom.k
        const s = sinc(0.5 * theta)
        const px = alongOffset * sinc(theta) + acrossOffset * Math.cos(theta)
        const py = zOffset
        const pz = -0.5 * alongOffset * theta * s * s - acrossOffset * Math.sin(theta)

        const cosT = Math.cos(geom.tilt)
        const sinT = Math.sin(geom.tilt)
        const camY = geom.dist * sinT
        const camZ = geom.dist * cosT

        const dy = py - camY
        const dz = pz - camZ
        const forward = -(dy * sinT + dz * cosT)
        if (forward < 1) return null

        const scale = geom.dist / forward
        const sx = px * scale
        const sy = (dy * cosT - dz * sinT) * scale

        const fx = geom.vertical ? sy : sx
        const fy = geom.vertical ? -sx : sy
        return {
          x: geom.cx + fx,
          y: viewH - (geom.cy + fy),
        }
      }

      const raycastIndex = (clientX, clientY) => {
        const rect = containerEl.getBoundingClientRect()
        const px = clientX - rect.left
        const py = viewH - (clientY - rect.top)
        const dx = px - geom.cx
        const dy = py - geom.cy

        const rx = geom.vertical ? -dy : dx
        const ry = geom.vertical ? dx : dy

        const cosT = Math.cos(geom.tilt)
        const sinT = Math.sin(geom.tilt)
        const o = [0, geom.dist * sinT, geom.dist * cosT]
        const dir = [rx, -sinT * geom.dist + cosT * ry, -cosT * geom.dist - sinT * ry]
        const len = Math.hypot(dir[0], dir[1], dir[2])
        const d = [dir[0] / len, dir[1] / len, dir[2] / len]

        const kVal = geom.k
        const quadA = kVal * (d[0] * d[0] + d[2] * d[2])
        const quadB = 2 * (kVal * (o[0] * d[0] + o[2] * d[2]) + d[2])
        const quadC = kVal * (o[0] * o[0] + o[2] * o[2]) + 2 * o[2]
        const disc = quadB * quadB - 4 * quadA * quadC
        const hitT =
          disc >= 0
            ? quadC / (-0.5 * (quadB + (quadB < 0 ? -1 : 1) * Math.sqrt(disc)))
            : -quadB / Math.max(2 * quadA, 1e-12)

        const hitX = o[0] + hitT * d[0]
        const hitZ = o[2] + hitT * d[2]
        const ang = (kVal > 1e-7 ? Math.atan2(kVal * hitX, 1 + kVal * hitZ) / kVal : hitX) / geom.pitch + pos
        const roundCard = Math.round(ang)

        for (const cIdx of [roundCard, roundCard + (ang - roundCard > 0 ? 1 : -1)]) {
          const sDist = (cIdx - pos) * geom.pitch
          const alpha = sDist * kVal
          const normal = [Math.sin(alpha), 0, Math.cos(alpha)]
          const dotProd = normal[0] * d[0] + normal[2] * d[2]
          if (dotProd > -1e-4) continue

          const halfSinc = sinc(0.5 * alpha)
          const p = [sDist * sinc(alpha), 0, -0.5 * sDist * alpha * halfSinc * halfSinc]
          const tt = (normal[0] * (p[0] - o[0]) + normal[1] * (p[1] - o[1]) + normal[2] * (p[2] - o[2])) / dotProd
          const hp = [o[0] + tt * d[0], o[1] + tt * d[1], o[2] + tt * d[2]]

          const cardU = (hp[0] - p[0]) * Math.cos(alpha) - (hp[2] - p[2]) * Math.sin(alpha)
          const cardV = hp[1]
          if (Math.abs(cardU) <= geom.along / 2 && Math.abs(cardV) <= geom.across / 2) {
            return cIdx
          }
        }
        return null
      }

      const requestRender = () => {
        if (isDestroyed || isContextLost || !isVisible || rafId) return
        if (autoplayTimer) {
          win.clearTimeout(autoplayTimer)
          autoplayTimer = 0
        }
        rafId = requestAnimationFrame(renderLoop)
      }

      const pauseAutoplay = (duration = 2.6) => {
        const now = performance.now() / 1e3
        pauseUntil = Math.max(pauseUntil, now + duration)
        nextAutoplay = Math.max(nextAutoplay, now + Math.max(cfgRef.current.interval, duration))
      }

      const goToSpring = (target, stiffness, damping) => {
        springTarget = target
        springStiffness = stiffness
        springDamping = damping
        settleTarget = null
        requestRender()
      }

      const step = (offset) => {
        goToSpring(Math.round(springTarget ?? pos) + offset, 0.62, 0.9)
        pauseAutoplay()
      }

      const goTo = (index) => {
        const count = getCount()
        const currentTarget = Math.round(springTarget ?? pos)
        const diff = ((((index - wrapIdx(currentTarget)) % count) + count + Math.floor(count / 2)) % count) - Math.floor(count / 2)
        goToSpring(currentTarget + diff, 0.75 + 0.06 * Math.min(Math.abs(diff), 6), 0.9)
        pauseAutoplay()
      }

      const spin = (count) => {
        const num = Math.round(count)
        if (num) {
          goToSpring(Math.round(springTarget ?? pos) + num, 1.1 + 0.08 * Math.min(Math.abs(num), 12), 0.92)
          pauseAutoplay()
        }
      }

      function updateCaptions(reducedMotion) {
        if (!(cfgRef.current.captions && (!geom.vertical || viewW >= 560))) {
          if (captionOpacity !== 0) {
            captionOpacity = 0
            captions.caption.style.opacity = '0'
          }
          return
        }

        const centerIdx = Math.round(pos)
        if (centerIdx !== lastCaptionIdx) {
          lastCaptionIdx = centerIdx
          const item = itmsRef.current[wrapIdx(centerIdx)]
          captions.title.textContent = item ? item.title ?? item.alt : ''
          captions.subtitle.textContent = item?.subtitle ?? ''
          captions.subtitle.style.display = item?.subtitle ? '' : 'none'
        }

        const targetOpacity =
          (1 - smoothstep(0.06, 0.32, Math.abs(pos - centerIdx))) *
          (1 - smoothstep(1.2, 3.5, Math.abs(smoothedVel))) *
          (reducedMotion ? 1 : smoothstep(0.4, 1, introProgress))

        let targetX, targetY
        if (geom.vertical) {
          const pt = projectPoint(0, 0, geom.across / 2)
          targetX = pt ? pt.x + 28 : geom.cx + geom.across / 2 + 28
          targetY = viewH / 2 - 28
          captions.caption.style.alignItems = 'flex-start'
          captions.caption.style.textAlign = 'left'
        } else {
          const pt = projectPoint(0, 0, -geom.across / 2)
          targetX = geom.cx
          targetY = (pt ? pt.y : viewH / 2 + geom.across / 2) + 26
          captions.caption.style.alignItems = 'center'
          captions.caption.style.textAlign = 'center'
        }

        const transformStr = geom.vertical
          ? `translate(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px)`
          : `translate(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px) translateX(-50%)`

        if (
          Number.isNaN(captionX) ||
          Math.abs(targetX - captionX) > 0.05 ||
          Math.abs(targetY - captionY) > 0.05
        ) {
          captionX = targetX
          captionY = targetY
          captions.caption.style.transform = transformStr
        }

        if (Math.abs(targetOpacity - captionOpacity) > 0.002) {
          captionOpacity = targetOpacity
          captions.caption.style.opacity = targetOpacity.toFixed(3)
        }
      }

      function renderLoop(time) {
        rafId = 0
        if (isDestroyed || isContextLost || (!hasSize && (updateDimensions(), !hasSize))) return

        const curCfg = cfgRef.current
        const dt = lastTime && time - lastTime < 100 ? Math.min(Math.max((time - lastTime) / 1e3, 0), 0.05) : 1 / 60
        lastTime = time

        const now = performance.now() / 1e3
        const isReduced = curCfg.reduced
        const totalItems = getCount()
        let needsNextFrame = false

        if (now - lastBgCheck > 1.2) {
          lastBgCheck = now
          updateBackgroundColor()
        }
        updateDimensions()
        computeGeometry()

        if (allocateTexture(Math.max(layers.length, 1))) needsNextFrame = true

        let layerUpdated = false
        const activeWrap = wrapIdx(Math.round(pos))
        const sortedLayers = layers
          .map((layer, idx) => ({
            index: idx,
            distance: Math.min(Math.abs(idx - activeWrap), totalItems - Math.abs(idx - activeWrap)),
          }))
          .sort((a, b) => a.distance - b.distance)

        for (const item of sortedLayers) {
          const layer = layers[item.index]
          if (layer.ready && !layer.drawn && (layerUpdated = drawLayer(item.index))) {
            break
          }
        }
        if (layerUpdated) needsNextFrame = true

        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i]
          aspects[i] = layer.aspect
          if (layer.drawn && layer.fade < 1) {
            layer.fade = isReduced || !introStarted ? 1 : Math.min(1, layer.fade + dt / 0.45)
            needsNextFrame = true
          }
          fades[i] = layer.drawn ? layer.fade : 0
        }
        for (let i = layers.length; i < 32; i++) {
          const wrapI = i % (layers.length || 1)
          aspects[i] = aspects[wrapI]
          fades[i] = fades[wrapI]
        }

        if (!introStarted) {
          if (!introStartTime) introStartTime = now
          let allReady = true
          for (let offset = -2; offset <= 2; offset++) {
            const checkLayer = layers[wrapIdx(Math.round(pos) + offset)]
            if (checkLayer && !checkLayer.drawn) allReady = false
          }
          if (allReady || isReduced || now - introStartTime > 1.8) {
            introStarted = true
            if (!isReduced) {
              lastPos = pos = startIdx - 2.6
              goToSpring(startIdx, 1.5, 0.94)
            }
            nextAutoplay = now + Math.max(curCfg.interval, 1) + 1.2
          } else {
            needsNextFrame = true
          }
        }

        if (introStarted && introProgress < 1) {
          introProgress = isReduced ? 1 : Math.min(1, introProgress + dt / 0.6)
          needsNextFrame = true
        }

        const mode = curCfg.autoplay
        const isPaused = curCfg.paused || curCfg.held || isReduced || mode === 'off'
        const isHoverPaused = !!pointerState || (curCfg.pauseOnHover && isHovered)
        const isSuspended = isHoverPaused || now < pauseUntil
        const targetAutoplayFactor = isPaused || isSuspended || mode !== 'drift' ? 0 : 1

        autoplayFactor += (targetAutoplayFactor - autoplayFactor) * (1 - Math.exp(-dt / (targetAutoplayFactor > autoplayFactor ? 0.9 : 0.3)))
        if (Math.abs(targetAutoplayFactor - autoplayFactor) > 0.001) needsNextFrame = true
        else autoplayFactor = targetAutoplayFactor

        if ((mode === 'step' || mode === 'spin') && !isPaused && introStarted && totalItems > 1) {
          if (isHoverPaused) {
            nextAutoplay = Math.max(nextAutoplay, now + 0.6 * Math.max(curCfg.interval, 1))
          } else if (!isSuspended && now >= nextAutoplay && springTarget === null && settleTarget === null && Math.abs(vel) < 0.05) {
            nextAutoplay = now + Math.max(curCfg.interval, 1)
            const dirMultiplier = curCfg.speed < 0 ? -1 : 1
            if (mode === 'step') {
              goToSpring(Math.round(pos) + dirMultiplier, 0.9, 0.96)
            } else {
              goToSpring(Math.round(pos) + dirMultiplier * (3 + Math.floor(4 * Math.random())), 1.5, 0.94)
            }
          }
        }

        if (wheelActive && now - wheelTime > 0.14) {
          wheelActive = false
          if (curCfg.snap && springTarget !== null) springTarget = Math.round(springTarget)
        }

        const frictionVal = 0.35 + 1.45 * (1 - clamp(curCfg.friction, 0, 1))
        if (pointerState && pointerState.moved) {
          needsNextFrame = true
        } else if (springTarget !== null) {
          ;[pos, vel] = springStep(pos, vel, springTarget, dt, isReduced ? 0.08 : springStiffness, springDamping)
          if (Math.abs(pos - springTarget) < 2e-4 && Math.abs(vel) < 0.002) {
            pos = springTarget
            vel = 0
            springTarget = null
          } else {
            needsNextFrame = true
          }
        } else if (settleTarget !== null) {
          ;[pos, vel] = springStep(pos, vel, settleTarget, dt, isReduced ? 0.08 : 0.46, 0.62)
          if (Math.abs(pos - settleTarget) < 2e-4 && Math.abs(vel) < 0.002) {
            pos = settleTarget
            vel = 0
            settleTarget = null
          } else {
            needsNextFrame = true
          }
        } else {
          const driftSpeed = mode === 'drift' ? curCfg.speed * autoplayFactor : 0
          const diff = vel - driftSpeed
          const decay = Math.exp(-dt / frictionVal)
          const resist = Math.min(Math.abs(diff * decay), 0.6 * dt) * Math.sign(diff)
          vel = driftSpeed + diff * decay - resist
          pos += vel * dt
          if (Math.abs(vel - driftSpeed) > 0.001) needsNextFrame = true

          if (curCfg.snap && Math.abs(vel - driftSpeed) < 2.2 && Math.abs(driftSpeed) < 0.001 && Math.abs(vel) > 0.001) {
            settleTarget = vel > 0 ? Math.ceil(pos - 0.08) : Math.floor(pos + 0.08)
            if (Math.abs(settleTarget - pos) > 0.92) settleTarget = Math.round(pos)
            needsNextFrame = true
          } else if (
            curCfg.snap &&
            Math.abs(driftSpeed) < 0.001 &&
            Math.abs(vel) <= 0.001 &&
            Math.abs(pos - Math.round(pos)) > 0.001
          ) {
            settleTarget = Math.round(pos)
            needsNextFrame = true
          }
          if (Math.abs(driftSpeed) > 1e-4) needsNextFrame = true
        }

        const instantaneousVel = dt > 0 ? (pos - lastPos) / dt : 0
        lastPos = pos
        smoothedVel += (instantaneousVel - smoothedVel) * (1 - Math.exp(-dt / 0.035))
        if (Math.abs(smoothedVel) < 0.001) smoothedVel = 0
        else needsNextFrame = true

        const currentActiveWrap = wrapIdx(Math.round(pos))
        if (currentActiveWrap !== lastActiveIdx) {
          lastActiveIdx = currentActiveWrap
          cbs.onActive(currentActiveWrap)
        }

        const uniforms = material.uniforms
        const blurAmt = isReduced ? 0 : clamp(curCfg.motionBlur, 0, 3) / 30
        const motionVal = clamp(smoothedVel * blurAmt, -2.5, 2.5)
        const travelPx = Math.abs(motionVal) * geom.pitch * dprVal

        uniforms.uSamples.value = clamp(Math.ceil(travelPx / 4), 1, 28)
        uniforms.uMotion.value = motionVal
        uniforms.uPos.value = pos
        uniforms.uCount.value = Math.max(layers.length, 1)
        uniforms.uView.value.set(viewW, viewH)
        uniforms.uDpr.value = dprVal
        uniforms.uCenter.value.set(geom.cx, geom.cy)
        uniforms.uVertical.value = geom.vertical ? 1 : 0
        uniforms.uDist.value = geom.dist
        uniforms.uTilt.value = geom.tilt
        uniforms.uK.value = geom.k
        uniforms.uPitch.value = geom.pitch
        uniforms.uAlong.value = geom.along
        uniforms.uAcross.value = geom.across
        uniforms.uCardAspect.value = geom.cardW / geom.cardH
        uniforms.uRadius.value = Math.max(curCfg.radius, 0)
        uniforms.uDim.value = clamp(curCfg.dim, 0, 1)
        uniforms.uEdge.value = clamp(curCfg.edgeFade, 0, 1) * (geom.vertical ? viewH : viewW) * 0.22
        uniforms.uIntro.value = smoothstep(0, 1, introProgress)

        let minBound = Infinity
        let maxBound = -Infinity
        for (let i = -4; i <= 4; i++) {
          const sDist = (Math.round(pos) + i - pos) * geom.pitch
          for (const al of [-geom.along / 2, geom.along / 2]) {
            for (const ac of [-geom.across / 2, geom.across / 2]) {
              const pt = projectPoint(sDist, al, ac)
              if (!pt) continue
              const coord = geom.vertical ? pt.x : viewH - pt.y
              minBound = Math.min(minBound, coord)
              maxBound = Math.max(maxBound, coord)
            }
          }
        }
        if (!Number.isFinite(minBound)) {
          minBound = 0
          maxBound = geom.vertical ? viewW : viewH
        }
        minBound -= 6
        maxBound += 6

        if (geom.vertical) {
          uniforms.uBand.value.set((minBound / viewW) * 2 - 1, -1, (maxBound / viewW) * 2 - 1, 1)
        } else {
          uniforms.uBand.value.set(-1, (minBound / viewH) * 2 - 1, 1, (maxBound / viewH) * 2 - 1)
        }

        updateCaptions(isReduced)
        renderer.render(scene, camera)

        if (needsNextFrame || pointerState || (mode === 'drift' && autoplayFactor > 0.001)) {
          requestRender()
        } else if ((mode === 'step' || mode === 'spin') && !isPaused && !isHoverPaused && totalItems > 1 && !autoplayTimer) {
          autoplayTimer = win.setTimeout(() => {
            autoplayTimer = 0
            requestRender()
          }, 1000 * Math.max(Math.max(nextAutoplay, pauseUntil) - now, 0.02) + 16)
        }
      }

      const onPointerMove = (e) => {
        if (e.pointerType !== 'touch' && !pointerState) {
          isHovered = true
          const isOver = raycastIndex(e.clientX, e.clientY) !== null
          const cursor = isOver ? 'pointer' : cfgRef.current.draggable ? 'grab' : ''
          if (containerEl.style.cursor !== cursor) containerEl.style.cursor = cursor
        }
        if (pointerState && pointerState.id === e.pointerId) {
          const curCfg = cfgRef.current
          const dx = e.clientX - pointerState.x
          const dy = e.clientY - pointerState.y
          if (!pointerState.moved && Math.hypot(dx, dy) > 6) {
            pointerState.moved = true
            springTarget = null
            settleTarget = null
            vel = 0
            containerEl.style.cursor = 'grabbing'
            try {
              canvasHolderEl.setPointerCapture(e.pointerId)
            } catch {}
          }
          if (pointerState.moved && curCfg.draggable) {
            const delta = geom.vertical ? dy : dx
            pos = pointerState.origin - delta / Math.max(geom.pitch, 1)
            const t = performance.now()
            pointerState.samples.push({ t, p: pos })
            while (pointerState.samples.length > 2 && t - pointerState.samples[0].t > 110) {
              pointerState.samples.shift()
            }
          }
        }
        requestRender()
      }

      const onPointerDown = (e) => {
        if (!e.isPrimary || e.button > 0) return
        wasDragged = false
        const curCfg = cfgRef.current
        if (Math.abs(vel) > 2.5 && !curCfg.reduced) {
          goToSpring(vel > 0 ? Math.ceil(pos + 0.06 * vel) : Math.floor(pos + 0.06 * vel), 0.34, 0.8)
          wasDragged = true
          pauseAutoplay()
          return
        }
        if (curCfg.draggable) {
          pointerState = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            origin: pos,
            moved: false,
            samples: [{ t: performance.now(), p: pos }],
          }
          pauseAutoplay()
          requestRender()
        }
      }

      const onPointerUp = (e) => {
        if (!pointerState || pointerState.id !== e.pointerId) return
        const st = pointerState
        pointerState = null
        try {
          if (canvasHolderEl.hasPointerCapture(e.pointerId)) {
            canvasHolderEl.releasePointerCapture(e.pointerId)
          }
        } catch {}

        if (st.moved) {
          wasDragged = true
          const t = performance.now()
          const recent = st.samples.filter((s) => t - s.t < 110)
          let calculatedVel = 0
          if (recent.length > 1 && t - recent[recent.length - 1].t < 60) {
            const elapsed = Math.max((recent[recent.length - 1].t - recent[0].t) / 1e3, 1 / 120)
            calculatedVel = (recent[recent.length - 1].p - recent[0].p) / elapsed
          }
          const curCfg = cfgRef.current
          vel = curCfg.reduced ? 0 : clamp(calculatedVel, -32, 32)
          springTarget = null
          settleTarget = null
          if (curCfg.reduced && curCfg.snap) {
            goToSpring(Math.round(pos), 0.08, 1)
          }
          containerEl.style.cursor = curCfg.draggable ? 'grab' : ''
          pauseAutoplay()
        }
        requestRender()
      }

      const onClick = (e) => {
        if (wasDragged) {
          wasDragged = false
          return
        }
        const hitIdx = raycastIndex(e.clientX, e.clientY)
        if (hitIdx === null) return
        const centerIdx = Math.round(springTarget ?? pos)
        if (hitIdx === centerIdx && Math.abs(pos - centerIdx) < 0.2) {
          const resolvedItem = itmsRef.current[wrapIdx(hitIdx)] ?? wrapIdx(hitIdx)
          cbs.onSelect(resolvedItem, wrapIdx(hitIdx))
        } else {
          goToSpring(hitIdx, 0.7 + 0.05 * Math.min(Math.abs(hitIdx - pos), 5), 0.9)
          pauseAutoplay()
        }
      }

      const onPointerLeave = (e) => {
        if (pointerState && pointerState.id === e.pointerId) return
        isHovered = false
        containerEl.style.cursor = ''
        pauseAutoplay(0.8)
        requestRender()
      }

      const onWheel = (e) => {
        if (!cfgRef.current.wheel) return
        e.preventDefault()
        const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewH : 1
        const delta = clamp((Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scale, -240, 240)
        goToSpring((wheelActive && springTarget !== null ? springTarget : Math.round(springTarget ?? pos)) + delta / 100, 0.5, 0.9)
        wheelActive = true
        wheelTime = performance.now() / 1e3
        pauseAutoplay()
      }

      const onKeyDown = (e) => {
        if (e.target !== containerEl) return
        const isVert = geom.vertical
        if (e.key === (isVert ? 'ArrowDown' : 'ArrowRight')) {
          e.preventDefault()
          step(1)
        } else if (e.key === (isVert ? 'ArrowUp' : 'ArrowLeft')) {
          e.preventDefault()
          step(-1)
        } else if (e.key === 'PageDown') {
          e.preventDefault()
          spin(5)
        } else if (e.key === 'PageUp') {
          e.preventDefault()
          spin(-5)
        } else if (e.key === 'Home') {
          e.preventDefault()
          goTo(0)
        } else if (e.key === 'End') {
          e.preventDefault()
          goTo(getCount() - 1)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const activeWrap = wrapIdx(Math.round(springTarget ?? pos))
          const resolvedItem = itmsRef.current[activeWrap] ?? activeWrap
          cbs.onSelect(resolvedItem, activeWrap)
        }
      }

      canvasHolderEl.addEventListener('pointerdown', onPointerDown)
      canvasHolderEl.addEventListener('pointermove', onPointerMove)
      canvasHolderEl.addEventListener('pointerup', onPointerUp)
      canvasHolderEl.addEventListener('pointercancel', onPointerUp)
      canvasHolderEl.addEventListener('pointerleave', onPointerLeave)
      canvasHolderEl.addEventListener('click', onClick)
      canvasHolderEl.addEventListener('wheel', onWheel, { passive: false })
      containerEl.addEventListener('keydown', onKeyDown)

      const resizeObserver = new ResizeObserver(() => {
        if (updateDimensions()) requestRender()
      })
      resizeObserver.observe(containerEl)

      const intersectionObserver =
        typeof IntersectionObserver === 'undefined'
          ? null
          : new IntersectionObserver(
              ([entry]) => {
                isVisible = entry.isIntersecting
                if (isVisible) {
                  lastTime = 0
                  requestRender()
                } else {
                  if (rafId) {
                    cancelAnimationFrame(rafId)
                    rafId = 0
                  }
                  if (autoplayTimer) {
                    win.clearTimeout(autoplayTimer)
                    autoplayTimer = 0
                  }
                }
              },
              { rootMargin: '80px' }
            )
      if (intersectionObserver) intersectionObserver.observe(containerEl)
      else isVisible = true

      const onContextLost = (e) => {
        e.preventDefault()
        isContextLost = true
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
      }
      const onContextRestored = () => {
        isContextLost = false
        lastSrcKey = ''
        syncImages()
        requestRender()
      }

      canvas.addEventListener('webglcontextlost', onContextLost)
      canvas.addEventListener('webglcontextrestored', onContextRestored)

      updateDimensions()
      if (hasSize) computeGeometry()
      updateBackgroundColor()
      syncImages()
      renderer.compile(scene, camera)
      requestRender()

      return {
        sync: () => {
          updateDimensions()
          updateBackgroundColor()
          syncImages()
          lastCaptionIdx = NaN
          requestRender()
        },
        step,
        goTo,
        spin,
        destroy: () => {
          isDestroyed = true
          if (rafId) cancelAnimationFrame(rafId)
          if (autoplayTimer) win.clearTimeout(autoplayTimer)
          intersectionObserver?.disconnect()
          resizeObserver.disconnect()
          canvasHolderEl.removeEventListener('pointerdown', onPointerDown)
          canvasHolderEl.removeEventListener('pointermove', onPointerMove)
          canvasHolderEl.removeEventListener('pointerup', onPointerUp)
          canvasHolderEl.removeEventListener('pointercancel', onPointerUp)
          canvasHolderEl.removeEventListener('pointerleave', onPointerLeave)
          canvasHolderEl.removeEventListener('click', onClick)
          canvasHolderEl.removeEventListener('wheel', onWheel)
          containerEl.removeEventListener('keydown', onKeyDown)
          containerEl.style.cursor = ''
          canvas.removeEventListener('webglcontextlost', onContextLost)
          canvas.removeEventListener('webglcontextrestored', onContextRestored)
          layers.forEach((l) => {
            l.image.onload = null
          })
          dataTexture.dispose()
          material.dispose()
          quad.dispose()
          renderer.dispose()
          if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
          canvas.remove()
        },
      }
    })(
      container,
      canvasHolder,
      { caption: captionEl, title: titleEl, subtitle: subtitleEl },
      configRef,
      itemsRef,
      initialIndex,
      {
        onActive: (idx) => {
          setActiveIndex(idx)
          callbacksRef.current.onIndexChange?.(idx)
        },
        onSelect: (idx) => {
          const item = itemsRef.current[idx]
          if (item) {
            callbacksRef.current.onSelect?.(item, idx)
          }
        },
      }
    )

    if (!engine) {
      const animId = requestAnimationFrame(() => setHasWebGlError(true))
      return () => cancelAnimationFrame(animId)
    }

    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [initialIndex])

  useImperativeHandle(
    ref,
    () => ({
      next: () => engineRef.current?.step(1),
      previous: () => engineRef.current?.step(-1),
      goTo: (idx) => engineRef.current?.goTo(idx),
      spin: (cards) => engineRef.current?.spin(cards),
    }),
    []
  )

  const activeItem = effectiveItems[activeIndex] ?? effectiveItems[0]

  return (
    <div
      ref={containerRef}
      className={`relative h-full min-h-[440px] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#9DF133] ${className}`}
      style={{
        backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
        ...style,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' && e.target === e.currentTarget) {
          e.preventDefault()
          setIsHeld((prev) => !prev)
        }
      }}
    >
      {/* Three.js WebGL canvas mount container */}
      <div
        ref={canvasHolderRef}
        style={{
          ...FILL_STYLES,
          touchAction: finalDirection === 'vertical' ? 'pan-x' : 'pan-y',
        }}
      />

      {/* Fallback image in case WebGL context fails to initialize */}
      {hasWebGlError && activeItem ? (
        <div style={{ position: 'absolute', inset: '18%', display: 'grid', placeItems: 'center' }}>
          <img
            src={activeItem.src}
            alt={activeItem.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover',
              borderRadius: finalRadius,
            }}
          />
        </div>
      ) : null}

      {/* Screen-reader hidden elements */}
      <ul style={SR_STYLES}>
        {effectiveItems.map((item, idx) => (
          <li key={`${item.src}-${idx}`} aria-current={idx === activeIndex ? 'true' : undefined}>
            {item.title ? `${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}` : item.alt}
          </li>
        ))}
      </ul>
      <div aria-live="polite" style={SR_STYLES}>
        {activeItem ? activeItem.title ?? activeItem.alt : ''}
      </div>

      {/* Dynamic 3D Projected Captions */}
      <div ref={captionRef} aria-hidden="true" style={CAPTION_CONTAINER_STYLE}>
        <div className="bg-[#070210]/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 pointer-events-auto">
          <span
            ref={titleRef}
            className="font-heading uppercase tracking-wide text-base sm:text-lg font-bold text-white drop-shadow-sm"
          />
          <span
            ref={subtitleRef}
            className="font-sans text-xs sm:text-sm font-medium text-[#9DF133] drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  )
})

export default VerticalReel
