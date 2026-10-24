import React, { useEffect, useRef } from 'react'

export default function PortraitCanvas() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = '/images/me.png'

    let animationId
    let isHovered = false
    let glitchTimer = 0

    const render = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const logicalW = rect.width
      const logicalH = rect.height

      if (
        canvas.width !== Math.round(logicalW * dpr) ||
        canvas.height !== Math.round(logicalH * dpr)
      ) {
        canvas.width = Math.round(logicalW * dpr)
        canvas.height = Math.round(logicalH * dpr)
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, logicalW, logicalH)

      if (img.complete && img.naturalWidth > 0) {
        const isMobile = logicalW < 768
        const isTablet = logicalW >= 768 && logicalW < 1025

        // Precise subject bounding geometry from me.png (833 x 768):
        // Subject bounds: x: 33..813 (w: 780, subject center: 423, face center: 442)
        // Subject bounds: y: 85..768 (h: 683, head top: 85, chest bottom: 768)
        const subjectH = 683

        // Responsive viewport height fill with upper scale limit to prevent oversized portrait on tall screens:
        // Desktop: fill up to ~85% of height, maxScale ~1.25
        // Tablet: fill ~75%, maxScale ~0.78 so text on the left has full breathing room
        // Mobile: fill ~72%
        const baseFill = isMobile ? 0.72 : isTablet ? 0.75 : 0.85
        const rawScale = (logicalH * baseFill) / subjectH
        // Cap max scale so the portrait remains proportional across different aspect ratios
        const maxScale = isMobile ? (logicalW * 0.85) / 780 : isTablet ? (logicalW * 0.78) / 780 : 1.25
        const scale = Math.min(rawScale, maxScale)

        const drawWidth = img.naturalWidth * scale
        const drawHeight = img.naturalHeight * scale

        // Anchor bottom of chest to bottom edge of hero
        const drawY = logicalH - drawHeight

        // Horizontal placement:
        // Desktop & Tablet: Placed perfectly to the right side of the webpage
        // Mobile: Placed nicely to the right side / framed clearly
        let drawX
        if (isMobile) {
          // On mobile, keep subject well framed towards the right
          drawX = logicalW - drawWidth + (img.naturalWidth - 813) * scale
        } else {
          // Dock to the right edge of the hero pin
          drawX = logicalW - drawWidth
        }

        // Occasional subtle digital glitch tear when hovered
        glitchTimer++
        if (isHovered && glitchTimer % 14 === 0 && Math.random() > 0.35) {
          const sliceY = Math.random() * logicalH
          const sliceH = Math.random() * 35 + 8
          const shift = (Math.random() - 0.5) * 22

          // Base draw
          ctx.drawImage(
            img,
            0, 0, img.naturalWidth, img.naturalHeight,
            drawX, drawY, drawWidth, drawHeight
          )

          // Displaced slice with slight tint overlay
          const srcSliceY = ((sliceY - drawY) / drawHeight) * img.naturalHeight
          const srcSliceH = (sliceH / drawHeight) * img.naturalHeight

          if (srcSliceY >= 0 && srcSliceY + srcSliceH <= img.naturalHeight) {
            ctx.drawImage(
              img,
              0, srcSliceY, img.naturalWidth, srcSliceH,
              drawX + shift, sliceY, drawWidth, sliceH
            )
          }
        } else {
          ctx.drawImage(
            img,
            0, 0, img.naturalWidth, img.naturalHeight,
            drawX, drawY, drawWidth, drawHeight
          )
        }
      }

      ctx.restore()
      animationId = requestAnimationFrame(render)
    }

    img.onload = () => {
      render()
    }

    const onEnter = () => { isHovered = true }
    const onLeave = () => { isHovered = false }

    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.85))' }}
      />
    </div>
  )
}
