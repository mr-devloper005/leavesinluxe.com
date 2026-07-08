'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/*
  Wraps the page content so the premium "post open" entry animation
  (`.editable-enter`, defined in editable-global.css) replays on every
  navigation. Keying on the pathname remounts the region per route, which
  restarts the CSS animation. Server-rendered children pass straight through.
*/
export function EditablePageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="editable-enter min-h-0 flex-1">
      {children}
    </div>
  )
}
