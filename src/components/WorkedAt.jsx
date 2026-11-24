import React, { useId, useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SharedGridLines from './SharedGridLines'

const COMPANIES = [
  {
    id: 'opswat',
    index: '01',
    title: 'OPSWAT',
    subtitle: 'Sr. Product Designer',
    year: '2025 - Present',
    status: 'Enterprise Cybersecurity',
    description:
      'Led product design across My OPSWAT, Central Management, MetaDefender Drive, and Industrial Firewall, scaling the design system to keep UX consistent across the enterprise ecosystem.',
    image: '/images/work/case-study-opswat.webp',
  },
  {
    id: 'skymavis',
    index: '02',
    title: 'SkyMavis',
    subtitle: 'Product Designer',
    year: '2024 - 2025',
    status: 'Web3 & GameFi Ecosystem',
    description:
      'Worked closely across Mavis Market, Mavis Store, and Dev Journey — from competitive research and user interviews to UAT before release.',
    image: '/images/work/case-study-skymavis.webp',
  },
  {
    id: 'firekamp',
    index: '03',
    title: 'FireKamp',
    subtitle: 'Sr. Product Designer',
    year: '2022 - 2024',
    status: 'Multi-Product Studio',
    description:
      'Delivered hi-fi visual design across varied product types (time management, weight-loss supplement, call recording, and more), ensuring live products matched the design.',
    image: '/images/work/web-firekamp.webp',
  },
  {
    id: 'uptivistic',
    index: '04',
    title: 'Uptivistic',
    subtitle: 'Product Design Lead',
    year: '2021 - 2022',
    status: 'Game Design & Visuals',
    description:
      'Led a 4-person design team, turning Game Designer wireframes into hi-fi visual designs while working closely with developers to keep live builds on-spec.',
    image: '/images/work/exploration-almighty-boxxy.webp',
  },
  {
    id: 'ilabs',
    index: '05',
    title: 'ILABS',
    subtitle: 'Product Designer',
    year: '2020 - 2021',
    status: 'Client Product Delivery',
    description:
      'Partnered directly with client-side POs/PMs across projects, balancing internal/marketing asset production with consistent design quality.',
    image: '/images/work/app-sortly.webp',
  },
  {
    id: 'mpire',
    index: '06',
    title: 'Mpire',
    subtitle: 'UI/UX Designer',
    year: '2019 - 2020',
    status: 'Digital & Brand Systems',
    description:
      'Shaped the visual style and produced advertising/print assets for marketing campaigns, working closely with CDs and ADs.',
    image: '/images/work/web-tekcom.webp',
  },
  {
    id: 'mingle',
    index: '07',
    title: 'Mingle',
    subtitle: 'UI UX Design Lead',
    year: '2018 - 2019',
    status: 'Social & Consumer Mobile',
    description:
      'Led a 13-person team (5 UX/UI + 8 graphic designers) while designing UX/UI end-to-end for the Mingle 2 and Just Say Hi Dating apps.',
    image: '/images/work/app-pcos-cysterhood.webp',
  },
]

export default function WorkedAt() {
  const sectionId = useId()
  const prefersReducedMotion = useReducedMotion()
  const [activeId, setActiveId] = useState(COMPANIES[0].id)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const activeItem = COMPANIES.find((item) => item.id === activeId) || COMPANIES[0]

  return (
    <div className="worked-at-stage relative">
      <section
        id="experience"
        aria-labelledby={sectionId}
        className="worked-at relative flex flex-col items-center justify-center w-full min-h-[var(--rb-section-min-h,100vh)] overflow-hidden bg-[#0B0B12] px-4 py-20 sm:px-6 sm:py-24 lg:items-center lg:px-8 lg:py-28"
      >
        <SharedGridLines hide={isMobile ? [2] : [2, 3, 4, 5]} variant="gradient" />

        {/* Section Heading */}
        <div className="worked-at-heading mb-12 sm:mb-16 z-10">
          <span className="worked-at-badge font-heading">I’ve been</span>
          <h2
            id={sectionId}
            className="worked-at-title font-heading uppercase text-4xl sm:text-6xl font-bold"
          >
            Worked At
          </h2>
        </div>

        {/* Showcase-1 Block Layout with Curtis Precision Tiles */}
        <div className="mx-auto w-full max-w-[1400px] z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_560px] xl:grid-cols-[1fr_600px] gap-6 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column: Curtis Precision Tiles */}
            <div className="flex flex-col gap-[0.5625rem] w-full relative">
              {COMPANIES.map((item, index) => {
                const isActive = activeId === item.id
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 * !prefersReducedMotion }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.04 * index,
                    }}
                    className="worked-at-row w-full"
                    data-selected={isActive ? 'true' : 'false'}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-pressed={isActive}
                      data-sfx="true"
                      className="worked-at-row-button select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {/* Chamfered polygon background and border */}
                      <span aria-hidden="true" className="worked-at-row-bg" />

                      {/* Smooth Gliding Active Pill with matching polygon cut */}
                      {isActive && (
                        <motion.span
                          layoutId={`${sectionId}-active-background`}
                          className="absolute inset-0 z-0 pointer-events-none"
                          style={{
                            clipPath:
                              'polygon(0% 20px, 20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%)',
                            background: '#ffffff',
                          }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 300, damping: 30 }
                          }
                        />
                      )}

                      {/* Index Number */}
                      <span className="worked-at-row-index">{item.index}</span>

                      {/* Title & Role Stack */}
                      <span className="worked-at-row-text">
                        <span className="worked-at-row-title">{item.title}</span>
                        <span className="worked-at-row-role">{item.subtitle}</span>
                      </span>

                      {/* Period / Year */}
                      <span className="worked-at-row-period hidden sm:inline-block">
                        {item.year}
                      </span>

                      {/* Right Indicator Mark */}
                      <span className="worked-at-row-mark" aria-hidden="true">
                        {isActive ? '−' : '+'}
                      </span>
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {/* Right Column: Showcase Preview Card with Technical Crosshairs & Corner Plus Markers */}
            <div className="relative order-first mb-6 sm:mb-8 h-[300px] sm:h-[400px] lg:order-0 lg:mb-0 lg:h-[530px] w-full overflow-hidden border border-white/10 bg-[#0B0B12] shadow-2xl">
              {/* Technical CRT Rules */}
              <span className="worked-at-crt-rule worked-at-crt-rule--t" aria-hidden="true" />
              <span className="worked-at-crt-rule worked-at-crt-rule--b" aria-hidden="true" />
              <span className="worked-at-crt-rule worked-at-crt-rule--l" aria-hidden="true" />
              <span className="worked-at-crt-rule worked-at-crt-rule--r" aria-hidden="true" />

              {/* Corner Plus Signs */}
              {['tl', 'tr', 'br', 'bl'].map((pos) => (
                <svg
                  key={pos}
                  className={`worked-at-crt-plus worked-at-crt-plus--${pos}`}
                  viewBox="0 0 8 8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 3.5H7V4.5H4.5V7H3.5V4.5H1V3.5H3.5V1H4.5V3.5Z"
                    fill="currentColor"
                  />
                </svg>
              ))}

              {/* Showcase-1 Animated Slide-Up Image */}
              <AnimatePresence initial={false}>
                {activeItem && (
                  <motion.img
                    key={activeItem.id}
                    src={activeItem.image}
                    alt={activeItem.title}
                    width={880}
                    height={660}
                    decoding="async"
                    initial={prefersReducedMotion ? { opacity: 0 } : { y: '60%' }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>

              {/* Dark Gradient Overlay & Technical Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12]/95 via-[#0B0B12]/40 to-transparent pointer-events-none z-10" />

              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-left z-20 pointer-events-none">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-mono text-xs font-bold text-[#9DF133] bg-[#2F480F]/70 border border-[#9DF133]/40 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {activeItem.year}
                  </span>
                  <span className="font-heading text-xs font-semibold text-white/80 uppercase tracking-widest">
                    {activeItem.status}
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                  {activeItem.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
