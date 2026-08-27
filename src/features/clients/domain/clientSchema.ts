import { z } from 'zod'

const contactSchema = z.object({ telefone: z.string().optional(), email: z.string().optional(), responsavelContacto: z.string().optional() })

export const clientSchema = z.object({
  tipoCadastro: z.enum(['pessoaJuridica', 'pessoaFisica']).default('pessoaJuridica'),
  cnpj: z.string().optional(), cpf: z.string().optional(), dataNascimento: z.string().optional(), nomeCompleto: z.string().optional(),
  razaoSocial: z.string().optional(), nomeFantasia: z.string().optional(), cnaePrincipal: z.string().optional(),
  segmentacao: z.enum(['vendaDireta', 'cooperativa', 'revenda']).default('vendaDireta'),
  tipoCliente: z.enum(['cooperativa', 'revenda', 'produtorRural', 'empresaAgropecuaria', 'usina']).default('revenda'),
  clienteDePool: z.boolean().default(false), emiteReceitaAgronomica: z.boolean().default(false),
  tipoCNPJ: z.enum(['matriz', 'filial']).optional(), quantidadeFiliais: z.string().optional(), comprasTotais: z.string().optional(), comprasTotaisMoeda: z.string().optional(),
  atribuirCtc: z.string().optional(), gerenteDaConta: z.string().optional(), grupoComercial: z.string().optional(), observacoesGerais: z.string().optional(), dataInicioRelacao: z.string().optional(),
  ufEstado: z.string().optional(), municipio: z.string().optional(), logradouro: z.string().optional(), receitaFederalStatus: z.string().optional(), inscricaoEstadual: z.array(z.string()).optional(),
  digitalSignatureContact: z.object({ email: z.string().optional(), responsavel: z.string().optional() }).optional(),
  mainContactInfo: z.array(contactSchema).min(1, 'Adicione pelo menos um contato principal'),
  certificadoArmazenamento: z.string().optional(), contratoSocial: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipoCadastro === 'pessoaFisica') {
    if (!data.cpf?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cpf'], message: 'CPF é obrigatório' })
    if (!data.nomeCompleto?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nomeCompleto'], message: 'Nome completo é obrigatório' })
    if (!data.dataNascimento?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dataNascimento'], message: 'Data de nascimento é obrigatória' })
  } else {
    if (!data.cnpj?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cnpj'], message: 'CNPJ é obrigatório' })
    if (!data.razaoSocial?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['razaoSocial'], message: 'Razão social é obrigatória' })
    if (!data.gerenteDaConta?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gerenteDaConta'], message: 'Gerente da conta é obrigatório' })
  }
  if (!data.atribuirCtc?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['atribuirCtc'], message: 'Selecione um CTC' })
})
