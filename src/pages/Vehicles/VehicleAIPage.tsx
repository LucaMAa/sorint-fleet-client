import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import { Btn, Empty, PageLoader, Select, Alert } from '../../components/ui'
import type { Vehicle } from '../../types'
import type { FormSubmission } from '../../api/form'
import { fetchFormSubmissions } from '../../api/form'
import './VehicleAIPage.css'

type VehicleRecommendation = Vehicle & {
  score?: number
  matches?: string[]
}

const formatText = (value: unknown) => (typeof value === 'string' ? value : '')

export function VehicleAIPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [carplay, setCarplay] = useState(false)
  const [parkingSensors, setParkingSensors] = useState(false)
  const [recommendations, setRecommendations] = useState<VehicleRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const params = new URLSearchParams({ limit: '20', offset: '0' })
        const res = await fetchFormSubmissions(params)
        setSubmissions(res.items ?? [])
      } catch (e) {
        setError((e as Error).message)
      }
    }
    loadRequests()
  }, [])

  const [currentStep, setCurrentStep] = useState(1)

  const selectedRequest = useMemo(
    () => submissions.find(item => item.id === selectedRequestId) ?? null,
    [selectedRequestId, submissions]
  )

  useEffect(() => {
    if (!selectedRequest) return
    const text = [
      formatText(selectedRequest.data.preferences),
      formatText(selectedRequest.data.notes),
      formatText(selectedRequest.data.car_type),
      formatText(selectedRequest.data.features),
    ]
      .filter(Boolean)
      .join(' ')

    if (text.trim()) {
      setQuery(text)
    }
  }, [selectedRequest])

  const buildSearchLabel = () => {
    if (selectedRequest) {
      return `Richiesta: ${selectedRequest.first_name} ${selectedRequest.last_name}`
    }
    return 'Ricerca personalizzata'
  }

  const steps = [
    { id: 1, title: 'Seleziona richiesta', description: 'Scegli una richiesta utente per iniziare.' },
    { id: 2, title: 'Definisci i criteri', description: 'Aggiungi parole chiave e filtri manuali.' },
    { id: 3, title: 'Genera proposte', description: 'Avvia la ricerca per vedere i veicoli consigliati.' },
  ]

  const activeStep = steps.find(step => step.id === currentStep) ?? steps[0]
  const canBack = currentStep > 1
  const canNext = currentStep < steps.length
  const goNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length))
  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleRecommend = async () => {
    setError('')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('query', query.trim())
      if (status) params.set('status', status)
      if (carplay) params.set('carplay', '1')
      if (parkingSensors) params.set('parking_sensors', '1')
      if (selectedRequestId) params.set('request_id', selectedRequestId)

      const res = await api.get<VehicleRecommendation[]>(`/vehicles/recommend?${params}`)
      setRecommendations(Array.isArray(res) ? res : [])
      if (!Array.isArray(res) || res.length === 0) {
        setError('Nessun veicolo consigliato con i criteri selezionati.')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-fade vehicle-ai-page">
      <div className="page-hd">
        <div>
          <h1>AI Assegnazioni</h1>
          <p>Trova i veicoli più adatti ai criteri di ricerca o alle richieste utente.</p>
        </div>
      </div>

      <div className="wizard-header">
        {steps.map(step => (
          <button
            key={step.id}
            type="button"
            className={`step-pill${currentStep === step.id ? ' active' : ''}`}
            onClick={() => setCurrentStep(step.id)}
          >
            <span className="step-index">{step.id}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="ai-grid">
        <div className="ai-panel">
          <div className="step-card">
            <div className="step-card-header">
              <div>
                <div className="step-label">Passo {activeStep.id} di {steps.length}</div>
                <h2>{activeStep.title}</h2>
                <p>{activeStep.description}</p>
              </div>
            </div>

            <div className="step-body">
              {currentStep === 1 && (
                <div className="step-section">
                  <Select
                    label="Richiesta utente"
                    value={selectedRequestId}
                    onChange={e => setSelectedRequestId(e.target.value)}
                  >
                    <option value="">Nessuna, ricerca libera</option>
                    {submissions.map(req => (
                      <option key={req.id} value={req.id}>
                        {req.first_name} {req.last_name} — {new Date(req.created_at).toLocaleDateString('it-IT')}
                      </option>
                    ))}
                  </Select>
                  {selectedRequest && (
                    <div className="ai-request-summary">
                      <strong>Richiesta selezionata</strong>
                      <p>{formatText(selectedRequest.data.preferences) || formatText(selectedRequest.data.notes) || 'Nessun dettaglio aggiuntivo.'}</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-section">
                  <div className="field">
                    <label className="field-label">Termini di ricerca</label>
                    <textarea
                      className="field-input"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Es. suv con carplay e sensori di parcheggio"
                    />
                  </div>
                  <div className="condition-row">
                    <Select label="Stato veicolo" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="">Qualsiasi</option>
                      <option value="available">Disponibile</option>
                      <option value="assigned">Assegnato</option>
                      <option value="maintenance">Manutenzione</option>
                    </Select>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={carplay} onChange={e => setCarplay(e.target.checked)} />
                      CarPlay
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={parkingSensors} onChange={e => setParkingSensors(e.target.checked)} />
                      Sensori parcheggio
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="step-section">
                  <div className="ai-action-card">
                    <div>
                      <h3>Genera proposte</h3>
                      <p>Premi il pulsante in basso per ricevere i veicoli più adatti alla richiesta.</p>
                    </div>
                    {error && <Alert type="error">{error}</Alert>}
                  </div>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button type="button" className="btn btn-ghost btn-back" onClick={goBack} disabled={!canBack}>Indietro</button>
              {canNext ? (
                <button type="button" className="btn btn-primary" onClick={goNext}>Avanti</button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleRecommend} disabled={loading}>Trova veicoli</button>
              )}
            </div>
          </div>
        </div>

        <div className="results-panel">
          <div className="ai-card">
            <div className="ai-card-header">
              <div>
                <h2>Risultati consigliati</h2>
                <p>{buildSearchLabel()}</p>
              </div>
            </div>
            {loading ? (
              <PageLoader />
            ) : !recommendations.length ? (
              <Empty icon="🔍" title="Nessuna proposta" sub="Avvia la ricerca per vedere i veicoli consigliati." />
            ) : (
              <div className="recommendation-list">
                {recommendations.map(vehicle => (
                  <div key={vehicle.id} className="recommendation-card">
                    <div className="recommendation-header">
                      <div>
                        <strong>{vehicle.brand} {vehicle.model}</strong>
                        <div className="recommendation-meta">
                          {vehicle.year} · {vehicle.license_plate}
                        </div>
                      </div>
                      {vehicle.score != null && (
                        <div className="recommendation-score">{vehicle.score.toFixed(1)}%</div>
                      )}
                    </div>
                    <div className="recommendation-row">
                      <span>Status</span>
                      <span>{vehicle.status}</span>
                    </div>
                    <div className="recommendation-row">
                      <span>Km</span>
                      <span>{vehicle.mileage?.toLocaleString() ?? '—'}</span>
                    </div>
                    {Array.isArray(vehicle.matches) && vehicle.matches.length > 0 && (
                      <div className="recommendation-tags">
                        {vehicle.matches.map(match => <span key={match}>{match}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
