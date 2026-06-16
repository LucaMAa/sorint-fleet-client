import { api } from './client'

export type FormField = {
  name: string
  label: string
  type: string
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface FormTemplate {
  id: string
  slug: string
  name: string
  description?: string
  active: boolean
  fields: FormField[]
  created_at: string
  updated_at: string
}

export interface FormSubmission {
  id: string
  form_template_id: string
  first_name: string
  last_name: string
  data: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
  form_template?: FormTemplate
}

export function fetchFormTemplate(slug: string) {
  return api.get<{ template: FormTemplate; fields: FormField[] }>(`/forms/${slug}`)
}

export function submitPublicForm(slug: string, payload: unknown) {
  return api.post<FormSubmission>(`/forms/${slug}/submissions`, payload)
}

export function fetchFormTemplates() {
  return api.get<FormTemplate[]>('/admin/forms')
}

export function createFormTemplate(body: unknown) {
  return api.post<FormTemplate>('/admin/forms', body)
}

export function updateFormTemplate(id: string, body: unknown) {
  return api.patch<FormTemplate>(`/admin/forms/${id}`, body)
}

export function deleteFormTemplate(id: string) {
  return api.delete(`/admin/forms/${id}`)
}

export function fetchFormSubmissions(params: URLSearchParams) {
  return api.get<{ items: FormSubmission[]; total: number; limit: number; offset: number }>(
    `/admin/form-submissions?${params}`
  )
}

export function fetchFormSubmission(id: string) {
  return api.get<FormSubmission>(`/admin/form-submissions/${id}`)
}

export function updateFormSubmissionStatus(id: string, body: unknown) {
  return api.patch<FormSubmission>(`/admin/form-submissions/${id}/status`, body)
}
