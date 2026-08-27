import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material'
import DeleteSweepOutlined from '@mui/icons-material/DeleteSweepOutlined'
import { useClientsStore } from '../../clients/infrastructure/clientsStore'

export function SettingsPage() {
  const clearAll = useClientsStore((state) => state.clearAll)
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <Stack spacing={3}>
      <div><Typography variant="h4">Configurações</Typography><Typography color="text.secondary">Preferências e manutenção dos cadastros locais.</Typography></div>
      <Paper sx={{ p: 3, maxWidth: 680 }}>
        <Typography variant="h6" gutterBottom>Dados locais</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Os cadastros são armazenados neste navegador. Limpar os dados remove todos os registros persistidos.</Typography>
        <Button color="error" variant="outlined" startIcon={<DeleteSweepOutlined />} onClick={() => setConfirmOpen(true)}>Limpar todos os cadastros</Button>
      </Paper>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle>Limpar todos os cadastros?</DialogTitle>
        <DialogContent>Todos os clientes armazenados localmente serão removidos.</DialogContent>
        <DialogActions><Button onClick={() => setConfirmOpen(false)}>Cancelar</Button><Button color="error" variant="contained" onClick={() => { clearAll(); setConfirmOpen(false) }}>Limpar</Button></DialogActions>
      </Dialog>
    </Stack>
  )
}
