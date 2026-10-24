import React, { useRef, useEffect } from 'react'
import SharedGridLines from './SharedGridLines'
import Button from './Button'
import ArrowIcon from './ArrowIcon'
import ScrambleText from './ScrambleText'

export const WORK_ITEMS = [
  {
    id: 'skymavis',
    title: 'SkyMavis',
    year: '2024-2025',
    tag: 'Case Study',
    image: '/images/work/case-study-skymavis.webp',
    ratio: 880 / 641,
    cover: '#64ffc1',
    size: 'lg',
    href: '#skymavis',
  },
  {
    id: 'opswat',
    title: 'OPSWAT',
    year: '2025-2026',
    tag: 'Case Study',
    image: '/images/work/case-study-opswat.webp',
    ratio: 880 / 637,
    cover: '#64ffc1',
    size: 'lg',
    href: '#opswat',
  },
  {
    id: 'firekamp',
    title: 'Firekamp Website',
    year: '2022',
    tag: 'Web Design',
    image: '/images/work/web-firekamp.webp',
    ratio: 880 / 660,
    cover: '#64e8ff',
    size: 'sm',
    href: 'https://www.firekamp.com/',
  },
  {
    id: 'pcos-cysterhood',
    title: 'PCOS Cysterhood',
    year: '2022',
    tag: 'App Design',
    image: '/images/work/app-pcos-cysterhood.webp',
    ratio: 880 / 660,
    cover: '#64e8ff',
    size: 'sm',
    href: 'https://apps.apple.com/vn/app/cysterhood-pcos-weight-loss/id1638723168',
  },
  {
    id: 'tekcom',
    title: 'Tekcom',
    year: '2018',
    tag: 'Web Design',
    image: '/images/work/web-tekcom.webp',
    ratio: 880 / 660,
    cover: '#64e8ff',
    size: 'lg',
    href: 'https://www.tekcom.vn/',
  },
  {
    id: 'itrackbites',
    title: 'iTrackBites',
    year: '',
    tag: 'App Design',
    image: '/images/work/app-itrackbites.webp',
    ratio: 816 / 598,
    cover: '#64e8ff',
    size: 'sm',
    href: 'https://healthiapp.com/',
  },
  {
    id: 'outdoor-gps',
    title: 'Outdoor GPS',
    year: '2019',
    tag: 'App Design',
    image: '/images/work/app-outdoor-gps.webp',
    ratio: 880 / 660,
    cover: '#64e8ff',
    size: 'lg',
    href: 'https://apps.apple.com/us/app/outdoors-gps-offline-os-maps/id365688106?l=vi',
  },
  {
    id: 'vinh-tuong',
    title: 'Vinh Tuong',
    year: '2018',
    tag: 'Web Design',
    image: '/images/work/web-vinh-tuong.webp',
    ratio: 880 / 660,
    cover: '#64e8ff',
    size: 'lg',
    href: 'https://vinhtuong.com/',
  },
  {
    id: 'sortly',
    title: 'Sortly',
    year: '',
    tag: 'App Design',
    image: '/images/work/app-sortly.webp',
    ratio: 816 / 598,
    cover: '#64e8ff',
    size: 'sm',
    href: 'https://apps.apple.com/us/app/sortly-inventory-simplified/id529353551',
  },
]

const PLUS_CORNERS = ['tl', 'tr', 'br', 'bl']

const SUBPATHS = [
  'M4195.14 155L4076.14 445H3680.64L3649.64 411.855H3361.64H2629.64L2529.64 298.5H2028.14L1938.14 445H1630.64H1180.14H1074.14L1040.64 399H805.645',
  'M4195.14 155H4426.14',
  'M4195.14 155H3807.64L3722.64 1H3216.64L3194.64 23.5H2903.64H2503.64L2489.64 39.5H2070.64L1980.64 119.5H1603.64H1574.64L1480.64 1H988.145H942.645L805.645 138V399',
  'M-114.000 230.211V399H805.645',
]

