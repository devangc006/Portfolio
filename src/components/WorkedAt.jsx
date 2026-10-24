import React, { useState, useRef, useEffect } from 'react'
import SharedGridLines from './SharedGridLines'
import CompanyLogo from './CompanyLogos'
import CardSwap, { Card } from './CardSwap'

const COMPANIES = [
  {
    key: 'opswat',
    index: '01',
    name: 'OPSWAT',
    role: 'Sr. Product Designer',
    period: '2025 - Present',
    badge: 'Enterprise Cybersecurity',
    description:
      'Led product design across My OPSWAT, Central Management, MetaDefender Drive, and Industrial Firewall, scaling the design system to keep UX consistent across the enterprise ecosystem.',
    image: '/images/work/case-study-opswat.webp',
  },
  {
    key: 'skymavis',
    index: '02',
    name: 'SkyMavis',
    role: 'Product Designer',
    period: '2024 - 2025',
    badge: 'Web3 & GameFi Ecosystem',
    description:
      'Worked closely across Mavis Market, Mavis Store, and Dev Journey — from competitive research and user interviews to UAT before release.',
    image: '/images/work/case-study-skymavis.webp',
  },
  {
    key: 'firekamp',
    index: '03',
    name: 'FireKamp',
    role: 'Sr. Product Designer',
    period: '2022 - 2024',
    badge: 'Multi-Product Studio',
    description:
      'Delivered hi-fi visual design across varied product types (time management, weight-loss supplement, call recording, and more), ensuring live products matched the design.',
    image: '/images/work/web-firekamp.webp',
  },
  {
    key: 'uptivistic',
    index: '04',
    name: 'Uptivistic',
    role: 'Product Design Lead',
    period: '2021 - 2022',
    badge: 'Game Design & Visuals',
    description:
      'Led a 4-person design team, turning Game Designer wireframes into hi-fi visual designs while working closely with developers to keep live builds on-spec.',
    image: '/images/work/exploration-almighty-boxxy.webp',
  },
  {
    key: 'ilabs',
    index: '05',
    name: 'ILABS',
    role: 'Product Designer',
    period: '2020 - 2021',
    badge: 'Client Product Delivery',
    description:
      'Partnered directly with client-side POs/PMs across projects, balancing internal/marketing asset production with consistent design quality.',
    image: '/images/work/app-sortly.webp',
  },
  {
    key: 'mpire',
    index: '06',
    name: 'Mpire',
    role: 'UI/UX Designer',
    period: '2019 - 2020',
    badge: 'Digital & Brand Systems',
    description:
      'Shaped the visual style and produced advertising/print assets for marketing campaigns, working closely with CDs and ADs.',
    image: '/images/work/web-tekcom.webp',
  },
  {
    key: 'mingle',
    index: '07',
    name: 'Mingle',
    role: 'UI UX Design Lead',
    period: '2018 - 2019',
    badge: 'Social & Consumer Mobile',
    description:
      'Led a 13-person team (5 UX/UI + 8 graphic designers) while designing UX/UI end-to-end for the Mingle 2 and Just Say Hi Dating apps.',
    image: '/images/work/app-pcos-cysterhood.webp',
  },
]

