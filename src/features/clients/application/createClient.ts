import type { ClientEntry, ClientFormData } from '../domain/types'

export const createClient = (addFn: (entry: ClientEntry) => void, data: ClientFormData): void => {
  addFn({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
}
