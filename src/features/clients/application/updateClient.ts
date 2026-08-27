import type { ClientFormData } from '../domain/types'

export const updateClient = (updateFn: (id: string, data: Partial<ClientFormData>) => void, id: string, data: Partial<ClientFormData>): void => updateFn(id, data)
