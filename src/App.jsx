import React, { useState, useEffect } from 'react'
import Lenis from 'lenis'

import { SoundProvider } from './context/SoundContext'
import { MenuProvider } from './context/MenuContext'
import { SurfaceToneProvider, useSurfaceTone } from './context/SurfaceToneContext'

import Preloader from './components/Preloader'
import LandscapeNotice from './components/LandscapeNotice'
import GyroscopeCursor from './components/GyroscopeCursor'
import Navbar from './components/Navbar'
import MenuOverlay from './components/MenuOverlay'
import Hero from './components/Hero'
import StatStage from './components/StatStage'
import SelectedWork from './components/SelectedWork'
import WorkedAt from './components/WorkedAt'
import Footer from './components/Footer'
import CaseStudyModal from './components/CaseStudyModal'
import WorkGalleryModal from './components/WorkGalleryModal'

function PortfolioMain() {
  const [activeCaseStudy, setActiveCaseStudy] = useState(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const { setSurfaceTone } = useSurfaceTone()

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  // Detect green surface sections to update navbar theme tone
  useEffect(() => {
    const greenSections = document.querySelectorAll('[data-surface="green"]')
    if (!greenSections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        let hasGreen = false
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.boundingClientRect.top <= 80) {
            hasGreen = true
          }
        })
        setSurfaceTone(hasGreen ? 'green' : 'dark')
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: [0, 0.1, 0.5],
      }
    )

    greenSections.forEach((sec) => observer.observe(sec))
    return () => observer.disconnect()
  }, [setSurfaceTone])

  return (
    <div id="scroll-container" className="relative min-h-screen bg-[var(--background-bg-0)] text-[var(--foreground)] selection:bg-[var(--primary-green-neon)] selection:text-black">
      <div id="scroll-content">
        {/* Mobile orientation block */}
        <LandscapeNotice />

        {/* Gyroscope Cursor with adaptive background theme */}
        <GyroscopeCursor />

        {/* Sticky Navbar */}
        <Navbar />

        {/* Slide-out Menu Overlay */}
        <MenuOverlay />

        {/* Main Content Sections */}
        <main>
          <Hero />
          <StatStage />
          <SelectedWork
            onOpenGallery={() => setGalleryOpen(true)}
            onOpenCaseStudy={(id) => setActiveCaseStudy(id)}
          />
          <WorkedAt />
          <Footer />
        </main>

        {/* Modals */}
        <CaseStudyModal
          caseStudyId={activeCaseStudy}
          onClose={() => setActiveCaseStudy(null)}
        />
        <WorkGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          onSelectCaseStudy={(id) => {
            setGalleryOpen(false)
            setActiveCaseStudy(id)
          }}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SoundProvider>
      <MenuProvider>
        <SurfaceToneProvider>
          <Preloader />
          <PortfolioMain />
        </SurfaceToneProvider>
      </MenuProvider>
    </SoundProvider>
  )
}
