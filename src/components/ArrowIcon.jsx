import React from 'react'

function SvgArrow({ className = '' }) {
  return (
    <svg
      viewBox="0 0 7.58205 7.58211"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0.707107 6.875L7.08211 0.5L6.93071 0.651425"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M3.58205 0.5H7.08205V4"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  )
}

export default function ArrowIcon({ className = '' }) {
  return (
    <span className={`relative inline-block h-[0.5rem] w-[0.5rem] shrink-0 overflow-hidden ${className}`}>
      <SvgArrow className="absolute inset-0 h-full w-full transition-transform duration-300 ease-out group-hover:translate-x-[100%] group-hover:-translate-y-[100%]" />
      <SvgArrow className="absolute inset-0 h-full w-full -translate-x-[100%] translate-y-[100%] transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0" />
    </span>
  )
}
