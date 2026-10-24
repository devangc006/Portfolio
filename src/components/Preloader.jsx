import React, { useState, useEffect } from 'react'

const PLUS_CORNERS = ['tl', 'tr', 'bl', 'br']
const EDGES = ['top', 'right', 'bottom', 'left']

export default function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      // Faster progression with realistic increments
      const increment = Math.floor(Math.random() * 8) + 3
      current = Math.min(100, current + increment)
      setPercent(current)

      if (current >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsFinished(true)
          onComplete?.()
        }, 300)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [onComplete])

  if (isFinished) return null

  return (
    <div
      className={`preloader fixed inset-0 z-[100] transition-opacity duration-500 ${
        percent >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
      data-surface="green"
    >
      {/* 4 Framing lines */}
      <span className="preloader-line preloader-line-v preloader-line-left" />
      <span className="preloader-line preloader-line-v preloader-line-right" />
      <span className="preloader-line preloader-line-h preloader-line-top" />
      <span className="preloader-line preloader-line-h preloader-line-bottom" />

      {/* Percentage Counter */}
      <span className="preloader-percent font-heading select-none font-bold text-2xl text-[var(--primary-green-neon)]">
        {percent}%
      </span>

      {/* 4 Chamfer edges */}
      {EDGES.map((edge) => (
        <svg
          key={edge}
          className={`preloader-chamfer preloader-chamfer-${edge}`}
          viewBox="-0.5 -0.5 140.754 21"
          width="140.754"
          height="21"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M138.754 0L136.497 1.78418L114.997 18.7842L114.725 19H24.029L23.757 18.7842L2.257 1.78418L0 0Z"
            fill="none"
            stroke="#67b900"
            strokeWidth="1"
          />
        </svg>
      ))}

      {/* 4 Plus markers */}
      {PLUS_CORNERS.map((corner) => (
        <svg
          key={corner}
          className={`preloader-plus preloader-plus-${corner}`}
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
    </div>
  )
}
