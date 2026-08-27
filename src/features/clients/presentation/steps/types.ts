import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { ClientFormData } from '../../domain/types'

export interface StepProps {
  control: Control<ClientFormData>
  register: UseFormRegister<ClientFormData>
  errors: FieldErrors<ClientFormData>
  watch: UseFormWatch<ClientFormData>
  setValue: UseFormSetValue<ClientFormData>
  onTypeChange?: (type: ClientFormData['tipoCadastro']) => void
  readOnly?: boolean
}
