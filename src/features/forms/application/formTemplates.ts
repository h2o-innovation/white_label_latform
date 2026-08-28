import type {
  FormComponent,
  FormStep,
} from "../infrastructure/formBuilderStore";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  steps: FormStep[];
}

type Field = Pick<FormComponent, "type" | "label" | "placeholder" | "required" | "options">;

const field = (
  id: string,
  type: FormComponent["type"],
  label: string,
  required: boolean,
  placeholder = "",
  options: FormComponent["options"] = [],
): FormComponent => ({ id, type, label, required, placeholder, options });

const step = (id: string, name: string, fields: Field[]): FormStep => ({
  id,
  name,
  rows: fields.map((component, index) => ({
    id: `${id}-row-${index + 1}`,
    columns: [
      {
        id: `${id}-column-${index + 1}`,
        component: { ...component, id: `${id}-field-${index + 1}` },
      },
    ],
  })),
});

const option = (value: string, label: string) => ({
  id: value,
  label,
  value,
});

const clientTemplateSteps: FormStep[] = [
  step("client-data", "Dados do cliente", [
    field("name", "text", "Nome do cliente", true, "Informe o nome do cliente"),
    field("client-type", "select", "Tipo de cliente", true, "Selecione o tipo", [
      option("pessoa-fisica", "Pessoa física"),
      option("pessoa-juridica", "Pessoa jurídica"),
      option("produtor-rural", "Produtor rural"),
      option("cooperativa", "Cooperativa"),
      option("revenda", "Revenda"),
    ]),
    field("document", "text", "CPF ou CNPJ", true, "Digite o CPF ou CNPJ"),
    field("email", "email", "E-mail principal", true, "cliente@exemplo.com"),
    field("phone", "phone", "Telefone principal", true, "(00) 00000-0000"),
    field("created-at", "date", "Data de cadastro", true),
  ]),
  step("contact-location", "Localização e contato", [
    field("state", "select", "Estado", true, "Selecione o estado", [
      ...["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map((uf) => option(uf.toLowerCase(), uf)),
    ]),
    field("city", "text", "Cidade", true, "Informe a cidade"),
    field("address", "text", "Endereço", false, "Rua, avenida ou estrada"),
    field("contact-person", "text", "Responsável pelo cliente", true, "Nome do responsável"),
    field("service-channel", "select", "Canal de atendimento", true, "Selecione o canal", [
      option("telefone", "Telefone"),
      option("email", "E-mail"),
      option("whatsapp", "WhatsApp"),
      option("visita-presencial", "Visita presencial"),
    ]),
    field("notes", "text", "Observações", false, "Adicione observações"),
  ]),
];

const salesTemplateSteps: FormStep[] = [
  step("sales-order", "Pedido de vendas", [
    field("salesperson", "text", "Vendedor responsável", true, "Nome do vendedor"),
    field("commercial-region", "select", "Região comercial", true, "Selecione a região", [
      option("norte", "Norte"),
      option("nordeste", "Nordeste"),
      option("centro-oeste", "Centro-Oeste"),
      option("sudeste", "Sudeste"),
      option("sul", "Sul"),
    ]),
    field("sales-segment", "select", "Segmento de venda", true, "Selecione o segmento", [
      option("venda-direta", "Venda direta"),
      option("cooperativa", "Cooperativa"),
      option("revenda", "Revenda"),
      option("distribuidor", "Distribuidor"),
    ]),
    field("products-of-interest", "multiselect", "Produtos de interesse", false, "Selecione os produtos", [
      option("fertilizantes", "Fertilizantes"),
      option("defensivos-agricolas", "Defensivos agrícolas"),
      option("sementes", "Sementes"),
      option("equipamentos", "Equipamentos"),
      option("servicos", "Serviços"),
    ]),
    field("monthly-potential", "number", "Potencial de compra mensal", false, "Informe o valor estimado"),
    field("next-contact", "date", "Próximo contato", false),
  ]),
];

export const formTemplates: FormTemplate[] = [
  {
    id: "client",
    name: "Cliente",
    description: "Cadastro do cliente, localização e contato.",
    steps: clientTemplateSteps,
  },
  {
    id: "sales-order",
    name: "Pedido de vendas",
    description: "Informações comerciais e acompanhamento do pedido.",
    steps: salesTemplateSteps,
  },
];
