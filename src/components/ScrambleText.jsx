import React, { useState, useEffect, useRef, useCallback } from 'react'

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________'

export default function ScrambleText({
  text,
  as: Component = 'span',
  className = '',
  colors,
  scrambleOnHover = false,
  scrambleOnMount = false,
  duration = 400,
}) {
  const [displayText, setDisplayText] = useState(text)
  const isScrambling = useRef(false)
  const timerRef = useRef(null)

  const scramble = useCallback(() => {
    if (isScrambling.current) return
    isScrambling.current = true

    const length = text.length
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const revealedCount = Math.floor(progress * length)

      let result = ''
      for (let i = 0; i < length; i++) {
        if (text[i] === ' ') {
          result += ' '
        } else if (i < revealedCount) {
          result += text[i]
        } else {
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }
      }

      setDisplayText(result)

      if (progress < 1) {
        timerRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayText(text)
        isScrambling.current = false
      }
    }

    timerRef.current = requestAnimationFrame(animate)
  }, [text, duration])

  useEffect(() => {
    if (scrambleOnMount) {
      scramble()
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current)
    }
  }, [scramble, scrambleOnMount])

  return (
    <Component
      className={`inline-block ${className}`}
      onMouseEnter={scrambleOnHover ? scramble : undefined}
    >
      {displayText.split('').map((char, index) => {
        const colorStyle = colors && char !== text[index]
          ? { color: colors[index % colors.length] }
          : undefined
        return (
          <span
            key={index}
            className="inline-block"
            style={colorStyle}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </Component>
  )
}
