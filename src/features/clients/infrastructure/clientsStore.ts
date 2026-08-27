import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClientEntry, ClientFormData } from '../domain/types'

interface ClientsStore {
  clients: ClientEntry[]
  addClient: (entry: ClientEntry) => void
  updateClient: (id: string, data: Partial<ClientFormData>) => void
  removeClient: (id: string) => void
  clearAll: () => void
}

export const useClientsStore = create<ClientsStore>()(persist((set) => ({
  clients: [],
  addClient: (entry) => set((state) => ({ clients: [...state.clients, entry] })),
  updateClient: (id, data) => set((state) => ({ clients: state.clients.map((client) => client.id === id ? { ...client, ...data } : client) })),
  removeClient: (id) => set((state) => ({ clients: state.clients.filter((client) => client.id !== id) })),
  clearAll: () => set({ clients: [] }),
}), { name: 'cadastro-local-clients' }))
