import React, { createContext, useContext, useState, useCallback } from 'react'

const MenuContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export function MenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return (
    <MenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  return useContext(MenuContext)
}
