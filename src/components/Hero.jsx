import React from 'react'
import GiantTitle from './GiantTitle'

export default function Hero() {
  return (
    <section className="home-hero relative w-full min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16">
      {/* Top half of the screen: Giant stretched display title */}
      <GiantTitle
        name="DEVANG"
        heightMode="topHalf"
        stretch={1.42}
      />
    </section>
  )
}
