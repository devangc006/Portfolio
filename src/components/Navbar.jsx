import React, { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useMenu } from '../context/MenuContext'

const NAV_ITEMS = [
  { id: '2', eyebrow: '01', label: 'About', href: '#about' },
  { id: '3', eyebrow: '02', label: 'Work', href: '#work' },
]

export default function Navbar() {
  const containerRef = useRef(null)
  const { isOpen, toggle, close } = useMenu()
  const isFirstRender = useRef(true)

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, close])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // GSAP Entrance / Exit Timeline for Kinetic Gate
  useEffect(() => {
    if (!containerRef.current) return

    // Avoid initial close animation on mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!isOpen) return
    }

    const ctx = gsap.context(() => {
      const navOverlay = containerRef.current.querySelector('.nav-overlay-wrapper')
      const menuContent = containerRef.current.querySelector('.menu-content')
      const overlay = containerRef.current.querySelector('.overlay')
      const backdropLayers = containerRef.current.querySelectorAll('.backdrop-layer')
      const navLinks = containerRef.current.querySelectorAll('.nav-link')
      const fadeItems = containerRef.current.querySelectorAll('[data-menu-fade]')
      const closeBtn = containerRef.current.querySelector('.nav-close-btn')
      const btnTexts = closeBtn?.querySelectorAll('p')

      const tl = gsap.timeline()

      if (isOpen) {
        navOverlay?.setAttribute('data-nav', 'open')
        tl.set(navOverlay, { display: 'block' })
          .set(menuContent, { xPercent: 0 }, '<')
          .fromTo(btnTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.1, duration: 0.4, ease: 'power2.inOut' })
          .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, '<')
          .fromTo(
            backdropLayers,
            { xPercent: 101 },
            { xPercent: 0, stagger: 0.12, duration: 0.575, ease: 'power3.out' },
            '<'
          )
          .fromTo(
            navLinks,
            { yPercent: 140, rotate: 8, opacity: 0 },
            { yPercent: 0, rotate: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' },
            '<+=0.3'
          )

        if (fadeItems.length) {
          tl.fromTo(
            fadeItems,
            { autoAlpha: 0, yPercent: 40 },
            { autoAlpha: 1, yPercent: 0, stagger: 0.04, duration: 0.4, clearProps: 'all', ease: 'power2.out' },
            '<+=0.15'
          )
        }
      } else {
        navOverlay?.setAttribute('data-nav', 'closed')
        tl.to(overlay, { autoAlpha: 0, duration: 0.25 })
          .to(menuContent, { xPercent: 110, duration: 0.4, ease: 'power3.in' }, '<')
          .to(btnTexts, { yPercent: 0, duration: 0.35, ease: 'power2.inOut' }, '<')
          .set(navOverlay, { display: 'none' })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isOpen])

  // Kinetic SVG Background Shapes on Link Hover
  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const items = containerRef.current.querySelectorAll('.menu-list-item[data-shape]')
      const shapesContainer = containerRef.current.querySelector('.ambient-background-shapes')
      if (!shapesContainer) return

      items.forEach((item) => {
        const shapeId = item.getAttribute('data-shape')
        const shape = shapesContainer.querySelector(`.bg-shape-${shapeId}`)
        if (!shape) return

        const elements = shape.querySelectorAll('.shape-element')

        const onEnter = () => {
          shapesContainer.querySelectorAll('.bg-shape').forEach((s) => s.classList.remove('active'))
          shape.classList.add('active')
          gsap.fromTo(
            elements,
            { scale: 0.6, opacity: 0, rotation: -12 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.07,
              ease: 'back.out(1.8)',
              overwrite: 'auto',
            }
          )
        }

        const onLeave = () => {
          gsap.to(elements, {
            scale: 0.85,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => shape.classList.remove('active'),
            overwrite: 'auto',
          })
        }

        item.addEventListener('mouseenter', onEnter)
        item.addEventListener('mouseleave', onLeave)
        item._cleanup = () => {
          item.removeEventListener('mouseenter', onEnter)
          item.removeEventListener('mouseleave', onLeave)
        }
      })
    }, containerRef)

    return () => {
      ctx.revert()
      if (containerRef.current) {
        containerRef.current.querySelectorAll('.menu-list-item[data-shape]').forEach((el) => {
          el._cleanup?.()
        })
      }
    }
  }, [])

  const handleLinkClick = useCallback((e, href) => {
    close()
    if (href.startsWith('#')) {
      e.preventDefault()
      if (href === '#' || href === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [close])

  return (
    <div ref={containerRef}>
      {/* 1. Kinetic Top Navigation Bar */}
      <div className="site-header-wrapper">
        <header className="header">
          <div className="nav-container">
            <nav className="nav-row">
              {/* Brand Logo */}
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
                aria-label="DEVANG C"
                className="nav-logo-row"
              >
                <svg
                  width="16"
                  height="14"
                  viewBox="0 0 14 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    d="M10.1414 5.38525L9.14001 5.90097L7 2.23234L1.92813 10.9269H6.24551V12H0L7 0L10.1414 5.38525ZM14 12H7.75449V10.9269H12.0719L9.8945 7.19439L10.8959 6.67867L14 12Z"
                    fill="var(--color-primary)"
                  />
                  <path
                    d="M7.00008 5.1018L9.77335 9.77725H4.22681L7.00008 5.1018Z"
                    fill="var(--color-primary)"
                  />
                </svg>
                <span className="logo-text">DEVANG C</span>
              </a>

              {/* Right Side: Kinetic Menu Button */}
              <div className="nav-row__right">
                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={toggle}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                  <div className="menu-button-text">
                    <p className="p-large">Menu</p>
                    <p className="p-large">Close</p>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* 2. Fullscreen Sterling Gate Kinetic Navigation Drawer */}
      <section className="fullscreen-menu-container">
        <div data-nav="closed" className="nav-overlay-wrapper">
          {/* Backdrop blur click target */}
          <div className="overlay" onClick={close} />

          <nav className="menu-content" aria-label="Main menu">
            {/* Sliding Layered Kinetic Gate */}
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              {/* Ambient Kinetic Shapes */}
              <div className="ambient-background-shapes">
                {/* Shape 1 - Floating Planets */}
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="80" cy="120" r="42" fill="rgba(157, 241, 51, 0.22)" />
                  <circle className="shape-element" cx="300" cy="80" r="64" fill="rgba(99, 102, 241, 0.18)" />
                  <circle className="shape-element" cx="200" cy="300" r="82" fill="rgba(236, 72, 153, 0.15)" />
                  <circle className="shape-element" cx="350" cy="280" r="32" fill="rgba(157, 241, 51, 0.2)" />
                </svg>

                {/* Shape 2 - Fluid Waves */}
                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M0 200 Q100 100, 200 200 T 400 200"
                    stroke="rgba(157, 241, 51, 0.28)"
                    strokeWidth="56"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 280 Q100 180, 200 280 T 400 280"
                    stroke="rgba(99, 102, 241, 0.22)"
                    strokeWidth="38"
                    fill="none"
                  />
                </svg>

                {/* Shape 3 - Dot Matrix Array */}
                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="50" cy="50" r="8" fill="rgba(157, 241, 51, 0.35)" />
                  <circle className="shape-element" cx="150" cy="50" r="8" fill="rgba(99, 102, 241, 0.3)" />
                  <circle className="shape-element" cx="250" cy="50" r="8" fill="rgba(236, 72, 153, 0.3)" />
                  <circle className="shape-element" cx="350" cy="50" r="8" fill="rgba(157, 241, 51, 0.35)" />
                  <circle className="shape-element" cx="100" cy="150" r="12" fill="rgba(99, 102, 241, 0.25)" />
                  <circle className="shape-element" cx="200" cy="150" r="12" fill="rgba(236, 72, 153, 0.25)" />
                  <circle className="shape-element" cx="300" cy="150" r="12" fill="rgba(157, 241, 51, 0.25)" />
                  <circle className="shape-element" cx="50" cy="250" r="10" fill="rgba(236, 72, 153, 0.3)" />
                  <circle className="shape-element" cx="150" cy="250" r="10" fill="rgba(157, 241, 51, 0.3)" />
                  <circle className="shape-element" cx="250" cy="250" r="10" fill="rgba(99, 102, 241, 0.3)" />
                  <circle className="shape-element" cx="350" cy="250" r="10" fill="rgba(157, 241, 51, 0.3)" />
                  <circle className="shape-element" cx="100" cy="350" r="6" fill="rgba(157, 241, 51, 0.35)" />
                  <circle className="shape-element" cx="200" cy="350" r="6" fill="rgba(99, 102, 241, 0.35)" />
                  <circle className="shape-element" cx="300" cy="350" r="6" fill="rgba(236, 72, 153, 0.35)" />
                </svg>

                {/* Shape 4 - Organic Loops */}
                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                    fill="rgba(157, 241, 51, 0.18)"
                  />
                  <path
                    className="shape-element"
                    d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                    fill="rgba(99, 102, 241, 0.18)"
                  />
                </svg>

                {/* Shape 5 - Kinetic Speedlines */}
                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <line
                    className="shape-element"
                    x1="0"
                    y1="100"
                    x2="300"
                    y2="400"
                    stroke="rgba(157, 241, 51, 0.22)"
                    strokeWidth="32"
                    strokeLinecap="round"
                  />
                  <line
                    className="shape-element"
                    x1="100"
                    y1="0"
                    x2="400"
                    y2="300"
                    stroke="rgba(99, 102, 241, 0.18)"
                    strokeWidth="26"
                    strokeLinecap="round"
                  />
                  <line
                    className="shape-element"
                    x1="200"
                    y1="0"
                    x2="400"
                    y2="200"
                    stroke="rgba(236, 72, 153, 0.16)"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Nav Menu Content Wrapper */}
            <div className="menu-content-wrapper">
              <ul className="menu-list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id} className="menu-list-item" data-shape={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className="nav-link"
                    >
                      <span className="eyebrow">{item.eyebrow}</span>
                      <p className="nav-link-text">{item.label}</p>
                      <div className="nav-link-hover-bg" />
                    </a>
                  </li>
                ))}
              </ul>

              {/* Menu Details & Socials */}
              <div className="menu-details" data-menu-fade="true">
                <div className="menu-details-meta">
                  <span className="menu-details-label">Get in Touch</span>
                  <a href="mailto:devangc006@gmail.com" className="menu-details-email">
                    devangc006@gmail.com
                  </a>
                </div>

                <div className="socials-row">
                  <a
                    href="https://github.com/devangc006"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/devangc006/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </div>
  )
}
