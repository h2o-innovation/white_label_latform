import { useMemo, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import { useClientsStore } from '../infrastructure/clientsStore'
import { deleteClient } from '../application/deleteClient'
import type { ClientEntry } from '../domain/types'
import { useModalStore } from '../../../shared/stores/modalStore'
import { ClientFormModal } from './ClientFormModal'

const typeLabels: Record<ClientEntry['tipoCadastro'], string> = { pessoaFisica: 'Pessoa Física', pessoaJuridica: 'Pessoa Jurídica' }
const segmentLabels: Record<ClientEntry['segmentacao'], string> = { vendaDireta: 'Venda direta', cooperativa: 'Cooperativa', revenda: 'Revenda' }
const clientLabels: Record<ClientEntry['tipoCliente'], string> = { cooperativa: 'Cooperativa', revenda: 'Revenda', produtorRural: 'Produtor rural', empresaAgropecuaria: 'Empresa agropecuária', usina: 'Usina' }

export function ClientsPage() {
  const clients = useClientsStore((state) => state.clients)
  const removeClient = useClientsStore((state) => state.removeClient)
  const openModal = useModalStore((state) => state.openModal)
  const [editTarget, setEditTarget] = useState<ClientEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientEntry | null>(null)
  const columns = useMemo<MRT_ColumnDef<ClientEntry>[]>(() => [
    { accessorKey: 'tipoCadastro', header: 'Tipo', Cell: ({ cell }) => typeLabels[cell.getValue<ClientEntry['tipoCadastro']>()] },
    { id: 'document', header: 'CPF/CNPJ', accessorFn: (row) => row.tipoCadastro === 'pessoaFisica' ? row.cpf : row.cnpj },
    { id: 'name', header: 'Nome/Razão Social', accessorFn: (row) => row.tipoCadastro === 'pessoaFisica' ? row.nomeCompleto : row.razaoSocial },
    { accessorKey: 'segmentacao', header: 'Segmentação', Cell: ({ cell }) => segmentLabels[cell.getValue<ClientEntry['segmentacao']>()] },
    { accessorKey: 'tipoCliente', header: 'Tipo cliente', Cell: ({ cell }) => clientLabels[cell.getValue<ClientEntry['tipoCliente']>()] },
    { accessorKey: 'createdAt', header: 'Data criação', Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString('pt-BR') },
  ], [])

  const startCreate = () => { setEditTarget(null); openModal() }
  const closeForm = () => setEditTarget(null)

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><BoxIntro count={clients.length} /><Button variant="contained" sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={startCreate}>Novo cadastro</Button></Stack>
      {clients.length === 0 && <Alert severity="info">Nenhum cadastro encontrado. Use “Novo Cadastro” para adicionar o primeiro cliente.</Alert>}
      <Paper sx={{ overflow: 'hidden' }}>
        <MaterialReactTable
          columns={columns}
          data={clients}
          enableColumnFilters
          enableRowActions
          positionActionsColumn="last"
          getRowId={(row) => row.id}
          renderRowActions={({ row }) => <Stack direction="row"><Button size="small" aria-label="Editar" onClick={() => { setEditTarget(row.original); openModal() }}><EditOutlined /></Button><Button color="error" size="small" aria-label="Excluir" onClick={() => setDeleteTarget(row.original)}><DeleteOutline /></Button></Stack>}
          muiTablePaperProps={{ elevation: 0 }}
          muiTableContainerProps={{ sx: { maxHeight: 560 } }}
        />
      </Paper>
      <ClientFormModal editTarget={editTarget} onClosed={closeForm} />
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle>Excluir cadastro?</DialogTitle>
        <DialogContent>Essa ação removerá o cadastro localmente e não pode ser desfeita.</DialogContent>
        <DialogActions><Button onClick={() => setDeleteTarget(null)}>Cancelar</Button><Button color="error" variant="contained" onClick={() => { if (deleteTarget) deleteClient(removeClient, deleteTarget.id); setDeleteTarget(null) }}>Excluir</Button></DialogActions>
      </Dialog>
    </Stack>
  )
}

function BoxIntro({ count }: { count: number }) {
  return <div><Typography variant="h4">Cadastros</Typography><Typography color="text.secondary">{count} {count === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}</Typography></div>
}
