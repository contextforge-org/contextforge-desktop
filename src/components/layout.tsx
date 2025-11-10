import React from "react"
import { Navbar } from "./navbar"

export const Layout: React.FC<React.PropsWithChildren> = ({children}) => {
  return <>
    <Navbar />
    {children}
  </>
} 