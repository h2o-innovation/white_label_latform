# Plan: Cadastro Local — React + Vite + MUI

## Overview

Standalone React + Vite app that replicates the "novo cadastro" flow without any backend.
All data is stored locally via Zustand (persisted to `localStorage`).

Architecture: **Vertical Slice + Clean Architecture**.
Each feature is a self-contained slice that owns all layers from domain to UI.
No cross-feature imports except through `shared/`.

---

## Tech Stack

| Layer      | Library                                      |
| ---------- | -------------------------------------------- |
| Framework  | React 18 + Vite 5                            |
| UI         | Material UI (MUI) v5                         |
| Table      | Material React Table v2                      |
| State      | Zustand v4 + `persist` middleware            |
| Forms      | React Hook Form v7                           |
| Validation | Zod v3 + `@hookform/resolvers`               |
| Routing    | React Router DOM v6                          |
| Icons      | `@mui/icons-material` + Remix Icon (CSS CDN) |

---

## Architecture: Vertical Slice + Clean Architecture

Every feature lives in `src/features/<feature>/` and is divided into four internal layers.
Dependencies flow **inward only**: `presentation → application → domain`. Infrastructure only depends on domain.

```
domain          ← Pure business types and Zod schemas. No framework deps.
application     ← Use cases (pure functions). Orchestrates domain types. No React deps.
infrastructure  ← Zustand store. Adapts use cases to persistence. Depends on domain only.
presentation    ← React components + React Hook Form. Depends on application + infrastructure.
```

**Rules:**

- `domain/` imports nothing from the project — only Zod
- `application/` imports only from `domain/` and `shared/types`
- `infrastructure/` imports only from `domain/` and Zustand
- `presentation/` can import from all inner layers but never from another feature
- Cross-feature communication is only allowed through `shared/`
- No "God stores" — each feature owns its own store

---

## Project Folder Structure

```
cadastro-local/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── theme.ts
│   ├── router.tsx
│   │
│   ├── shared/                          # Truly shared primitives only
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx        # Sidebar + Outlet wrapper
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   └── types/
│   │       └── index.ts                 # Generic shared types (SelectOption, etc.)
│   │
│   └── features/
│       ├── clients/                     # ← Vertical slice — owns all 4 layers
│       │   ├── domain/
│       │   │   ├── clientSchema.ts      # Zod schema (pure, no framework deps)
│       │   │   └── types.ts             # ClientEntry, ClientFormData (from Zod infer)
│       │   ├── application/
│       │   │   ├── createClient.ts      # Use case: generates ID + timestamp, calls store
│       │   │   ├── updateClient.ts      # Use case: calls store.updateClient
│       │   │   └── deleteClient.ts      # Use case: calls store.removeClient
│       │   ├── infrastructure/
│       │   │   └── clientsStore.ts      # Zustand store with persist (localStorage)
│       │   └── presentation/
│       │       ├── ClientsPage.tsx      # List page + MRT table
│       │       ├── ClientFormModal.tsx  # Stepper dialog wrapper
│       │       └── steps/
│       │           ├── Step1BasicData.tsx
│       │           ├── Step2Location.tsx
│       │           ├── Step3Contacts.tsx
│       │           └── Step4Documents.tsx
│       │
│       └── settings/
│           └── presentation/
│               └── SettingsPage.tsx     # Placeholder + "clear all" action
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## package.json — Dependencies

```json
{
  "dependencies": {
    "@emotion/react": "^11",
    "@emotion/styled": "^11",
    "@hookform/resolvers": "^3",
    "@mui/icons-material": "^5",
    "@mui/material": "^5",
    "material-react-table": "^2",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7",
    "react-router-dom": "^6",
    "zod": "^3",
    "zustand": "^4"
  },
  "devDependencies": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^5"
  }
}
```

Remix Icon: add to `index.html`:

```html
<link
  href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css"
  rel="stylesheet"
