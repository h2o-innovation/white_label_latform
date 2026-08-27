import { useState } from 'react'
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Paper, Stack, TextField, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useFormsStore } from '../infrastructure/formsStore'

export function CreateFormPage() {
  const navigate = useNavigate()
  const addCategory = useFormsStore((state) => state.addCategory)
  const [namingOpen, setNamingOpen] = useState(false)
  const [formName, setFormName] = useState('')

  const handleConfirm = () => {
    if (!formName.trim()) return
    addCategory(formName.trim())
    setNamingOpen(false)
    navigate('/forms')
  }

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Dados do formulário</Typography>
        <Stack spacing={3}>
          <TextField fullWidth label="Nome" />
          <TextField fullWidth label="Sobrenome" />
          <TextField fullWidth label="Telefone" />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/forms')}>Cancelar</Button>
            <Button variant="contained" onClick={() => setNamingOpen(true)}>Salvar</Button>
          </Box>
        </Stack>
      </Paper>

      <Dialog open={namingOpen} onClose={() => setNamingOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nome do formulário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome do formulário"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setNamingOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!formName.trim()}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
