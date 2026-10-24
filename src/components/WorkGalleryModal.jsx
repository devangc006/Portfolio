import React, { useState, useEffect } from 'react'
import Button from './Button'
import ArrowIcon from './ArrowIcon'
import { WORK_ITEMS } from './SelectedWork'

const ALL_WORKS = [
  ...WORK_ITEMS,
  { id: 'viewfinder', title: 'Viewfinder', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'badminton-justin', title: 'Badminton Justin', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'bookworldly', title: 'Bookworldly', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'boomberparty', title: 'Boomber Party', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'factorychain', title: 'FactoryChain', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'networkchuck', title: 'Network Chuck', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'siliconprime', title: 'SiliconPrime', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'goslim', title: 'GoSlim', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'sundae', title: 'Sundae', tag: 'Web Design', size: 'sm', href: '#' },
  { id: 'nicor', title: 'Nicor', tag: 'App Design', size: 'sm', href: '#' },
  { id: 'zco', title: 'Z&Co', tag: 'App Design', size: 'sm', href: '#' },
  { id: 'figure', title: 'Figure', tag: 'App Design', size: 'sm', href: '#' },
  { id: 'fiton', title: 'FitOn', tag: 'App Design', size: 'sm', href: '#' },
  { id: 'jointly', title: 'Jointly', tag: 'App Design', size: 'sm', href: '#' },
  { id: 'pyramid', title: 'The Rendered Pyramid', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'ninjento', title: 'Ninjento', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'johnswitch', title: 'John Switch', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'boxxy', title: 'Almighty Boxxy', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'iridescent', title: 'Iridescent', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'wonderer', title: 'Wonderer', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'ae13', title: 'AE-13', tag: 'Exploration', size: 'sm', href: '#' },
  { id: 'glasscube', title: 'Glass Cube Animation', tag: 'Exploration', size: 'sm', href: '#' },
]

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'case-study', label: 'Case Study (02)' },
  { id: 'design', label: 'Web/App Design (21)' },
  { id: 'exploration', label: 'Exploration (08)' },
]

export default function WorkGalleryModal({ isOpen, onClose, onSelectCaseStudy }) {
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = ALL_WORKS.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'case-study') return item.tag === 'Case Study'
    if (activeTab === 'design') return item.tag === 'Web Design' || item.tag === 'App Design'
    if (activeTab === 'exploration') return item.tag === 'Exploration'
    return true
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[var(--background-bg-1)] border border-[var(--background-stroke-1)] rounded-lg p-6 sm:p-10 my-auto text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--background-stroke-1)] pb-6 mb-8">
          <div>
            <span className="font-heading text-xs uppercase tracking-widest text-[var(--primary-green-neon)]">
              Proudest works
            </span>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold uppercase mt-1">
              Work
            </h1>
            <p className="font-sans text-sm text-[var(--text-grey-1)] mt-2">
              I don’t know what to say. Just all of my proudest works in one page.
            </p>
          </div>
          <Button onClick={onClose} className="h-10 px-5">
            Close
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--background-stroke-1)] pb-4 font-heading text-xs uppercase tracking-wider">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--primary-green-neon)] text-black font-bold'
                  : 'bg-[var(--background-bg-2)] text-[var(--text-grey-1)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {filtered.map((item) => {
            const isCaseStudy = item.tag === 'Case Study'
            const isExternal = item.href && item.href.startsWith('http')

            const handleClick = (e) => {
              if (isCaseStudy) {
                e.preventDefault()
                onSelectCaseStudy(item.id)
              }
            }

            return (
              <div
                key={item.id}
                className="group relative p-4 bg-[var(--background-bg-2)] border border-[var(--background-stroke-1)] hover:border-[var(--primary-green-neon)] rounded transition-all duration-200"
              >
                {item.image && (
                  <div className="aspect-[4/3] w-full overflow-hidden rounded mb-3 bg-black/40">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-heading text-[10px] uppercase tracking-wider text-[var(--primary-green-neon)]">
                      {item.tag}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-white mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                  <a
                    href={item.href || '#'}
                    onClick={handleClick}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-1 font-heading text-xs uppercase tracking-wider text-[var(--text-grey-1)] group-hover:text-white"
                    data-sfx="true"
                  >
                    <span>Visit</span>
                    <ArrowIcon className="text-[var(--primary-green-neon)]" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
