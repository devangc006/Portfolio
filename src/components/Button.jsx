import React from 'react'

export default function Button({
  children,
  className = '',
  onClick,
  tone = 'dark',
  href,
  target,
  rel,
  download,
  trailing,
  type = 'button',
}) {
  const isGreen = tone === 'on-green'

  const content = (
    <>
      {/* Background layer */}
      <span
        className={`pointer-events-none absolute inset-0 border-[0.5px] border-solid transition-colors duration-200 ease-out ${
          isGreen
            ? 'border-[#6fac22] bg-[#b0ff4d] group-hover:bg-[#9df133]'
            : 'border-[var(--background-stroke-1)] bg-[var(--background-bg-1)] group-hover:border-[var(--primary-green-neon)] group-hover:bg-[var(--background-bg-2)]'
        }`}
      />

      {/* Button text / children */}
      <span
        className={`relative z-10 flex items-center justify-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.0975rem] transition-colors duration-200 ease-out ${
          isGreen
            ? 'text-[var(--text-black)]'
            : 'text-[var(--text-white)] group-hover:text-[var(--primary-green-neon)]'
        }`}
      >
        <span>{children}</span>
        {trailing && <span className="inline-block shrink-0">{trailing}</span>}
      </span>

      {/* 4 Corner notches */}
      <span className="pointer-events-none absolute inset-0 text-[var(--accent-notch)]">
        <svg
          className="absolute top-0 left-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
          width="5"
          height="5"
          viewBox="0 0 5 5"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 0V1H1V5H0V0H5Z" fill="currentColor" />
        </svg>
        <svg
          className="absolute top-0 right-0 rotate-90 transition-transform duration-200 ease-out group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
          width="5"
          height="5"
          viewBox="0 0 5 5"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 0V1H1V5H0V0H5Z" fill="currentColor" />
        </svg>
        <svg
          className="absolute bottom-0 right-0 rotate-180 transition-transform duration-200 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
          width="5"
          height="5"
          viewBox="0 0 5 5"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 0V1H1V5H0V0H5Z" fill="currentColor" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 -rotate-90 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          width="5"
          height="5"
          viewBox="0 0 5 5"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 0V1H1V5H0V0H5Z" fill="currentColor" />
        </svg>
      </span>
    </>
  )

  const commonClasses = `group relative inline-flex items-center justify-center px-4 py-2 cursor-pointer select-none transition-all duration-200 ${className}`

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        download={download}
        onClick={onClick}
        className={commonClasses}
        data-sfx="true"
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={commonClasses}
      data-sfx="true"
    >
      {content}
    </button>
  )
}
