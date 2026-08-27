import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Snackbar, Step, StepLabel, Stepper, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { clientSchema } from '../domain/clientSchema'
import type { ClientEntry, ClientFormData } from '../domain/types'
import { createClient } from '../application/createClient'
import { updateClient } from '../application/updateClient'
import { useClientsStore } from '../infrastructure/clientsStore'
import { useModalStore } from '../../../shared/stores/modalStore'
import { Step1BasicData } from './steps/Step1BasicData'
import { Step2Location } from './steps/Step2Location'
import { Step3Contacts } from './steps/Step3Contacts'
import { Step4Documents } from './steps/Step4Documents'

const steps = ['Dados básicos', 'Localização', 'Contatos', 'Documentos']
const stepFields: string[][] = [
  ['tipoCadastro', 'cnpj', 'cpf', 'dataNascimento', 'nomeCompleto', 'razaoSocial', 'atribuirCtc', 'gerenteDaConta'],
  ['ufEstado', 'municipio', 'logradouro', 'receitaFederalStatus', 'inscricaoEstadual'],
  ['digitalSignatureContact', 'mainContactInfo'],
  ['certificadoArmazenamento', 'contratoSocial'],
]

const emptyForm: ClientFormData = {
  tipoCadastro: 'pessoaJuridica', cnpj: '', cpf: '', dataNascimento: '', nomeCompleto: '', razaoSocial: '', nomeFantasia: '', cnaePrincipal: '',
  segmentacao: 'vendaDireta', tipoCliente: 'revenda', clienteDePool: false, emiteReceitaAgronomica: false, tipoCNPJ: undefined, quantidadeFiliais: '', comprasTotais: '', comprasTotaisMoeda: '',
  atribuirCtc: '', gerenteDaConta: '', grupoComercial: '', observacoesGerais: '', dataInicioRelacao: '', ufEstado: '', municipio: '', logradouro: '', receitaFederalStatus: '', inscricaoEstadual: [],
  digitalSignatureContact: { email: '', responsavel: '' }, mainContactInfo: [{ telefone: '', email: '', responsavelContacto: '' }], certificadoArmazenamento: '', contratoSocial: '',
}

interface ClientFormModalProps {
  editTarget: ClientEntry | null
  onClosed: () => void
  viewOnly?: boolean
  externalOpen?: boolean
  onExternalClose?: () => void
}

export function ClientFormModal({ editTarget, onClosed, viewOnly, externalOpen, onExternalClose }: ClientFormModalProps) {
  const open = useModalStore((state) => state.open)
  const closeModal = useModalStore((state) => state.closeModal)
  const isOpen = externalOpen !== undefined ? externalOpen : open
  const addClient = useClientsStore((state) => state.addClient)
  const updateClientStore = useClientsStore((state) => state.updateClient)
  const [currentStep, setCurrentStep] = useState(0)
  const [pendingType, setPendingType] = useState<ClientFormData['tipoCadastro'] | null>(null)
  const [snackbar, setSnackbar] = useState('')
  const { control, register, handleSubmit, trigger, reset, watch, setValue, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema), mode: 'onChange', defaultValues: emptyForm,
  })

  useEffect(() => {
    if (!isOpen) return
    setCurrentStep(0)
    reset(editTarget ?? emptyForm)
  }, [editTarget, isOpen, reset])

  const handleClose = () => {
    if (onExternalClose) { onExternalClose(); onClosed(); return }
    closeModal(); onClosed()
  }
  const handleTypeChange = (type: ClientFormData['tipoCadastro']) => setPendingType(type)
  const confirmTypeChange = () => {
    if (pendingType) reset({ ...emptyForm, tipoCadastro: pendingType })
    setPendingType(null)
    setCurrentStep(0)
  }
  const handleNext = async () => {
    const valid = await trigger(stepFields[currentStep] as never)
    if (valid) setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }
  const onSubmit = (data: ClientFormData) => {
    if (editTarget) {
      updateClient(updateClientStore, editTarget.id, data)
      setSnackbar('Cadastro atualizado com sucesso.')
    } else {
      createClient(addClient, data)
      setSnackbar('Cadastro criado com sucesso.')
    }
    handleClose()
  }

  const step = [
    <Step1BasicData key="basic" control={control} register={register} errors={errors} watch={watch} setValue={setValue} onTypeChange={handleTypeChange} readOnly={viewOnly} />,
    <Step2Location key="location" control={control} register={register} errors={errors} watch={watch} setValue={setValue} readOnly={viewOnly} />,
    <Step3Contacts key="contacts" control={control} register={register} errors={errors} watch={watch} setValue={setValue} readOnly={viewOnly} />,
    <Step4Documents key="documents" control={control} register={register} errors={errors} watch={watch} setValue={setValue} readOnly={viewOnly} />,
  ][currentStep]

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{viewOnly ? 'Visualizar cadastro' : editTarget ? 'Editar cadastro' : 'Novo cadastro'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          {step}
          {Object.keys(errors).length > 0 && currentStep === 3 && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 2 }}>Revise os campos obrigatórios antes de salvar.</Typography>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {viewOnly ? (
            <Button onClick={handleClose} color="inherit">Fechar</Button>
          ) : (
            <>
              <Button onClick={handleClose} color="inherit">Cancelar</Button>
              {currentStep > 0 && <Button onClick={() => setCurrentStep((value) => value - 1)}>Voltar</Button>}
              {currentStep < steps.length - 1 ? <Button variant="contained" onClick={handleNext}>Próximo</Button> : <Button variant="contained" onClick={handleSubmit(onSubmit)}>Salvar</Button>}
            </>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={pendingType !== null} onClose={() => setPendingType(null)} maxWidth="xs">
        <DialogTitle>Trocar tipo de cadastro?</DialogTitle>
        <DialogContent><Typography>Os dados preenchidos serão limpos ao trocar entre Pessoa Jurídica e Pessoa Física.</Typography></DialogContent>
        <DialogActions><Button onClick={() => setPendingType(null)}>Cancelar</Button><Button color="warning" variant="contained" onClick={confirmTypeChange}>Limpar e trocar</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar('')} message={snackbar}><Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert></Snackbar>
    </>
  )
}
