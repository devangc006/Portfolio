import React, { useId, useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SharedGridLines from './SharedGridLines'

const COMPANIES = [
    {
    id: 'iitm',
    index: '01',
    title: 'IITM Pravartak',
    subtitle: 'Project based Internship',
    year: '2026',
    status: 'Database Engineering',
    description:
      'Completed a project-based internship building a Personal Health & Environment Wellness Recommendation System.',
    image: '/images/work/iitm-ptf.png',
  },
  {
    id: 'iiit-h',
    index: '02',
    title: 'IIIT Hyderabad',
    subtitle: 'Summer of AI Internship',
    year: '2025',
    status: 'Viswam.AI',
    description:
      'Completed a 4-week intensive "Summer of AI" internship focused on building impactful technology solutions for the Global South.',
    image: '/images/work/iiit-hyd.jpg',
  },
  {
    id: 'machinser',
    index: '03',
    title: 'Machinser technologies',
    subtitle: 'Odoo ERP Internship',
    year: '2026',
    status: 'Odoo ERP',
    description:
      'Completed a 6-week structured internship program demonstrating practical industry skills in Odoo ERP.',
    image: '/images/work/machinser.jpg',
  },
  {
    id: 'aws-sbg',
    index: '04',
    title: 'AWS SBG Execom',
    subtitle: 'Tech Head',
    year: '2026 - Present',
    status: 'Tech Head @ TKMCE',
    description:
      'Driving cloud literacy initiatives, technical bootcamps, and project architecture reviews on AWS for student members of the AWS Student Body Group (SBG).',
    image: '/images/work/aws-sbg.jpg',
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
