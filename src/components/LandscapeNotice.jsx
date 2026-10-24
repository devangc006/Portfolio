import React from 'react'

export default function LandscapeNotice() {
  return (
    <div className="landscape-block" aria-hidden="true">
      <p className="landscape-block-title">
        This website doesn’t support mobile landscape view
      </p>
      <p className="landscape-block-hint">
        Please rotate your device
        <svg
          className="landscape-block-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9.18506 1.74805L2.8186 1.74839V6.74805"
            stroke="currentColor"
            strokeMiterlimit="10"
          />
          <path
            d="M2.8186 10.252L9.18506 10.2516V5.2477"
            stroke="currentColor"
            strokeMiterlimit="10"
          />
          <path
            d="M4.3186 5.24805L2.8186 6.74805L1.3186 5.24805"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeLinecap="square"
          />
          <path
            d="M10.6814 6.74805L9.1814 5.24805L7.6814 6.74805"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeLinecap="square"
          />
        </svg>
      </p>
    </div>
  )
}
