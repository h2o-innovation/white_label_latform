import { z } from 'zod'
import { clientSchema } from './clientSchema'

export type ClientFormData = z.infer<typeof clientSchema>
export interface ClientEntry extends ClientFormData { id: string; createdAt: string }
