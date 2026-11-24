import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const SoundContext = createContext({
  enabled: true,
  toggle: () => {},
})

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true)
  const audioRefs = useRef({
    hoverPool: [],
    hoverIndex: 0,
    clickPool: [],
    clickIndex: 0,
    initialized: false,
  })

  // Initialize audio elements
  const initAudio = useCallback(() => {
    if (audioRefs.current.initialized) return

    try {
      // Pool for rapid hover sounds
      audioRefs.current.hoverPool = Array.from({ length: 4 }, () => {
        const a = new Audio('/sound/sound-hover.wav')
        a.volume = 0.4
        a.preload = 'auto'
        return a
      })

      // Pool for click sounds
      audioRefs.current.clickPool = Array.from({ length: 4 }, () => {
        const a = new Audio('/sound/sound-click.wav')
        a.volume = 0.5
        a.preload = 'auto'
        return a
      })

      audioRefs.current.initialized = true
    } catch (e) {
      console.warn('Audio init error:', e)
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (!audioRefs.current.initialized) {
        initAudio()
      }
      return next
    })
  }, [initAudio])

  const playHover = useCallback(() => {
    if (!enabled || !audioRefs.current.initialized) return
    const pool = audioRefs.current.hoverPool
    if (!pool.length) return
    const audio = pool[audioRefs.current.hoverIndex]
    audioRefs.current.hoverIndex = (audioRefs.current.hoverIndex + 1) % pool.length
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [enabled])

  const playClick = useCallback(() => {
    if (!enabled || !audioRefs.current.initialized) return
    const pool = audioRefs.current.clickPool
    if (!pool.length) return
    const audio = pool[audioRefs.current.clickIndex]
    audioRefs.current.clickIndex = (audioRefs.current.clickIndex + 1) % pool.length
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [enabled])

  // Attach global click & hover listeners for elements with data-sfx, buttons, and links
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio()
      window.removeEventListener('pointerdown', handleFirstInteraction)
    }
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true })

    const handlePointerOver = (e) => {
      const target = e.target.closest('a, button, [data-sfx], .work-card, .worked-at-row')
      if (target) {
        playHover()
      }
    }

    const handleClick = (e) => {
      const target = e.target.closest('a, button, [data-sfx], .work-card, .worked-at-row')
      if (target) {
        playClick()
      }
    }

    document.addEventListener('mouseover', handlePointerOver, { passive: true })
    document.addEventListener('click', handleClick, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      document.removeEventListener('mouseover', handlePointerOver)
      document.removeEventListener('click', handleClick)
    }
  }, [initAudio, playHover, playClick])

  return (
    <SoundContext.Provider value={{ enabled, toggle, playHover, playClick }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}
