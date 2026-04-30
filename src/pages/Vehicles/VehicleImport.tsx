import { useRef, useState } from 'react'
import { Btn } from '../../components/ui'
import { useToast } from '../../components/ui/index'

export function VehicleImport() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const { success, error, info } = useToast()

  const upload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    info('Import in corso...')

    try {
      const res = await fetch('/api/v1/vehicles/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('fleet_token')}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error('Import fallito')

      const json = await res.json()

      success(`Import completato: ${json.data?.inserted ?? json.inserted ?? 0} veicoli`)
    } catch (e) {
      error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onFile = (file?: File) => {
    if (!file) return
    setFileName(file.name)
    upload(file)
  }

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0 }}>Import veicoli Excel</h3>

      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
        Carica un file Excel con colonne: targa, brand, model, year, km, ecc.
      </p>

      {/* DROP AREA */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
        style={{
          border: '1px dashed var(--border)',
          padding: 24,
          borderRadius: 12,
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--bg-2)',
        }}
      >
        {fileName ? (
          <strong>{fileName}</strong>
        ) : (
          <>
            <div style={{ fontSize: 18 }}>📄</div>
            <div>Drag & drop Excel oppure clicca per caricare</div>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
      />

      <Btn
        disabled={loading}
        onClick={() => fileRef.current?.click()}
      >
        {loading ? 'Import in corso...' : 'Carica Excel'}
      </Btn>
    </div>
  )
}
