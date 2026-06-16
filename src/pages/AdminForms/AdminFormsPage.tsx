import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { Btn, Input, Modal, PageLoader, Empty, Select } from '../../components/ui'
import type { FormField, FormTemplate } from '../../api/form'
import './admin-forms.css'

const DEFAULT_FIELDS: FormField[] = [
  { name: 'first_name', label: 'Nome', type: 'text', required: true, placeholder: 'Inserisci il nome' },
  { name: 'last_name', label: 'Cognome', type: 'text', required: true, placeholder: 'Inserisci il cognome' },
  { name: 'preferences', label: 'Preferenze sul nuovo veicolo', type: 'textarea', required: false, placeholder: 'Descrivi le preferenze' },
  { name: 'notes', label: 'Note libere', type: 'textarea', required: false, placeholder: 'Aggiungi eventuali note' },
]

type EditableField = FormField & { optionsText: string }

function toEditableField(field: FormField): EditableField {
  return {
    ...field,
    optionsText: field.options?.join(', ') ?? '',
  }
}

function toApiField(field: EditableField): FormField {
  return {
    name: field.name.trim(),
    label: field.label.trim(),
    type: field.type,
    required: field.required,
    placeholder: field.placeholder?.trim() || undefined,
    options: ['select', 'radio'].includes(field.type)
      ? field.optionsText.split(',').map((o: string) => o.trim()).filter(Boolean)
      : undefined,
  }
}

export function AdminFormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FormTemplate | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [fields, setFields] = useState<EditableField[]>(DEFAULT_FIELDS.map(toEditableField))
  const [error, setError] = useState('')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await api.get<FormTemplate[]>('/admin/forms')
      setTemplates(res)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const resetEditor = () => {
    setEditing(null)
    setName('')
    setSlug('')
    setDescription('')
    setActive(true)
    setFields(DEFAULT_FIELDS.map(toEditableField))
    setError('')
  }

  const openNew = () => {
    resetEditor()
    setShowModal(true)
  }

  const openEdit = (template: FormTemplate) => {
    setEditing(template)
    setName(template.name)
    setSlug(template.slug)
    setDescription(template.description ?? '')
    setActive(template.active)
    setFields((template.fields && template.fields.length > 0)
      ? template.fields.map(toEditableField)
      : DEFAULT_FIELDS.map(toEditableField))
    setError('')
    setShowModal(true)
  }

  const addField = () => {
    setFields(prev => [...prev, {
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      optionsText: '',
    }])
  }

  const updateField = (index: number, field: Partial<EditableField>) => {
    setFields(prev => prev.map((item, i) => i === index ? { ...item, ...field } : item))
  }

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!name.trim()) {
      setError('Nome form obbligatorio')
      return
    }
    if (fields.some(field => !field.name.trim() || !field.label.trim())) {
      setError('Ogni campo deve avere nome e label')
      return
    }
    setError('')

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      active,
      fields: fields.map(toApiField),
    }

    try {
      if (editing) {
        await api.patch<FormTemplate>(`/admin/forms/${editing.id}`, payload)
      } else {
        await api.post<FormTemplate>('/admin/forms', payload)
      }
      setShowModal(false)
      await fetchTemplates()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const remove = async (template: FormTemplate) => {
    if (!confirm(`Eliminare il form ${template.name}?`)) return
    try {
      await api.delete(`/admin/forms/${template.id}`)
      await fetchTemplates()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const publicLink = slug.trim()
    ? `${window.location.origin}/form/${slug.trim()}`
    : `${window.location.origin}/form/<slug>`

  if (loading) return <PageLoader />

  return (
    <div className="page-fade admin-forms-page">
      <div className="page-hd">
        <div>
          <h1>Form Cambio Auto</h1>
          <p>Gestisci i modelli di form pubblici personalizzabili da admin.</p>
        </div>
        <Btn onClick={openNew}>Nuovo form</Btn>
      </div>

      {templates.length === 0 ? (
        <Empty icon="📝" title="Nessun form" sub="Crea un form per raccogliere le richieste di cambio auto." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Link pubblico</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td><code>{template.slug || '—'}</code></td>
                  <td>
                    {template.slug ? (
                      <a href={`/form/${template.slug}`} target="_blank" rel="noreferrer">{`/form/${template.slug}`}</a>
                    ) : '—'}
                  </td>
                  <td>{template.active ? 'Attivo' : 'Inattivo'}</td>
                  <td>
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(template)}>Modifica</Btn>
                    <Btn variant="danger" size="sm" onClick={() => remove(template)}>Elimina</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Modifica form' : 'Nuovo form'}
          onClose={() => setShowModal(false)}
          footer={(
            <>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Annulla</Btn>
              <Btn onClick={save}>{editing ? 'Salva' : 'Crea'}</Btn>
            </>
          )}
        >
          {error && <div className="alert alert-error">{error}</div>}

          <div className="admin-form-main">
            <div className="admin-form-meta">
              <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="lascia vuoto per auto" />
              <Input label="Descrizione" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="field">
                <label className="field-label">Attivo</label>
                <label className="checkbox-inline">
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                  Abilitato
                </label>
              </div>
            </div>

            <div className="public-link-box">
              <span>Link pubblico:</span>
              <code>{publicLink}</code>
            </div>

            <div className="fields-editor">
              <div className="fields-header">
                <h2>Campi del form</h2>
                <Btn variant="ghost" size="sm" onClick={addField}>Aggiungi campo</Btn>
              </div>

              {fields.map((field, index) => (
                <div key={`${field.name}-${index}`} className="field-card">
                  <div className="field-row">
                    <Input
                      label="Nome campo"
                      value={field.name}
                      onChange={e => updateField(index, { name: e.target.value })}
                      placeholder="es. telefono"
                    />
                    <Input
                      label="Label"
                      value={field.label}
                      onChange={e => updateField(index, { label: e.target.value })}
                      placeholder="es. Telefono"
                    />
                    <Select
                      label="Tipo"
                      value={field.type}
                      onChange={e => updateField(index, { type: e.target.value })}
                    >
                      <option value="text">Testo</option>
                      <option value="textarea">Area di testo</option>
                      <option value="select">Seleziona</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                    </Select>
                  </div>

                  <div className="field-row">
                    <Input
                      label="Placeholder"
                      value={field.placeholder || ''}
                      onChange={e => updateField(index, { placeholder: e.target.value })}
                    />
                    <div className="field">
                      <label className="field-label">Obbligatorio?</label>
                      <label className="checkbox-inline">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => updateField(index, { required: e.target.checked })}
                        />
                        Sì
                      </label>
                    </div>
                    <div className="field-remove">
                      <Btn variant="danger" size="sm" onClick={() => removeField(index)}>Rimuovi</Btn>
                    </div>
                  </div>

                  {['select', 'radio'].includes(field.type) && (
                    <Input
                      label="Opzioni"
                      value={field.optionsText}
                      onChange={e => updateField(index, { optionsText: e.target.value })}
                      placeholder="Separale con una virgola: A,B,C"
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="form-help-text">
              I campi del form vengono restituiti all'admin al momento dell'invio. Chiunque abbia il link può compilare il form pubblico.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
