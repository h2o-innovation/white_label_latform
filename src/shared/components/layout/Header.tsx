import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import AddOutlined from '@mui/icons-material/AddOutlined'
import { useLocation } from 'react-router-dom'
import { useModalStore } from '../../stores/modalStore'

const titles: Record<string, string> = { '/clients': 'Clientes', '/settings': 'Configurações' }

export function Header() {
  const location = useLocation()
  const openModal = useModalStore((state) => state.openModal)
  const isClientsPage = location.pathname === '/clients'
  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e5ebe7' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        <Typography variant="h5" color="text.primary">{titles[location.pathname] ?? 'Cadastro Local'}</Typography>
        {isClientsPage && <Button variant="contained" startIcon={<AddOutlined />} onClick={openModal}>Novo Cadastro</Button>}
      </Toolbar>
    </AppBar>
  )
}
