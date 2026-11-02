import React from 'react'

/**
 * GiantTitle / GiantNameTitle
 *
 * Renders the user's name or title in an ultra-bold, condensed/compressed
 * display sans-serif typeface with tall vertical stretch, tight tracking,
 * moody blood-red/crimson shading, and ambient red back-glow against a
 * pitch-black background.
 *
 * @param {Object} props
 * @param {string} [props.name="DEVANG"] - The name or title to display in all-caps.
 * @param {string} [props.subtitle] - Optional small sub-label or role tag.
 * @param {'linear' | 'radial'} [props.shading="linear"] - Gradient shading mode:
 *   - 'linear': Vertical gradient fading darker towards the bottom.
 *   - 'radial': Inner glow making the top and center pop while the edges and base stay deep & moody.
 * @param {number} [props.stretch=1.2] - Vertical stretch scale multiplier (default 1.2 = tall condensed letterforms).
 * @param {string} [props.tracking="tracking-[-0.045em]"] - Character spacing (tight/tighter).
 * @param {string} [props.fontSize="text-[clamp(3.5rem,13.5vw,17rem)]"] - Dynamic responsive font size.
 * @param {string} [props.as="h1"] - Semantic HTML tag ('h1', 'h2', 'div', etc.).
 * @param {boolean} [props.ambientGlow=true] - Soft red atmospheric back-glow behind the text.
 * @param {boolean} [props.fullScreen=true] - Whether container fills minimum screen height (min-h-screen).
 * @param {string} [props.className=""] - Additional container classes.
 * @param {string} [props.textClassName=""] - Additional text classes.
 */
export function GiantTitle({
  name = 'DEVANG',
  subtitle,
  shading = 'linear',
  stretch = 1.2,
  tracking = 'tracking-[-0.045em]',
  fontSize = 'text-[clamp(3.5rem,13.5vw,17rem)]',
  as: Component = 'h1',
  ambientGlow = true,
  fullScreen = true,
  className = '',
  textClassName = '',
}) {
  // Linear gradient: luminous crimson at top, blood-red body, fading darker to deep shadowy red at bottom
  // Radial gradient: luminous top/center highlight popping out, descending into deep moody crimson base
  const textGradientStyle =
    shading === 'radial'
      ? {
          backgroundImage:
            'radial-gradient(ellipse 95% 70% at 50% 25%, #FF3D3D 0%, #B91C1C 42%, #8B0000 78%, #2D0303 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }
      : {
          backgroundImage:
            'linear-gradient(180deg, #E52E2E 0%, #B91C1C 35%, #8B0000 68%, #360404 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }

  return (
    <section
      className={`relative w-full bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 md:px-12 select-none ${
        fullScreen ? 'min-h-screen' : 'py-16 md:py-24'
      } ${className}`}
    >
      {/* Pitch-black backdrop ambient glow layer */}
      {ambientGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 overflow-hidden"
        >
          {/* Broad subtle ambient atmosphere */}
          <div className="w-[85%] max-w-6xl h-48 sm:h-64 md:h-80 bg-[#B91C1C]/12 rounded-full blur-[90px] md:blur-[140px]" />
          {/* Core concentrated ambient glow behind center of text */}
          <div className="absolute w-[60%] max-w-3xl h-28 sm:h-36 bg-[#8B0000]/25 rounded-full blur-[60px] md:blur-[90px]" />
          {/* Subtle radial vignette accent */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,28,28,0.05)_0%,transparent_75%)]" />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center">
        {/* Giant Display Name */}
        <Component
          className={`font-['Anton',Impact,'League_Gothic','Oswald',sans-serif] font-black uppercase whitespace-nowrap leading-[0.82] ${tracking} ${fontSize} drop-shadow-[0_0_35px_rgba(185,28,28,0.3)] filter ${textClassName}`}
        >
          <span
            className="inline-block transform origin-center transition-transform duration-300"
            style={{
              ...textGradientStyle,
              transform: `scaleY(${stretch})`,
            }}
          >
            {name}
          </span>
        </Component>

        {/* Optional Editorial Subtitle / Tagline */}
        {subtitle && (
          <p className="mt-8 md:mt-10 font-mono text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.35em] text-[#B91C1C]/80 uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

export default GiantTitle
