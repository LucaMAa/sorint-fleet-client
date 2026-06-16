import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import { Btn, Input, Select, PageLoader, Alert } from '../../components/ui'
import type { FormTemplate } from '../../api/form'
import './public-form.css'

type FieldValueMap = Record<string, string>

export function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [fields, setFields] = useState<any[]>([])
  const [values, setValues] = useState<FieldValueMap>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const res = await api.get<{ template: FormTemplate; fields: any[] }>(`/forms/${slug}`)
        setTemplate(res.template)
        setFields(res.fields)
        const initial: FieldValueMap = {}
        res.fields.forEach(field => {
          if (field.name === 'first_name' && user?.first_name) {
            initial[field.name] = user.first_name
          } else if (field.name === 'last_name' && user?.last_name) {
            initial[field.name] = user.last_name
          } else {
            initial[field.name] = ''
          }
        })
        setValues(initial)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!slug) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post(`/forms/${slug}/submissions`, {
        first_name: values.first_name || user?.first_name || '',
        last_name: values.last_name || user?.last_name || '',
        data: values,
      })
      setSuccess('Richiesta inviata con successo. Grazie.')
      setValues(Object.fromEntries(fields.map(field => [field.name, field.name === 'first_name' ? user?.first_name ?? '' : field.name === 'last_name' ? user?.last_name ?? '' : ''])))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!template) return <div className="page-fade"><Alert type="error">Form non trovato o inattivo.</Alert></div>

  return (
    <div className="page-fade public-form-page">
      <div className="page-hd">
        <div>
          <h1>{template.name}</h1>
          <p>{template.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="public-form-grid">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {fields.map(field => {
          const value = values[field.name] ?? ''
          if (field.type === 'select' || field.type === 'radio') {
            return (
              <Select
                key={field.name}
                label={field.label}
                value={value}
                required={field.required}
                onChange={e => handleChange(field.name, e.target.value)}
              >
                <option value="">Seleziona...</option>
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            )
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="field">
                <label className="field-label">{field.label}</label>
                <textarea
                  className="field-input"
                  required={field.required}
                  placeholder={field.placeholder ?? ''}
                  value={value}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              </div>
            )
          }
          return (
            <Input
              key={field.name}
              label={field.label}
              placeholder={field.placeholder ?? ''}
              required={field.required}
              value={value}
              type={field.type === 'email' ? 'email' : 'text'}
              onChange={e => handleChange(field.name, e.target.value)}
            />
          )
        })}

        <Btn type="submit" loading={submitting}>Invia richiesta</Btn>
      </form>
    </div>
  )
}
