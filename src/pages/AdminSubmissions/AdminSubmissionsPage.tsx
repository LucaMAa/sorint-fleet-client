import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { Btn, PageLoader, Empty, Select } from '../../components/ui'
import { SlideOver } from '../../components/ui/SlideOver'
import type { FormSubmission } from '../../api/form'
import { fetchFormSubmission, updateFormSubmissionStatus } from '../../api/form'
import './admin-submissions.css'

const STATUSES = ['pending', 'approved', 'rejected'] as const

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await api.get<any>('/admin/form-submissions?limit=20')
      setSubmissions(res.items ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubmissions() }, [])

  const openDetails = async (submissionId: string) => {
    setDetailLoading(true)
    setError('')
    try {
      const detail = await fetchFormSubmission(submissionId)
      setActiveSubmission(detail)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetails = () => setActiveSubmission(null)

  const updateStatus = async (submissionId: string, status: FormSubmission['status']) => {
    try {
      const updated = await updateFormSubmissionStatus(submissionId, { status })
      setSubmissions(prev => prev.map(sub => sub.id === submissionId ? updated : sub))
      if (activeSubmission?.id === submissionId) setActiveSubmission(updated)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const renderSubmissionData = (submission: FormSubmission) => {
    const values = submission.data || {}
    const labels = submission.form_template?.fields?.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = field.label
      return acc
    }, {}) ?? {}

    return Object.entries(values).map(([key, value]) => (
      <div key={key} className="detail-row">
        <div className="detail-key">{labels[key] ?? key}</div>
        <div className="detail-value">{String(value)}</div>
      </div>
    ))
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-fade admin-submissions-page">
      <div className="page-hd">
        <div>
          <h1>Richieste Cambio Auto</h1>
          <p>Lista delle richieste pubbliche da valutare</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {submissions.length === 0 ? (
        <Empty icon="📭" title="Nessuna richiesta" sub="Le nuove richieste appariranno qui." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Form</th>
                <th>Stato</th>
                <th>Data</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.first_name} {sub.last_name}</td>
                  <td>{sub.form_template?.name ?? sub.form_template_id}</td>
                  <td>
                    <Select
                      value={sub.status}
                      onChange={e => updateStatus(sub.id, e.target.value as FormSubmission['status'])}
                      onClick={e => e.stopPropagation()}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </td>
                  <td>{new Date(sub.created_at).toLocaleString('it-IT')}</td>
                  <td>
                    <Btn variant="ghost" size="sm" onClick={() => openDetails(sub.id)}>
                      Dettagli
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubmission && (
        <SlideOver
          title={`${activeSubmission.first_name} ${activeSubmission.last_name}`}
          sub={activeSubmission.form_template?.name ?? 'Richiesta cambio auto'}
          onClose={closeDetails}
          icon="📝"
        >
          <div className="detail-section">
            <div className="detail-meta">
              <div><strong>Stato:</strong> {activeSubmission.status}</div>
              <div><strong>Ricevuto:</strong> {new Date(activeSubmission.created_at).toLocaleString('it-IT')}</div>
            </div>
            <div className="detail-fields">
              <h3>Dettagli richiesta</h3>
              {detailLoading ? <PageLoader /> : renderSubmissionData(activeSubmission)}
            </div>
            {activeSubmission.form_template && (
              <div className="detail-template">
                <h4>Template</h4>
                <div>{activeSubmission.form_template.name}</div>
              </div>
            )}
          </div>
        </SlideOver>
      )}
    </div>
  )
}
