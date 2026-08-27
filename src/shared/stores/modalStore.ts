import { create } from 'zustand'

interface ModalStore {
  open: boolean
  openModal: () => void
  closeModal: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}))
