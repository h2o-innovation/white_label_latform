import { Controller } from 'react-hook-form'
import { Box, Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { StepProps } from './types'

const CTC_OPTIONS = [
  { value: '1', label: 'CTC Demo — Carlos Silva' }, { value: '2', label: 'CTC Demo — Ana Souza' },
  { value: '3', label: 'CTC Demo — João Mendes' }, { value: '4', label: 'CTC Demo — Maria Lima' }, { value: '5', label: 'CTC Demo — Pedro Costa' },
]

const clientTypes = [
  ['cooperativa', 'Cooperativa'], ['revenda', 'Revenda'], ['produtorRural', 'Produtor rural'], ['empresaAgropecuaria', 'Empresa agropecuária'], ['usina', 'Usina'],
] as const

export function Step1BasicData({ control, register, errors, watch, onTypeChange, readOnly }: StepProps) {
  const pessoaFisica = watch('tipoCadastro') === 'pessoaFisica'
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Dados cadastrais</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller name="tipoCadastro" control={control} render={({ field }) => (
            <ToggleButtonGroup exclusive fullWidth disabled={readOnly} value={field.value} onChange={(_, value) => value && (onTypeChange ? onTypeChange(value) : field.onChange(value))}>
              <ToggleButton value="pessoaJuridica">Pessoa Jurídica</ToggleButton>
              <ToggleButton value="pessoaFisica">Pessoa Física</ToggleButton>
            </ToggleButtonGroup>
          )} />
        </Grid>
        {pessoaFisica ? (
          <>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="CPF" {...register('cpf')} error={!!errors.cpf} helperText={errors.cpf?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} type="date" label="Data de nascimento" InputLabelProps={{ shrink: true }} {...register('dataNascimento')} error={!!errors.dataNascimento} helperText={errors.dataNascimento?.message} /></Grid>
            <Grid item xs={12}><TextField fullWidth disabled={readOnly} label="Nome completo" {...register('nomeCompleto')} error={!!errors.nomeCompleto} helperText={errors.nomeCompleto?.message} /></Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="CNPJ" {...register('cnpj')} error={!!errors.cnpj} helperText={errors.cnpj?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Razão social" {...register('razaoSocial')} error={!!errors.razaoSocial} helperText={errors.razaoSocial?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Nome fantasia" {...register('nomeFantasia')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="CNAE principal" {...register('cnaePrincipal')} /></Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={readOnly}><InputLabel>Tipo de CNPJ</InputLabel><Select label="Tipo de CNPJ" defaultValue="" {...register('tipoCNPJ')}><MenuItem value=""><em>Não informado</em></MenuItem><MenuItem value="matriz">Matriz</MenuItem><MenuItem value="filial">Filial</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Quantidade de filiais" {...register('quantidadeFiliais')} /></Grid>
          </>
        )}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={readOnly}><InputLabel>Segmentação</InputLabel><Select label="Segmentação" defaultValue="vendaDireta" {...register('segmentacao')}><MenuItem value="vendaDireta">Venda direta</MenuItem><MenuItem value="cooperativa">Cooperativa</MenuItem><MenuItem value="revenda">Revenda</MenuItem></Select></FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={readOnly}><InputLabel>Tipo de cliente</InputLabel><Select label="Tipo de cliente" defaultValue="revenda" {...register('tipoCliente')}>{clientTypes.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={readOnly} error={!!errors.atribuirCtc}><InputLabel>Atribuir CTC</InputLabel><Select label="Atribuir CTC" defaultValue="" {...register('atribuirCtc')}><MenuItem value=""><em>Selecione</em></MenuItem>{CTC_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select><FormHelperText>{errors.atribuirCtc?.message}</FormHelperText></FormControl>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Gerente da conta" {...register('gerenteDaConta')} error={!!errors.gerenteDaConta} helperText={errors.gerenteDaConta?.message} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Grupo comercial" {...register('grupoComercial')} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Compras totais" {...register('comprasTotais')} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} label="Moeda das compras" placeholder="BRL" {...register('comprasTotaisMoeda')} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth disabled={readOnly} type="date" label="Data de início da relação" InputLabelProps={{ shrink: true }} {...register('dataInicioRelacao')} /></Grid>
        <Grid item xs={12}><TextField fullWidth disabled={readOnly} multiline minRows={2} label="Observações gerais" {...register('observacoesGerais')} /></Grid>
        <Grid item xs={12} md={6}><Controller name="clienteDePool" control={control} render={({ field }) => <FormControlLabel control={<Checkbox disabled={readOnly} checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label="Cliente de pool" />} /></Grid>
        <Grid item xs={12} md={6}><Controller name="emiteReceitaAgronomica" control={control} render={({ field }) => <FormControlLabel control={<Checkbox disabled={readOnly} checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label="Emite receita agronômica" />} /></Grid>
      </Grid>
    </Box>
  )
}
