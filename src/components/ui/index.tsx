import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import './ui.css'

// ---- BUTTON ----
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'icon'
  loading?: boolean
}
export function Btn({ variant = 'primary', size, loading, children, className = '', ...p }: BtnProps) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, className].filter(Boolean).join(' ')
  return <button className={cls} disabled={loading || p.disabled} {...p}>{loading ? <span className="spinner" /> : children}</button>
}

// ---- INPUT ----
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }
export function Input({ label, error, className = '', ...p }: InputProps) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input${error ? ' error' : ''} ${className}`} {...p} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

// ---- SELECT ----
interface SelProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string }
export function Select({ label, error, children, className = '', ...p }: SelProps) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className={`field-input${error ? ' error' : ''} ${className}`} {...p}>{children}</select>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

// ---- MODAL ----
interface ModalProps { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }
export function Modal({ title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ---- ALERT ----
export function Alert({ type = 'error', children }: { type?: 'error' | 'success'; children: ReactNode }) {
  if (!children) return null
  return <div className={`alert alert-${type}`}>{children}</div>
}

// ---- TOAST ----
interface Toast { id: number; msg: string; type: 'success' | 'error' | 'info' }
const ToastCtx = createContext<{ add: (msg: string, type?: Toast['type']) => void } | null>(null)
let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const add = useCallback((msg: string, type: Toast['type'] = 'info') => {
    const id = ++_id
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => { const c = useContext(ToastCtx); return { success: (m: string) => c?.add(m,'success'), error: (m: string) => c?.add(m,'error'), info: (m: string) => c?.add(m,'info') } }

// ---- BADGE ----
const VALID = ['available','assigned','maintenance','admin','driver']
export function Badge({ status }: { status: string }) {
  const s = VALID.includes(status) ? status : 'driver'
  const labels: Record<string, string> = { available: 'Disponibile', assigned: 'Assegnato', maintenance: 'Manutenzione', admin: 'Admin', driver: 'Driver' }
  return <span className={`badge badge-${s}`}>{labels[s] ?? status}</span>
}

// ---- SPINNER PAGE ----
export function PageLoader() {
  return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><span className="spinner" style={{ width:28, height:28 }} /></div>
}

// ---- EMPTY ----
export function Empty({ icon = '📭', title = 'Nessun dato', sub = '' }: { icon?: string; title?: string; sub?: string }) {
  return <div className="empty"><div className="empty-icon">{icon}</div><div className="empty-title">{title}</div>{sub && <div className="empty-sub">{sub}</div>}</div>
}
