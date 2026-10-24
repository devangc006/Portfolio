import React from 'react'

export default function SharedGridLines({ hide = [], fade = [], variant = 'solid' }) {
  return (
    <div
      className={`shared-grid-lines pointer-events-none absolute inset-0 ${
        variant === 'gradient' ? 'shared-grid-lines-gradient' : ''
      }`}
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div
          key={num}
          className={`shared-v-line ${fade.includes(num) ? 'shared-v-line--fade' : ''}`}
          style={hide.includes(num) ? { display: 'none' } : undefined}
        />
      ))}
    </div>
  )
}
