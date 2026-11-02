import React from 'react'
import GiantTitle from './GiantTitle'

export default function Hero() {
  return (
    <section className="home-hero relative w-full min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col justify-between">
      {/* Top half: Giant display title stretched tall and sideways */}
      <div className="w-full pt-6 sm:pt-10 flex-1 flex items-center justify-center">
        <GiantTitle
          name="DEVANG"
          heightMode="topHalf"
          stretchY={1.42}
          stretchX={1.35}
        />
      </div>

      {/* Bottom Section: Manifesto at the bottom-left */}
      <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 pb-10 sm:pb-14 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        {/* Bottom Left: Headline & Manifesto */}
        <div className="max-w-xl flex items-start gap-4 sm:gap-5">
          {/* Subtle crimson hairline accent bar */}
          <div
            aria-hidden="true"
            className="w-[2px] h-12 sm:h-14 bg-gradient-to-b from-[#EF4444] via-[#B91C1C] to-transparent shrink-0 mt-1 rounded-full"
          />

          <div className="space-y-2">
            {/* Two-line punchy bold headline */}
            <div className="font-heading font-bold uppercase tracking-[0.2em] text-xs sm:text-sm md:text-base leading-tight">
              <span className="block text-[#EF4444]">CURIOUS BY DEFAULT.</span>
              <span className="block text-white">BUILT TO EXPLORE.</span>
            </div>

            {/* Narrative / Manifesto Statement */}
            <p className="font-sans text-xs sm:text-sm text-[#9CA3AF] leading-relaxed font-normal max-w-md">
              I turn curiosity into{' '}
              <span className="text-[#F5F0EB] font-medium">code</span>, ideas
              into{' '}
              <span className="text-[#F5F0EB] font-medium">experiments</span>,
              and challenges into{' '}
              <span className="text-[#F5F0EB] font-medium">
                things worth building
              </span>
              .
            </p>
          </div>
        </div>

        {/* Bottom Right: Sleek balanced scroll indicator */}
        <div className="hidden md:flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-[#747785] uppercase select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse" />
          <span>SCROLL TO EXPLORE</span>
          <span className="text-[#EF4444] animate-bounce">↓</span>
        </div>
      </div>
    </section>
  )
}
