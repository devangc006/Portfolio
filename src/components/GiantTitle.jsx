import React from 'react'

/**
 * GiantTitle / GiantNameTitle
 *
 * Renders the user's name or title in an ultra-bold, condensed/compressed
 * display sans-serif typeface with tall vertical stretch, tight tracking,
 * moody blood-red/crimson shading, and ambient red back-glow against a
 * pitch-black background.
 *
 * Configured by default to fill the top half of the screen with an extra tall vertical stretch.
 *
 * @param {Object} props
 * @param {string} [props.name="DEVANG"] - The name or title to display in all-caps.
 * @param {string} [props.subtitle] - Optional small sub-label or role tag.
 * @param {'linear' | 'radial'} [props.shading="linear"] - Gradient shading mode:
 *   - 'linear': Vertical gradient fading darker towards the bottom.
 *   - 'radial': Inner glow making the top and center pop while the edges and base stay deep & moody.
 * @param {number} [props.stretch=1.4] - Vertical stretch scale multiplier (default 1.4 for tall stretched letterforms).
 * @param {string} [props.tracking="tracking-[-0.055em]"] - Tight character spacing.
 * @param {string} [props.fontSize="text-[clamp(4.5rem,min(18vw,30vh),24rem)]"] - Dynamic responsive font size.
 * @param {'topHalf' | 'full' | 'auto'} [props.heightMode="topHalf"] - Height layout mode ('topHalf' fills top half of screen).
 * @param {string} [props.as="h1"] - Semantic HTML tag ('h1', 'h2', 'div', etc.).
 * @param {boolean} [props.ambientGlow=true] - Soft red atmospheric back-glow behind the text.
 * @param {string} [props.className=""] - Additional container classes.
 * @param {string} [props.textClassName=""] - Additional text classes.
 */
export function GiantTitle({
  name = 'DEVANG',
  subtitle,
  shading = 'linear',
  stretch = 1.4,
  tracking = 'tracking-[-0.055em]',
  fontSize = 'text-[clamp(4.5rem,min(18vw,30vh),24rem)]',
  heightMode = 'topHalf',
  as: Component = 'h1',
  ambientGlow = true,
  className = '',
  textClassName = '',
}) {
  // Linear gradient: luminous crimson highlight at top crest, rich blood-red body, fading darker to deep shadowy red at bottom
  // Radial gradient: luminous top/center highlight popping out, descending into deep moody crimson base
  const textGradientStyle =
    shading === 'radial'
      ? {
          backgroundImage:
            'radial-gradient(ellipse 95% 70% at 50% 25%, #FF3D3D 0%, #B91C1C 42%, #8B0000 78%, #2B0202 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }
      : {
          backgroundImage:
            'linear-gradient(180deg, #E62E2E 0%, #B91C1C 32%, #8B0000 68%, #320303 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }

  const heightClasses =
    heightMode === 'topHalf'
      ? 'min-h-[50vh] sm:min-h-[55vh] h-[50vh] sm:h-[55vh]'
      : heightMode === 'full'
        ? 'min-h-screen'
        : 'py-12 md:py-20'

  return (
    <div
      className={`relative w-full bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 md:px-12 select-none ${heightClasses} ${className}`}
    >
      {/* Pitch-black backdrop ambient glow layer */}
      {ambientGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 overflow-hidden"
        >
          {/* Broad subtle ambient atmosphere filling the top half */}
          <div className="w-[90%] max-w-7xl h-[70%] bg-[#B91C1C]/14 rounded-full blur-[100px] md:blur-[140px]" />
          {/* Core concentrated ambient glow behind center of text */}
          <div className="absolute w-[65%] max-w-4xl h-[45%] bg-[#8B0000]/28 rounded-full blur-[65px] md:blur-[95px]" />
          {/* Subtle radial vignette accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(185,28,28,0.06)_0%,transparent_75%)]" />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center overflow-visible">
        {/* Giant Stretched Display Name */}
        <Component
          className={`font-['Anton',Impact,'League_Gothic','Oswald',sans-serif] font-black uppercase whitespace-nowrap leading-[0.76] ${tracking} ${fontSize} drop-shadow-[0_0_35px_rgba(185,28,28,0.3)] filter overflow-visible ${textClassName}`}
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
          <p className="mt-6 md:mt-8 font-mono text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.35em] text-[#B91C1C]/80 uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default GiantTitle