export default function SelectedWork({ onOpenGallery, onOpenCaseStudy }) {
  const viewportRef = useRef(null)

  // Enable smooth horizontal scroll via mousewheel when hovering track on desktop
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && window.innerWidth >= 1025) {
        // Only convert vertical scroll to horizontal scroll if not scrolled all the way to end
        const maxScroll = el.scrollWidth - el.clientWidth
        if ((e.deltaY > 0 && el.scrollLeft < maxScroll) || (e.deltaY < 0 && el.scrollLeft > 0)) {
          e.preventDefault()
          el.scrollLeft += e.deltaY * 1.2
        }
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <section id="work" className="selected-work-outer relative w-full" data-surface="green">
      <div className="selected-work font-heading">
        <SharedGridLines hide={[2, 3, 4, 5]} />

        {/* Section Heading */}
        <div className="selected-work-heading">
          <div className="selected-work-heading-top">
            <span
              className="selected-work-badge font-heading"
              style={{
                clipPath:
                  'polygon(0% 4px, 4px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%)',
              }}
            >
              <span>Keep Scrolling</span>
            </span>
            <h2 className="selected-work-title font-heading uppercase text-4xl sm:text-6xl font-bold">
              Selected Work
            </h2>
          </div>
          <p className="selected-work-description font-sans">
            I’m glad you’re still here lol.
          </p>
        </div>

        {/* CTA Button */}
        <div className="selected-work-cta-wrap">
          <Button
            onClick={onOpenGallery}
            tone="on-green"
            className="selected-work-cta font-heading"
            data-cursor-label="Explore"
          >
            Explore More
          </Button>
        </div>

        {/* Work Viewport / Horizontal Track */}
        <div
          ref={viewportRef}
          className="work-viewport"
        >
          {/* Circuit Lines Layer */}
          <div className="work-path-layer pointer-events-none" aria-hidden="true">
            <svg
              className="work-path"
              aria-hidden="true"
              viewBox="0 0 4427.14 446"
              preserveAspectRatio="none"
              style={{
                '--path-x': -563.6445,
                '--path-y': 178.5,
                '--path-w': 4427.14,
                '--path-h': 446,
              }}
            >
              <defs>
                <linearGradient
                  id="work-path-tail-fade"
                  gradientUnits="userSpaceOnUse"
                  x1="4195.14"
                  y1="155"
                  x2="4426.14"
                  y2="155"
                >
                  <stop offset="60%" stopColor="var(--work-path-stroke)" />
                  <stop offset="100%" stopColor="var(--primary-green-neon)" />
                </linearGradient>
              </defs>
              {SUBPATHS.map((d, idx) => (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  stroke={idx === 1 ? 'url(#work-path-tail-fade)' : 'rgba(157, 241, 51, 0.35)'}
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Diamond marker */}
            <span
              className="work-path-diamond"
              aria-hidden="true"
              style={{
                '--dx': -677.64,
                '--dy': 408.71,
                '--dbox': 70.71,
                '--dside': 50,
                '--ddot': 11.31,
              }}
            >
              <span className="work-path-diamond-inner">
                <span className="work-path-diamond-box" />
                <span className="work-path-diamond-dot" />
              </span>
            </span>
          </div>

          {/* Cards Track */}
          <div className="work-track">
            {WORK_ITEMS.map((item, index) => {
              const isExternal = item.href.startsWith('http')
              const isCaseStudy = item.tag === 'Case Study'

              const handleClick = (e) => {
                if (isCaseStudy) {
                  e.preventDefault()
                  onOpenCaseStudy?.(item.id)
                }
              }

              return (
                <article
                  key={item.id}
                  className={`work-card work-card-${item.size} group`}
                  style={{
                    zIndex: index + 1,
                  }}
                >
                  <a
                    href={item.href}
                    onClick={handleClick}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="work-card-thumb work-card-thumb--link block relative overflow-hidden"
                    data-cursor-label={isCaseStudy ? 'Case Study' : 'Visit'}
                    data-sfx="true"
                  >
                    <div className="work-card-frame relative w-full h-full overflow-hidden">
                      <div className="work-card-mask relative w-full h-full overflow-hidden" data-work-mask={item.id}>
                        <img
                          className="work-card-img block w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          src={item.image}
                          alt={item.title}
                          draggable={false}
                        />
                        <div
                          className="work-card-cover absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                          style={{ backgroundColor: item.cover }}
                        />
                      </div>
                      <span className="work-card-tag font-heading font-medium tracking-wide">
                        {item.tag}
                      </span>
                    </div>

                    {/* Corner Plus Signs */}
                    {PLUS_CORNERS.map((corner) => (
                      <svg
                        key={corner}
                        className={`work-card-plus work-card-plus-${corner}`}
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
                  </a>

                  {/* Card Label */}
                  <div className="work-card-label flex items-center justify-between mt-3">
                    <h3 className="work-card-title font-heading text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <a
                      href={item.href}
                      onClick={handleClick}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="work-card-visit flex items-center gap-1.5 font-heading text-xs uppercase tracking-wider text-[var(--text-grey-1)] hover:text-white transition-colors"
                      data-sfx="true"
                    >
                      <ScrambleText text="Visit" scrambleOnHover />
                      <ArrowIcon className="work-card-visit-icon" />
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
