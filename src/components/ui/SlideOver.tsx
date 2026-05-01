import { useEffect, type ReactNode } from 'react'
import './slideover.css'

interface Props {
  title: string
  sub?: string
  icon?: string
  onClose: () => void
  children: ReactNode
}

export function SlideOver({ title, sub, icon = '🚗', onClose, children }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      <div className="slideover-backdrop" onClick={onClose} />
      <aside className="slideover">
        <div className="so-header">
          <div className="so-icon">{icon}</div>
          <div className="so-titles">
            <div className="so-title">{title}</div>
            {sub && <div className="so-sub">{sub}</div>}
          </div>
          <button className="so-close" onClick={onClose}>✕</button>
        </div>
        <div className="so-body">{children}</div>
      </aside>
    </>
  )
}