/>
```

---

## Routes (`src/router.tsx`)

| Path        | Component             |
| ----------- | --------------------- |
| `/`         | redirect → `/clients` |
| `/clients`  | `ClientsPage`         |
| `/settings` | `SettingsPage`        |

---

## Shared Layout (`src/shared/components/layout/`)

### `AppLayout.tsx`

MUI `Box` flex row: `Sidebar` (fixed 240px) + main content area with `<Outlet />`.

### `Sidebar.tsx`

MUI permanent `Drawer` (240px). Two `ListItemButton` entries:

- "Clientes" → `/clients` (icon: `ri-team-line` or `<PeopleAlt />`)
- "Configurações" → `/settings` (icon: `ri-settings-3-line` or `<Settings />`)

Active route highlighted via `useLocation()`.

### `Header.tsx`

MUI `AppBar` + `Toolbar`:

- Left: dynamic page title based on current route
- Right: "Novo Cadastro" `<Button>` rendered only on `/clients`; calls a callback prop or triggers modal via `useClientsModalStore` (a tiny Zustand slice in `shared/` — see note below)

> **Note on Header ↔ ClientsPage communication:**
> The "Novo Cadastro" button in the Header needs to open the modal owned by `ClientsPage`.
> Recommended approach: a minimal `useModalStore` in `shared/` with `{ open: boolean, openModal: fn, closeModal: fn }`.
> Both `Header` and `ClientsPage` read from it. This avoids prop drilling across the layout boundary.

---

## Layer Details — `clients` Slice

### Domain (`features/clients/domain/`)

**`clientSchema.ts`** — Zod schema, no imports from outside `domain/`

Step 1 fields:

```
tipoCadastro: z.enum(["pessoaJuridica", "pessoaFisica"])
cnpj / cpf / dataNascimento / nomeCompleto / razaoSocial / nomeFantasia / cnaePrincipal
segmentacao: z.enum(["vendaDireta", "cooperativa", "revenda"])
tipoCliente: z.enum(["cooperativa","revenda","produtorRural","empresaAgropecuaria","usina"])
clienteDePool: z.boolean().default(false)
emiteReceitaAgronomica: z.boolean().default(false)
tipoCNPJ: z.enum(["matriz","filial"]).optional()
quantidadeFiliais / comprasTotais / comprasTotaisMoeda
atribuirCtc: z.string()           ← static select
gerenteDaConta / grupoComercial / observacoesGerais / dataInicioRelacao
```

Step 2 fields:

```
ufEstado / municipio / logradouro / receitaFederalStatus
inscricaoEstadual: z.array(z.string()).optional()
```

Step 3 fields:

```
digitalSignatureContact: z.object({ email, responsavel }).optional()
mainContactInfo: z.array(z.object({ telefone, email, responsavelContacto })).min(1)
```

Step 4 fields:

```
certificadoArmazenamento: z.string().optional()   ← filename only
contratoSocial: z.string().optional()             ← filename only
```

`superRefine` cross-field rules:

- PF: `cpf`, `nomeCompleto`, `dataNascimento`, `atribuirCtc` required
- PJ: `cnpj`, `razaoSocial`, `atribuirCtc`, `gerenteDaConta` required
- `mainContactInfo` must have at least one entry

**`types.ts`**

```ts
export type ClientFormData = z.infer<typeof clientSchema>;
export interface ClientEntry extends ClientFormData {
  id: string;
  createdAt: string;
}
```

---

### Application (`features/clients/application/`)

Pure functions — no React, no Zustand imports. Receive the store's action as a parameter so they remain testable in isolation.

**`createClient.ts`**

```ts
export const createClient = (
  addFn: (entry: ClientEntry) => void,
  data: ClientFormData,
): void => {
  addFn({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
};
```

**`updateClient.ts`**

```ts
export const updateClient = (
  updateFn: (id: string, data: Partial<ClientFormData>) => void,
  id: string,
  data: Partial<ClientFormData>,
): void => updateFn(id, data);
```

**`deleteClient.ts`**

```ts
export const deleteClient = (
  removeFn: (id: string) => void,
  id: string,
): void => removeFn(id);
```

---

### Infrastructure (`features/clients/infrastructure/`)

**`clientsStore.ts`** — Zustand store with `persist`

```ts
interface ClientsStore {
  clients: ClientEntry[];
  addClient: (entry: ClientEntry) => void;
  updateClient: (id: string, data: Partial<ClientFormData>) => void;
  removeClient: (id: string) => void;
  clearAll: () => void;
}
```

Persisted to `localStorage` key `"cadastro-local-clients"`.

---

### Presentation (`features/clients/presentation/`)

**`ClientsPage.tsx`**

- Reads `clients` from `useClientsStore()`
- Reads modal open state from `useModalStore()`
- Renders `<MaterialReactTable>` columns: Tipo, CPF/CNPJ, Nome/Razão Social, Segmentação, Tipo Cliente, Data Criação
- Row actions: Edit → set `editTarget` + `openModal()` | Delete → confirm dialog → `deleteClient(store.removeClient, id)`
- Renders `<ClientFormModal editTarget={...} />`

**`ClientFormModal.tsx`**

- MUI `<Dialog fullWidth maxWidth="md">`
- `useForm<ClientFormData>({ resolver: zodResolver(clientSchema), mode: "onChange" })`
- MUI `<Stepper>` with 4 steps; renders one `<Step_N>` component at a time
- "Next": calls `trigger(stepFields[currentStep])` before advancing
- "Save" (step 4): full `handleSubmit` → calls `createClient` or `updateClient` use case → `closeModal()` + MUI `Snackbar` success message
- PJ/PF toggle: MUI `ToggleButtonGroup`; switching type prompts MUI `<Dialog>` confirmation then calls `reset()`

**Step components** (`steps/Step1BasicData.tsx`, etc.)
Each step receives `control`, `register`, `errors`, `watch`, `setValue` as props and renders only its own fields using MUI `TextField`, `Select`, `Checkbox`, `RadioGroup`, `ToggleButtonGroup`.

Static CTC options in `Step1BasicData.tsx`:

```ts
const CTC_OPTIONS = [
  { value: "1", label: "CTC Demo — Carlos Silva" },
  { value: "2", label: "CTC Demo — Ana Souza" },
  { value: "3", label: "CTC Demo — João Mendes" },
  { value: "4", label: "CTC Demo — Maria Lima" },
  { value: "5", label: "CTC Demo — Pedro Costa" },
];
```

---

## Settings Page (`features/settings/presentation/SettingsPage.tsx`)

Placeholder page with a "Limpar todos os cadastros" danger `<Button>` that opens a MUI confirm `<Dialog>` → calls `useClientsStore().clearAll()`.

---

## Implementation Order (each step depends on the previous)

| #   | Step            | What to build                                                        |
| --- | --------------- | -------------------------------------------------------------------- |
| 1   | Scaffold        | `npm create vite@latest` + install all deps + Remix Icon CDN         |
| 2   | Theme           | `src/theme.ts` with green primary color                              |
| 3   | Router + Layout | `router.tsx`, `AppLayout`, `Sidebar`, `Header`                       |
| 4   | Domain          | `clientSchema.ts` + `types.ts`                                       |
| 5   | Application     | `createClient`, `updateClient`, `deleteClient` use cases             |
| 6   | Infrastructure  | `clientsStore.ts` + shared `useModalStore`                           |
| 7   | Form steps      | `Step1` through `Step4` components                                   |
| 8   | Modal           | `ClientFormModal.tsx` wiring all 4 steps + stepper logic             |
| 9   | List page       | `ClientsPage.tsx` with MRT table + row actions                       |
| 10  | Settings        | `SettingsPage.tsx`                                                   |
| 11  | Verify          | Manual end-to-end: create → list → edit → delete → refresh (persist) |

---

## Suggested branch

`feat/local-cadastro-vite`
