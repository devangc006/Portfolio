import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Preloader Component
 *
 * Themed to match the pitch-black (#0A0A0A) and blood-red/crimson aesthetic of the website.
 * Features a deep crimson atmospheric radial glow on a pitch-black background.
 *
 * Supports 5 visual variants:
 * 1. 'percentage' - High-precision numerical counter with crimson progress bar & ambient glow (default)
 * 2. 'stairs'     - Staggered vertical stair columns revealing the page
 * 3. 'circle'     - Circular progress ring with smooth status indicators
 * 4. 'slide'      - Monolithic full-screen sliding panel wipe
 * 5. 'curtain'    - Split double-doors parting horizontally from the center
 */
export default function Preloader({
  // Controlled or uncontrolled active state
  loading: controlledLoading,

  // Variant: 'percentage' | 'stairs' | 'circle' | 'slide' | 'curtain'
  variant = 'percentage',

  // Layout & positioning
  position = 'fixed',
  zIndex = 9999,
  bgColor = '#0A0A0A',
  accentColor = '#EF4444',

  // Animation timing
  duration = 2000, // Total duration in ms before starting exit transition

  // Primary loading text
  loadingText = 'Loading...',
  textClassName = '',

  // Percentage Variant Configurations
  percentagePosition = 'center', // 'center' | 'bottom-left' | 'top-left'
  showPercentageSign = true,
  percentageTextClassName = '',
  showProgressBar = true,
  progressBarPosition = 'bottom', // 'bottom' | 'top'

  // Stairs Variant Configurations
  stairCount = 10,
  stairsRevealFrom = 'left', // 'left' | 'right' | 'center'
  stairsRevealDirection = 'up', // 'up' | 'down'

  // Callback when transition finishes
  onComplete,
}) {
  const [internalLoading, setInternalLoading] = useState(true)
  const [percent, setPercent] = useState(0)
  const startTimeRef = useRef(null)

  // Use controlled loading if supplied, otherwise manage internally
  const isCurrentlyActive = controlledLoading !== undefined ? controlledLoading : internalLoading

  // Smooth progress counter calculation based on duration
  useEffect(() => {
    let animationFrameId

    const updateProgress = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(100, Math.round((elapsed / duration) * 100))
      setPercent(progress)

      if (progress < 100) {
        animationFrameId = requestAnimationFrame(updateProgress)
      } else {
        // Hold at 100% briefly before starting exit
        setTimeout(() => {
          if (controlledLoading === undefined) {
            setInternalLoading(false)
          }
        }, 250)
      }
    }

    animationFrameId = requestAnimationFrame(updateProgress)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [duration, controlledLoading])

  // Prevent background scrolling while preloader is active
  useEffect(() => {
    if (isCurrentlyActive) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isCurrentlyActive])

  // Calculate stair stagger delays
  const stairIndices = useMemo(() => Array.from({ length: stairCount }), [stairCount])

  const getStairDelay = (index) => {
    const baseStagger = 0.04
    if (stairsRevealFrom === 'right') {
      return (stairCount - 1 - index) * baseStagger
    }
    if (stairsRevealFrom === 'center') {
      const mid = Math.floor(stairCount / 2)
      return Math.abs(mid - index) * baseStagger
    }
    return index * baseStagger // 'left'
  }

  const exitY = stairsRevealDirection === 'up' ? '-100%' : '100%'
  const customEase = [0.76, 0, 0.24, 1]

  // Shared container wrapper: Transparent so exit animations (slide/wipe) reveal the website underneath immediately
  const containerClasses = `${position} inset-0 pointer-events-auto select-none overflow-hidden bg-transparent`

  // Deep moody crimson atmospheric gradient matching the website's dark crimson theme
  const themedBgStyle = {
    backgroundColor: bgColor,
    backgroundImage:
      'radial-gradient(ellipse 95% 75% at 50% 45%, #200404 0%, #110101 45%, #0A0A0A 85%)',
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isCurrentlyActive && (
        <motion.div
          key="reactbits-preloader"
          className={containerClasses}
          style={{ zIndex }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: variant === 'stairs' ? 1 : 0,
            transition: { duration: 0.6, ease: customEase },
          }}
          aria-live="polite"
          aria-busy="true"
        >
          {/* =================================================================
              VARIANT 1: PERCENTAGE (Default)
             ================================================================= */}
          {variant === 'percentage' && (
            <motion.div
              className="relative w-full h-full flex flex-col justify-center items-center p-8 md:p-14 overflow-hidden"
              style={themedBgStyle}
              exit={{
                y: '-100%',
                transition: { duration: 0.85, ease: customEase },
              }}
            >
              {/* Diffuse crimson atmospheric backdrop glow layers */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-[80vw] max-w-4xl h-[55vh] bg-[#B91C1C]/15 rounded-full blur-[110px] md:blur-[150px] -z-0"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-[50vw] max-w-2xl h-[35vh] bg-[#8B0000]/25 rounded-full blur-[70px] md:blur-[100px] -z-0"
              />

              {/* Counter Placement */}
              <div
                className={`relative z-10 w-full flex ${
                  percentagePosition === 'center'
                    ? 'items-center justify-center my-auto flex-col text-center'
                    : percentagePosition === 'top-left'
                    ? 'items-start justify-start my-12 flex-col'
                    : 'items-start justify-end my-12 flex-col' // 'bottom-left'
                }`}
              >
                {/* Loading Text Label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                    {loadingText}
                  </span>
                </div>

                {/* Large Tabular Percentage Number */}
                <div
                  className={`font-heading text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter text-white tabular-nums select-none drop-shadow-[0_0_35px_rgba(185,28,28,0.4)] ${percentageTextClassName}`}
                >
                  {percent}
                  {showPercentageSign && (
                    <span className="text-3xl sm:text-5xl font-light text-[#EF4444]/90 ml-1.5">
                      %
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar (Top or Bottom) */}
              {showProgressBar && (
                <div
                  className={`absolute left-0 right-0 h-[2px] bg-white/[0.05] border-t border-[#B91C1C]/15 overflow-hidden ${
                    progressBarPosition === 'top' ? 'top-0' : 'bottom-0'
                  }`}
                >
                  <motion.div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${percent}%`,
                      background:
                        'linear-gradient(90deg, #8B0000 0%, #B91C1C 60%, #EF4444 100%)',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.75)',
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 2: STAIRS
             ================================================================= */}
          {variant === 'stairs' && (
            <div className="relative w-full h-full flex bg-[#0A0A0A]">
              {/* Stair columns */}
              {stairIndices.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-full flex-1 relative border-r border-[#B91C1C]/10"
                  style={themedBgStyle}
                  initial={{ y: '0%' }}
                  exit={{
                    y: exitY,
                    transition: {
                      duration: 0.8,
                      delay: getStairDelay(i),
                      ease: customEase,
                    },
                  }}
                />
              ))}

              {/* Centered content overlay on top of the stairs */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  transition: { duration: 0.35, ease: 'easeInOut' },
                }}
              >
                {/* Ambient back-glow */}
                <div
                  aria-hidden="true"
                  className="absolute w-72 h-72 bg-[#B91C1C]/15 rounded-full blur-[90px] -z-10 pointer-events-none"
                />

                {/* Primary Loading Text */}
                <h2
                  className={`font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 max-w-lg drop-shadow-[0_0_25px_rgba(185,28,28,0.3)] ${textClassName}`}
                >
                  {loadingText}
                </h2>

                {/* Percentage counter indicator */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full animate-ping shadow-[0_0_10px_#EF4444]"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-mono text-xs tracking-[0.25em] text-[#EF4444]">
                    {percent}%
                  </span>
                </div>
              </motion.div>
            </div>
          )}

          {/* =================================================================
              VARIANT 3: CIRCLE
             ================================================================= */}
          {variant === 'circle' && (
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden"
              style={themedBgStyle}
              exit={{
                scale: 0.95,
                opacity: 0,
                transition: { duration: 0.6, ease: customEase },
              }}
            >
              {/* Ambient backdrop glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-64 h-64 bg-[#B91C1C]/15 rounded-full blur-[80px] -z-0"
              />

              {/* Circular SVG Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6 z-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  {/* Active Animated Progress Stroke */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * percent) / 100}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-75"
                    style={{
                      color: accentColor,
                      filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
                    }}
                  />
                </svg>

                {/* Inner Counter Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-extrabold text-white tabular-nums drop-shadow-[0_0_15px_rgba(185,28,28,0.4)]">
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Loading Text */}
              <h2
                className={`relative z-10 font-heading text-xl md:text-2xl font-bold text-white tracking-wide ${textClassName}`}
              >
                {loadingText}
              </h2>
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 4: SLIDE
             ================================================================= */}
          {variant === 'slide' && (
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center overflow-hidden"
              style={themedBgStyle}
              exit={{
                y: '-100%',
                transition: { duration: 0.85, ease: customEase },
              }}
            >
              {/* Ambient aura */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-80 h-80 bg-[#B91C1C]/15 rounded-full blur-[100px] -z-0"
              />

              {/* Loading Text */}
              <motion.h2
                className={`relative z-10 font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-xl drop-shadow-[0_0_25px_rgba(185,28,28,0.3)] ${textClassName}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {loadingText}
              </motion.h2>

              {/* Progress Indicator */}
              <div className="relative z-10 w-52 h-1.5 bg-white/[0.08] rounded-full overflow-hidden border border-[#B91C1C]/20">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    background:
                      'linear-gradient(90deg, #8B0000 0%, #B91C1C 60%, #EF4444 100%)',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.7)',
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 5: CURTAIN
             ================================================================= */}
          {variant === 'curtain' && (
            <div className="relative w-full h-full flex overflow-hidden bg-[#0A0A0A]">
              {/* Left Curtain Door */}
              <motion.div
                className="w-1/2 h-full relative border-r border-[#B91C1C]/10"
                style={themedBgStyle}
                initial={{ x: '0%' }}
                exit={{
                  x: '-100%',
                  transition: { duration: 0.8, ease: customEase },
                }}
              />

              {/* Right Curtain Door */}
              <motion.div
                className="w-1/2 h-full relative border-l border-[#B91C1C]/10"
                style={themedBgStyle}
                initial={{ x: '0%' }}
                exit={{
                  x: '100%',
                  transition: { duration: 0.8, ease: customEase },
                }}
              />

              {/* Floating Center Content */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.3 },
                }}
              >
                <h2
                  className={`font-heading text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-[0_0_25px_rgba(185,28,28,0.3)] ${textClassName}`}
                >
                  {loadingText}
                </h2>
                <span className="font-mono text-xs tracking-[0.25em] text-[#EF4444]">
                  {percent}%
                </span>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
