import React, { createContext, useContext, useState } from 'react'

const SurfaceToneContext = createContext({
  surfaceTone: 'dark',
  setSurfaceTone: () => {},
})

export function SurfaceToneProvider({ children }) {
  const [surfaceTone, setSurfaceTone] = useState('dark')

  return (
    <SurfaceToneContext.Provider value={{ surfaceTone, setSurfaceTone }}>
      {children}
    </SurfaceToneContext.Provider>
  )
}

export function useSurfaceTone() {
  return useContext(SurfaceToneContext)
}
