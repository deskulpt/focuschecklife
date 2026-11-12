import type * as React from 'npm:react@18.3.1'
import { template as assessmentReminder } from './assessment-reminder.tsx'

export interface TemplateEntry {
  // deno-lint-ignore no-explicit-any
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, unknown>) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'assessment-reminder': assessmentReminder,
}
