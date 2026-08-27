import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material'
import AddOutlined from '@mui/icons-material/AddOutlined'
import { useFormBuilderStore } from '../../infrastructure/formBuilderStore'

export function FlowPanel() {
  const steps = useFormBuilderStore((s) => s.steps)
  const activeStepId = useFormBuilderStore((s) => s.activeStepId)
  const edges = useFormBuilderStore((s) => s.edges)
  const addStep = useFormBuilderStore((s) => s.addStep)
  const setActiveStep = useFormBuilderStore((s) => s.setActiveStep)
  const addEdge = useFormBuilderStore((s) => s.addEdge)
  const updateEdge = useFormBuilderStore((s) => s.updateEdge)
  const removeEdge = useFormBuilderStore((s) => s.removeEdge)

  return (
    <Box sx={{
      width: 260, flexShrink: 0, bgcolor: 'background.paper',
      borderLeft: '1px solid', borderColor: 'grey.200',
      overflowY: 'auto', p: 2,
    }}>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5 }}>
        Fluxo
      </Typography>

      {steps.map((step, index) => {
        const fieldCount = step.rows.reduce(
          (acc, r) => acc + r.columns.filter((c) => c.component !== null).length, 0
        )
        const edge = edges.find((e) => e.fromStepId === step.id)
        const isActive = step.id === activeStepId

        return (
          <Box key={step.id}>
            <Paper
              variant="outlined"
              onClick={() => setActiveStep(step.id)}
              sx={{
                p: 1.5, mb: 0.5, cursor: 'pointer',
                borderColor: isActive ? 'primary.main' : 'grey.200',
                bgcolor: isActive ? 'primary.50' : 'background.paper',
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              <Typography variant="body2" fontWeight={600}>{step.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
              </Typography>

              {index < steps.length - 1 && (
                <FormControl fullWidth size="small" sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
                  <InputLabel>Próximo passo</InputLabel>
                  <Select
                    label="Próximo passo"
                    value={edge?.toStepId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value as string
                      if (!val) { if (edge) removeEdge(edge.id); return }
                      if (edge) updateEdge(edge.id, { toStepId: val })
                      else addEdge(step.id, val)
                    }}
                  >
                    <MenuItem value=""><em>Fim do formulário</em></MenuItem>
                    {steps.filter((s) => s.id !== step.id).map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Paper>

            {/* Arrow connector */}
            {index < steps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.disabled', fontSize: 18, mb: 0.5 }}>↓</Box>
            )}
          </Box>
        )
      })}

      <Button fullWidth size="small" startIcon={<AddOutlined />} onClick={addStep} sx={{ mt: 1 }}>
        Adicionar passo
      </Button>
    </Box>
  )
}
