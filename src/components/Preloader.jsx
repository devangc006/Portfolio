import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * React Bits Pro Preloader Component
 * Reference: https://pro.reactbits.dev/docs/components/preloader
 *
 * Supports 5 visual variants:
 * 1. 'stairs'     - Staggered vertical stair columns revealing the page
 * 2. 'percentage' - High-precision numerical counter with optional progress bar
 * 3. 'circle'     - Circular progress ring with smooth status indicators
 * 4. 'slide'      - Monolithic full-screen sliding panel wipe
 * 5. 'curtain'    - Split double-doors parting horizontally from the center
 */
export default function Preloader({
  // Controlled or uncontrolled active state
  loading: controlledLoading,

  // Variant: 'stairs' | 'percentage' | 'circle' | 'slide' | 'curtain'
  variant = 'stairs',

  // Layout & positioning
  position = 'fixed',
  zIndex = 9999,
  bgColor = '#070210',
  accentColor = 'var(--primary-green-neon, #9df133)',

  // Animation timing
  duration = 2400, // Total duration in ms before starting exit transition

  // Primary loading text (defaults to clean 'Loading...')
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

  // Shared container wrapper classes
  const containerClasses = `${position} inset-0 pointer-events-auto select-none overflow-hidden`

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
              VARIANT 1: STAIRS
             ================================================================= */}
          {variant === 'stairs' && (
            <div className="relative w-full h-full flex">
              {/* Stair columns */}
              {stairIndices.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-full flex-1 relative"
                  style={{ backgroundColor: bgColor }}
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
                {/* Primary Loading Text */}
                <h2
                  className={`font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-3 max-w-lg ${textClassName}`}
                >
                  {loadingText}
                </h2>

                {/* Percentage counter indicator */}
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
                  <span className="font-mono text-xs tracking-widest text-neutral-300">
                    {percent}%
                  </span>
                </div>
              </motion.div>
            </div>
          )}

          {/* =================================================================
              VARIANT 2: PERCENTAGE
             ================================================================= */}
          {variant === 'percentage' && (
            <motion.div
              className="relative w-full h-full flex flex-col justify-center items-center p-8 md:p-14"
              style={{ backgroundColor: bgColor }}
              exit={{
                y: '-100%',
                transition: { duration: 0.8, ease: customEase },
              }}
            >
              {/* Counter Placement */}
              <div
                className={`w-full flex ${
                  percentagePosition === 'center'
                    ? 'items-center justify-center my-auto flex-col text-center'
                    : percentagePosition === 'top-left'
                    ? 'items-start justify-start my-12 flex-col'
                    : 'items-start justify-end my-12 flex-col' // 'bottom-left'
                }`}
              >
                {/* Loading Text Label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    {loadingText}
                  </span>
                </div>

                {/* Large Tabular Percentage Number */}
                <div
                  className={`font-heading text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-white tabular-nums select-none ${percentageTextClassName}`}
                >
                  {percent}
                  {showPercentageSign && (
                    <span className="text-3xl sm:text-5xl font-light text-neutral-500 ml-1">%</span>
                  )}
                </div>
              </div>

              {/* Progress Bar (Top or Bottom) */}
              {showProgressBar && (
                <div
                  className={`absolute left-0 right-0 h-1 bg-white/10 overflow-hidden ${
                    progressBarPosition === 'top' ? 'top-0' : 'bottom-0'
                  }`}
                >
                  <motion.div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 3: CIRCLE
             ================================================================= */}
          {variant === 'circle' && (
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center"
              style={{ backgroundColor: bgColor }}
              exit={{
                scale: 0.95,
                opacity: 0,
                transition: { duration: 0.6, ease: customEase },
              }}
            >
              {/* Circular SVG Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="4"
                    fill="none"
                  />
                  {/* Active Animated Progress Stroke */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * percent) / 100}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-75"
                    style={{ color: accentColor }}
                  />
                </svg>

                {/* Inner Counter Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-bold text-white tabular-nums">
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Loading Text */}
              <h2 className={`font-heading text-xl md:text-2xl font-bold text-white ${textClassName}`}>
                {loadingText}
              </h2>
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 4: SLIDE
             ================================================================= */}
          {variant === 'slide' && (
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: bgColor }}
              exit={{
                y: '-100%',
                transition: { duration: 0.85, ease: customEase },
              }}
            >
              {/* Loading Text */}
              <motion.h2
                className={`font-heading text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 max-w-xl ${textClassName}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {loadingText}
              </motion.h2>

              {/* Progress Indicator */}
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* =================================================================
              VARIANT 5: CURTAIN
             ================================================================= */}
          {variant === 'curtain' && (
            <div className="relative w-full h-full flex overflow-hidden">
              {/* Left Curtain Door */}
              <motion.div
                className="w-1/2 h-full relative"
                style={{ backgroundColor: bgColor }}
                initial={{ x: '0%' }}
                exit={{
                  x: '-100%',
                  transition: { duration: 0.8, ease: customEase },
                }}
              />

              {/* Right Curtain Door */}
              <motion.div
                className="w-1/2 h-full relative"
                style={{ backgroundColor: bgColor }}
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
                <h2 className={`font-heading text-3xl md:text-5xl font-bold text-white mb-3 ${textClassName}`}>
                  {loadingText}
                </h2>
                <span className="font-mono text-xs tracking-widest text-neutral-300">
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
