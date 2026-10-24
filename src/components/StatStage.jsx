import React, { useEffect, useRef, useState } from 'react'
import SharedGridLines from './SharedGridLines'

function OdometerDigit({ targetDigit, animated, delay = 0 }) {
  const target = parseInt(targetDigit, 10)
  // Strip with 2 full cycles of digits: [0..9, 0..9]
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const targetIndex = isNaN(target) ? 0 : 10 + target
  const translateY = animated ? (targetIndex / digits.length) * 100 : 0

  return (
    <span className="inline-block h-[1em] leading-none overflow-hidden align-middle">
      <span
        className="flex flex-col items-center"
        style={{
          transform: `translateY(-${translateY}%)`,
          transition: `transform ${1.8 + delay}s cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {digits.map((d, i) => (
          <span key={i} className="h-[1em] leading-none flex items-center justify-center">
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}

function OdometerValue({ value, suffix = '+', animated }) {
  const digits = String(value).split('')
  return (
    <div className="font-heading text-5xl sm:text-6xl font-bold tracking-tight inline-flex items-center leading-none text-[#070210] group-hover:text-white transition-colors duration-300">
      {digits.map((digit, idx) => (
        <OdometerDigit
          key={idx}
          targetDigit={digit}
          animated={animated}
          delay={idx * 0.12}
        />
      ))}
      {suffix && (
        <span className="text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300 ml-0.5">
          {suffix}
        </span>
      )}
    </div>
  )
}

export default function StatStage() {
  const stageRef = useRef(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={stageRef}
      className="stat-stage relative w-full overflow-hidden"
      data-surface="green"
      data-transition="idle"
    >
      <SharedGridLines fade={[2, 3, 4, 5]} />

      <div className="relative z-10 w-full min-h-[90vh] py-16 sm:py-24 flex flex-col justify-center">
        {/* Section Header */}
        <div className="w-full max-w-[1400px] mx-auto mb-10 sm:mb-14 px-4 sm:px-8">
          <div className="border-b border-[rgba(47,72,15,0.2)] pb-6">
            <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#070210] leading-none">
              Playground of Code
            </h2>
          </div>
        </div>

        {/* Bento Grid of Tool & Stat Boxes */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Box 1: Projects (5+) */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [METRIC // 01]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    PROJECTS
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="my-2">
                  <OdometerValue value={5} suffix="+" animated={animated} />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Shipped Web & Apps</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] tracking-widest">■■■</span>
                </div>
              </div>
            </div>

            {/* Box 2: VS Code */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [SYS // 01]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    VS CODE
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-2 flex items-center justify-center">
                  <img
                    alt="VS Code"
                    src="/svg/vscode-default.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-0"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    src="/svg/vscode-hover.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(157,241,51,0.6)]"
                  />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Development & Tooling</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] font-semibold">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 3: C++ */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [SYS // 02]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    C++
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-2 flex items-center justify-center">
                  <img
                    alt="C++"
                    src="/svg/cpp-default.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-0"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    src="/svg/cpp-hover.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(157,241,51,0.6)]"
                  />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Systems & Performance</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] font-semibold">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 4: Techstack (10+) */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [METRIC // 02]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    TECHSTACK
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="my-2">
                  <OdometerValue value={10} suffix="+" animated={animated} />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Core Frameworks & Tools</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] tracking-widest">■■■</span>
                </div>
              </div>
            </div>

            {/* Box 5: MongoDB */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [SYS // 03]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    MONGODB
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-2 flex items-center justify-center">
                  <img
                    alt="MongoDB"
                    src="/svg/mongodb-default.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-0"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    src="/svg/mongodb-hover.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(157,241,51,0.6)]"
                  />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Database & Data Modeling</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] font-semibold">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 6: Playground Core / Lab Centerpiece */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [LAB // CORE]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    PLAYGROUND
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="my-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133] transition-colors duration-300 animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#29521e] group-hover:text-[#9DF133] transition-colors duration-300">
                      SYSTEM ONLINE
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#070210] group-hover:text-white transition-colors duration-300 leading-tight">
                    Creative Technologist
                  </h3>
                  <p className="font-sans text-xs text-[#20401b] group-hover:text-white/70 transition-colors duration-300 mt-1 line-clamp-2">
                    High-performance interfaces, fluid kinetic interactions, and modern design systems.
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>REACT • GSAP • THREE</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] font-semibold">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 7: GitHub */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [SYS // 04]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    GITHUB
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-2 flex items-center justify-center">
                  <img
                    alt="GitHub"
                    src="/svg/github-default.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-0"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    src="/svg/github-hover.svg"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(157,241,51,0.6)]"
                  />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Version Control & Collaboration</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] font-semibold">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 8: Companies (7+) */}
            <div
              data-sfx="true"
              className="relative p-[1.5px] transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer select-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <div
                className="absolute inset-0 transition-colors duration-300 bg-[rgba(47,72,15,0.22)] group-hover:bg-[#070210] group-hover:shadow-[0_0_20px_rgba(157,241,51,0.4)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <div
                className="relative h-full min-h-[220px] p-6 flex flex-col justify-between transition-all duration-300 bg-[rgba(113,201,206,0.35)] backdrop-blur-sm group-hover:bg-[#0B0B12] text-[#070210] group-hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#2F480F] group-hover:text-[#9DF133] transition-colors duration-300">
                    [METRIC // 03]
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#1a3810] group-hover:text-[#9df133] transition-colors duration-300">
                    COMPANIES
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 transition-all duration-300 opacity-20 group-hover:opacity-100 bg-[#2F480F] group-hover:bg-[#9DF133] group-hover:shadow-[0_0_8px_#9DF133]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>

                <div className="my-2">
                  <OdometerValue value={7} suffix="+" animated={animated} />
                </div>

                <div className="pt-3 border-t border-[rgba(47,72,15,0.15)] group-hover:border-white/10 flex items-center justify-between text-xs font-mono text-[#29521e] group-hover:text-white/60 transition-colors duration-300">
                  <span>Collaborations & Brands</span>
                  <span className="text-[#2F480F] group-hover:text-[#9DF133] tracking-widest">■■■</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
