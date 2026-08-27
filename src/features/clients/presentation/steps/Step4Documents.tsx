import { Box, Button, Grid, Typography } from '@mui/material'
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined'
import type { StepProps } from './types'

export function Step4Documents({ register, setValue, watch }: StepProps) {
  const upload = (name: 'certificadoArmazenamento' | 'contratoSocial', file?: File) => setValue(name, file?.name ?? '', { shouldDirty: true })
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Documentos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Os arquivos são mantidos apenas localmente como nome do arquivo.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Button component="label" variant="outlined" fullWidth startIcon={<UploadFileOutlined />} sx={{ py: 2 }}>{watch('certificadoArmazenamento') || 'Certificado de armazenamento'}<input hidden type="file" onChange={(event) => upload('certificadoArmazenamento', event.target.files?.[0])} /></Button></Grid>
        <Grid item xs={12} md={6}><Button component="label" variant="outlined" fullWidth startIcon={<UploadFileOutlined />} sx={{ py: 2 }}>{watch('contratoSocial') || 'Contrato social'}<input hidden type="file" onChange={(event) => upload('contratoSocial', event.target.files?.[0])} /></Button></Grid>
      </Grid>
      <input type="hidden" {...register('certificadoArmazenamento')} /><input type="hidden" {...register('contratoSocial')} />
    </Box>
  )
}
