import { Controller, useFieldArray } from 'react-hook-form'
import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material'
import AddOutlined from '@mui/icons-material/AddOutlined'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import type { StepProps } from './types'

export function Step3Contacts({ control, register, errors }: StepProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'mainContactInfo' })
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Contatos</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Controller name="digitalSignatureContact.email" control={control} render={({ field }) => <TextField fullWidth label="E-mail da assinatura digital" {...field} />} /></Grid>
        <Grid item xs={12} md={6}><Controller name="digitalSignatureContact.responsavel" control={control} render={({ field }) => <TextField fullWidth label="Responsável pela assinatura" {...field} />} /></Grid>
        <Grid item xs={12}><Divider sx={{ my: 1 }} /><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}><Typography variant="subtitle2">Contato principal</Typography><Button size="small" startIcon={<AddOutlined />} onClick={() => append({ telefone: '', email: '', responsavelContacto: '' })}>Adicionar contato</Button></Box></Grid>
        {fields.map((field, index) => {
          const contactError = errors.mainContactInfo?.[index] as { telefone?: { message?: string }; email?: { message?: string }; responsavelContacto?: { message?: string } } | undefined
          return <Grid container item spacing={2} key={field.id} xs={12}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Telefone" {...register(`mainContactInfo.${index}.telefone`)} error={!!contactError?.telefone} helperText={contactError?.telefone?.message} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="E-mail" {...register(`mainContactInfo.${index}.email`)} error={!!contactError?.email} helperText={contactError?.email?.message} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Responsável" {...register(`mainContactInfo.${index}.responsavelContacto`)} error={!!contactError?.responsavelContacto} helperText={contactError?.responsavelContacto?.message} /></Grid>
            <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}><Button color="error" onClick={() => fields.length > 1 && remove(index)} aria-label="Remover contato"><DeleteOutline /></Button></Grid>
          </Grid>
        })}
        {typeof errors.mainContactInfo?.message === 'string' && <Grid item xs={12}><Typography color="error" variant="caption">{errors.mainContactInfo.message}</Typography></Grid>}
      </Grid>
    </Box>
  )
}
