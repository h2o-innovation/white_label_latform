import { create } from 'zustand'

const uid = () => crypto.randomUUID()

export type ComponentType =
  | 'text' | 'number' | 'email' | 'phone' | 'date'
  | 'select' | 'multiselect' | 'image' | 'button'

export interface SelectOption { id: string; label: string; value: string }

export interface FormComponent {
  id: string
  type: ComponentType
  label: string
  placeholder: string
  required: boolean
  options: SelectOption[]
}

export interface FormColumn { id: string; component: FormComponent | null }
export interface FormRow { id: string; columns: FormColumn[] }
export interface FormStep { id: string; name: string; rows: FormRow[] }
export interface FlowEdge {
  id: string
  fromStepId: string
  toStepId: string
  condition?: { componentId: string; value: string }
}

export const defaultLabel: Record<ComponentType, string> = {
  text: 'Texto', number: 'Número', email: 'E-mail', phone: 'Telefone',
  date: 'Data', select: 'Seleção', multiselect: 'Multi-seleção',
  image: 'Imagem', button: 'Botão',
}

const makeColumn = (): FormColumn => ({ id: uid(), component: null })
const makeRow = (): FormRow => ({ id: uid(), columns: [makeColumn()] })
const makeStep = (name: string): FormStep => ({ id: uid(), name, rows: [makeRow()] })

interface FormBuilderStore {
  steps: FormStep[]
  activeStepId: string
  selectedComponentId: string | null
  edges: FlowEdge[]
  setActiveStep: (id: string) => void
  addStep: () => void
  renameStep: (id: string, name: string) => void
  addRow: (stepId: string) => void
  addColumn: (rowId: string) => void
  setComponent: (rowId: string, columnId: string, type: ComponentType) => void
  updateComponent: (id: string, patch: Partial<FormComponent>) => void
  removeComponent: (rowId: string, columnId: string) => void
  setSelectedComponent: (id: string | null) => void
  addEdge: (fromStepId: string, toStepId: string) => void
  updateEdge: (id: string, patch: Partial<Omit<FlowEdge, 'id'>>) => void
  removeEdge: (id: string) => void
}

export const useFormBuilderStore = create<FormBuilderStore>((set, get) => {
  const initial = makeStep('Passo 1')
  return {
    steps: [initial],
    activeStepId: initial.id,
    selectedComponentId: null,
    edges: [],

    setActiveStep: (id) => set({ activeStepId: id, selectedComponentId: null }),

    addStep: () => {
      const step = makeStep(`Passo ${get().steps.length + 1}`)
      set((s) => ({ steps: [...s.steps, step] }))
    },

    renameStep: (id, name) =>
      set((s) => ({ steps: s.steps.map((st) => st.id === id ? { ...st, name } : st) })),

    addRow: (stepId) =>
      set((s) => ({
        steps: s.steps.map((st) =>
          st.id === stepId ? { ...st, rows: [...st.rows, makeRow()] } : st
        ),
      })),

    addColumn: (rowId) =>
      set((s) => ({
        steps: s.steps.map((st) => ({
          ...st,
          rows: st.rows.map((r) =>
            r.id === rowId && r.columns.length < 3
              ? { ...r, columns: [...r.columns, makeColumn()] }
              : r
          ),
        })),
      })),

    setComponent: (rowId, columnId, type) => {
      const component: FormComponent = {
        id: uid(), type, label: defaultLabel[type], placeholder: '', required: false, options: [],
      }
      set((s) => ({
        steps: s.steps.map((st) => ({
          ...st,
          rows: st.rows.map((r) =>
            r.id === rowId
              ? { ...r, columns: r.columns.map((c) => c.id === columnId ? { ...c, component } : c) }
              : r
          ),
        })),
      }))
    },

    updateComponent: (id, patch) =>
      set((s) => ({
        steps: s.steps.map((st) => ({
          ...st,
          rows: st.rows.map((r) => ({
            ...r,
            columns: r.columns.map((c) =>
              c.component?.id === id ? { ...c, component: { ...c.component, ...patch } } : c
            ),
          })),
        })),
      })),

    removeComponent: (rowId, columnId) =>
      set((s) => ({
        steps: s.steps.map((st) => ({
          ...st,
          rows: st.rows.map((r) =>
            r.id === rowId
              ? { ...r, columns: r.columns.map((c) => c.id === columnId ? { ...c, component: null } : c) }
              : r
          ),
        })),
      })),

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    addEdge: (fromStepId, toStepId) =>
      set((s) => ({ edges: [...s.edges, { id: uid(), fromStepId, toStepId }] })),

    updateEdge: (id, patch) =>
      set((s) => ({ edges: s.edges.map((e) => e.id === id ? { ...e, ...patch } : e) })),

    removeEdge: (id) =>
      set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
  }
})