export default function WorkedAt() {
  const [isMobile, setIsMobile] = useState(false)
  const [activeCompanyIndex, setActiveCompanyIndex] = useState(0)
  const cardSwapRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="worked-at-stage relative">
      <section className="worked-at relative">
        <SharedGridLines hide={isMobile ? [2] : [2, 3, 4, 5]} variant="gradient" />

        {/* Section Heading - Preserved exactly as requested */}
        <div className="worked-at-heading">
          <span className="worked-at-badge font-heading">I’ve been</span>
          <h2 className="worked-at-title font-heading uppercase text-4xl sm:text-6xl font-bold">
            Worked At
          </h2>
        </div>

        {/* Card Swap Content - ReactBits CardSwap (preset: calm, delay: 6000, speed: 0.6, bounce: 0, hoverSpread: 0) */}
        <div className="w-full max-w-[900px] mx-auto mt-6 flex flex-col items-center">
          {/* CardSwap Deck Container */}
          <div className="w-full h-[460px] sm:h-[520px] md:h-[560px] flex items-center justify-center relative">
            <CardSwap
              ref={cardSwapRef}
              width={isMobile ? 360 : 480}
              height={isMobile ? 300 : 350}
              cardDistance={isMobile ? 40 : 60}
              verticalDistance={isMobile ? 50 : 70}
              depth={90}
              skewAmount={6}
              visibleCards={4}
              cardRadius={18}
              delay={6000}
              speed={0.6}
              bounce={0}
              hoverSpread={0}
              autoplay={true}
              pauseOnHover={true}
              draggable={true}
              onChange={(index) => setActiveCompanyIndex(index)}
              className="w-full h-full"
            >
              {COMPANIES.map((company) => (
                <Card
                  key={company.key}
                  className="p-4 sm:p-5 flex flex-col justify-between border border-white/10 select-none bg-[#12111D]"
                >
                  {/* Card Header: Logo/Index, Name, Role & Period */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#9DF133] bg-[#2F480F]/50 border border-[#9DF133]/40 px-2 py-0.5 rounded shrink-0">
                        {company.index}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-white uppercase tracking-wide truncate">
                          {company.name}
                        </h3>
                        <p className="font-sans text-xs text-[#9DF133] font-medium truncate">
                          {company.role}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] sm:text-[11px] text-white/70 uppercase tracking-wider shrink-0 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                      {company.period}
                    </span>
                  </div>

                  {/* Card Media (Screenshot) with Dark Gradient Overlay & Details */}
                  <div className="relative flex-1 rounded-xl overflow-hidden min-h-0 my-3 bg-black/60 border border-white/10">
                    <img
                      src={company.image}
                      alt={company.name}
                      draggable={false}
                      className="pointer-events-none absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12]/95 via-[#0B0B12]/45 to-black/10" />

                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-left">
                      <div className="h-6 sm:h-7 mb-2 flex items-center">
                        <CompanyLogo
                          name={company.key}
                          className="max-h-5 sm:max-h-6 max-w-[140px] object-contain filter drop-shadow-[0_0_10px_rgba(157,241,51,0.35)]"
                        />
                      </div>
                      <p className="font-sans text-xs text-white/85 line-clamp-2 leading-relaxed">
                        {company.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Domain Badge & Status */}
                  <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                    <span className="text-white/50 tracking-wider uppercase truncate mr-2">
                      {company.badge}
                    </span>
                    <span className="text-[#9DF133] flex items-center gap-1.5 font-semibold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9DF133] animate-pulse" />
                      ACTIVE SPEC
                    </span>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>

          {/* Interactive Controls & Company Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-[620px] mt-6 px-4">
            {/* Quick Prev / Next Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-sfx="true"
                onClick={() => cardSwapRef.current?.prev()}
                aria-label="Previous company card"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#9DF133]/50 text-white hover:text-[#9DF133] flex items-center justify-center transition-all cursor-pointer font-mono text-sm"
              >
                ←
              </button>
              <button
                type="button"
                data-sfx="true"
                onClick={() => cardSwapRef.current?.next()}
                aria-label="Next company card"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#9DF133]/50 text-white hover:text-[#9DF133] flex items-center justify-center transition-all cursor-pointer font-mono text-sm"
              >
                →
              </button>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2">
              {COMPANIES.map((company, idx) => (
                <button
                  key={company.key}
                  type="button"
                  data-sfx="true"
                  onClick={() => cardSwapRef.current?.goTo(idx)}
                  aria-label={`Jump to ${company.name}`}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    idx === activeCompanyIndex
                      ? 'w-7 bg-[#9DF133] shadow-[0_0_8px_#9DF133]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Prompt hint */}
            <span className="font-mono text-[10px] sm:text-[11px] text-white/40 uppercase tracking-widest text-center">
              DRAG OR CLICK TO SWAP
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
