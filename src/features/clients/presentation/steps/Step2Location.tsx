import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material'
import type { StepProps } from './types'

export function Step2Location({ register, errors, watch, setValue }: StepProps) {
  const registrations = watch('inscricaoEstadual') ?? []
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Localização e situação fiscal</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField select fullWidth label="UF / Estado" defaultValue="" {...register('ufEstado')}><MenuItem value=""><em>Selecione</em></MenuItem>{['AC','BA','GO','MG','PR','RJ','RS','SC','SP'].map((uf) => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}</TextField></Grid>
        <Grid item xs={12} md={8}><TextField fullWidth label="Município" {...register('municipio')} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Logradouro" {...register('logradouro')} /></Grid>
        <Grid item xs={12} md={6}><TextField select fullWidth label="Status na Receita Federal" defaultValue="" {...register('receitaFederalStatus')}><MenuItem value=""><em>Selecione</em></MenuItem><MenuItem value="ativa">Ativa</MenuItem><MenuItem value="inapta">Inapta</MenuItem><MenuItem value="baixada">Baixada</MenuItem></TextField></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Inscrições estaduais" value={registrations.join('\n')} onChange={(event) => setValue('inscricaoEstadual', event.target.value.split('\n').filter(Boolean), { shouldDirty: true })} multiline minRows={1} helperText="Informe uma inscrição por linha" error={!!errors.inscricaoEstadual} /></Grid>
      </Grid>
    </Box>
  )
}
