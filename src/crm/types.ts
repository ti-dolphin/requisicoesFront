import { AutocompleteChangeDetails, AutocompleteChangeReason } from "@mui/material";
import { ChecklistItemFile } from "../Patrimony/types";

export interface OpportunityInfo {
  numeroProjeto: number; // ID_PROJETO
  numeroAdicional: number; // ID_ADICIONAL
  nomeStatus: string; // nome_status
  nomeCliente: string; // nome_cliente
  nomeDescricaoProposta: string; // nome_descricao_proposta
  dataSolicitacao: string | Date | null; // DATASOLICITACAO
  dataFechamento: string | Date | null; // DATAENTREGA
  dataInteracao: string | Date | null; // DATAINTERACAO
  dataInicio: string | Date | null; // DATAINICIO
  nomeVendedor: string; // nome_vendedor
  nomeGerente: string; // nome_gerente
  valorFaturamentoDolphin: string; // VALORFATDOLPHIN (FORMATADO)
  valorFaturamentoDireto: string; // VALORFATDIRETO (FORMATADO)
  valorTotal: string; // VALORTOTAL (FORMATADO)
  numeroOs: number; // CODOS
}

export interface Opportunity {
  codOs: number | null; // CODOS
  codTipoOs?: number | null; // CODTIPOOS
  codCCusto?: string | null; // CODCCUSTO
  obra?: string | null; // OBRA
  dataSolicitacao?: Date | string | null; // DATASOLICITACAO
  dataNecessidade?: Date | string | null; // DATANECESSIDADE
  docReferencia?: string | null; // DOCREFERENCIA
  listaMateriais?: string | null; // LISTAMATERIAIS
  dataInicio?: Date | string | null; // DATAINICIO
  dataPrevEntrega?: Date | string | null; // DATAPREVENTREGA
  dataEntrega?: Date | string | null; // DATAENTREGA
  dataEnvioEntrega?: Date | string | null; // Data de envio da entrega
  codStatus?: number | null; // CODSTATUS
  nome: string | null; // NOME
  descricao?: string | null; // DESCRICAO
  atividades?: string | null; // ATIVIDADES
  prioridade?: number | null; // PRIORIDADE
  solicitante?: number | null; // SOLICITANTE
  responsavel?: number | null; // RESPONSAVEL
  codDisciplina?: number | null; // CODDISCIPLINA
  gut?: number | null; // GUT
  gravidade?: number | null; // da
  urgencia?: number | null; // URGENCIA
  tendencia?: number | null; // TENDENCIA
  dataLiberacao?: Date | string | null; // DATALIBERACAO
  relacionamento?: number | null; // RELACIONAMENTO
  fkCodCliente?: number | string | null; // FK_CODCLIENTE
  fkCodColigada: number | null; // FK_CODCOLIGADA
  valorFatDireto?: number | null; // VALORFATDIRETO
  valorServicoMO?: number | null; // VALORSERVICOMO
  valorServicoMatAplicado?: number | null; // VALORSERVICOMATAPLICADO
  valorMaterial?: number | null; // VALORMATERIAL
  valorTotal?: number | null; // VALORTOTAL
  codSegmento: number | null; // CODSEGMENTO
  codCidade?: number | null; // CODCIDADE
  valorLocacao?: number | null; // VALORLOCACAO
  idAdicional: number | null; // ID_ADICIONAL
  numeroAdicional: number | null; // Número adicional
  idProjeto: number | null; // ID_PROJETO
  dataInteracao?: Date | string | null; // DATAINTERACAO
  valorFatDolphin: number | null; // VALORFATDOLPHIN
  principal: boolean | null; // PRINCIPAL
  valorComissao: number | null; // VALOR_COMISSAO
  idMotivoPerdido: number | null; // id_motivo_perdido
  observacoes?: string | null; // observacoes
  descricaoVenda?: string | null; // DESCRICAO_VENDA
  emailVendaEnviado?: boolean | null; // EMAIL_VENDA_ENVIADO
  comentarios: Comentario[] | [];
  files?: OpportunityFile [];
  seguidores: Follower[]
}
export interface OpportunityGuideProps {
  guide: Guide;
  renderAutoCompleteValue: (field: OpportunityColumn) => OpportunityOptionField;
  handleChangeAutoComplete: (
    _event: React.SyntheticEvent<Element, Event>,
    value: OpportunityOptionField | null,
    _reason: AutocompleteChangeReason,
    _details?:
      | AutocompleteChangeDetails<{
          label: string;
          id: number;
          object: string;
        }>
      | undefined
  ) => void;
  renderOptions: (column: {
    label: string;
    dataKey: string;
    autoComplete?: boolean;
  }) => OpportunityOptionField[] | undefined;
  adicional: boolean;
  currentOppIdSelected: number;
  opportunity: Opportunity;
  handleChangeTextField: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: OpportunityColumn
  ) => void;
  isDateField: (dataKey: string) => boolean;
  currentCommentValue: string;
  handleChangeComentarios: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    codigoComentario?: number
  ) => void;
  editingComment: Comentario | undefined;
  setEditingComment: React.Dispatch<
    React.SetStateAction<Comentario | undefined>
  >;
  setCurrentOpportunity: React.Dispatch<React.SetStateAction<Opportunity>>;
  handleSaveOpportunity: () => Promise<void>;
  handleChangeFiles: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDeleteFile: (file: OpportunityFile) => void;
}

export interface GuideSelectorProps {
  guides: Guide[];
  currentSlideIndex: number;
  handleChangeGuide: (index: number) => void;
}

export interface CardChecklistItemProps {
  key: number;
  checklistItem: ChecklistItemFile;
  onOpenItemImage: (checklistItem: ChecklistItemFile) => void;
  onChangeProblem: (checklistItemReceived: ChecklistItemFile) => void;
  onChangeOkay: (checklistItemReceived: ChecklistItemFile) => void;
  onChangeObservation: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    checklistItemReceived: ChecklistItemFile
  ) => void;
  renderItemImage: (checklistItem: ChecklistItemFile) => string;
  renderErrorColor: (checklistItem: ChecklistItemFile) => "gray" | "red";
  renderOkayColor: (checklistItem: ChecklistItemFile) => "gray" | "green";
  renderObservation: (checklistItem: ChecklistItemFile) => string;
  isMovimentationResponsable: () => boolean;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    checklistItem: ChecklistItemFile
  ) => Promise<void>;
  toBeDone: () => boolean;
  isIOS: boolean;
  shouldShowFinalizeButton: boolean;
  handleSendChecklistItems: () => Promise<void>;
}

export interface Guide{
    name: string;
    fields?: ({
        label: string;
        dataKey: string;
        autoComplete: boolean;
        type: string;
    } | {
        label: string;
        dataKey: string;
        type: string;
        autoComplete?: undefined;
    })[];

}

export interface Comentario{ 
     email: string | number,
     codOs : number | null,
     criadoEm: Date | string | null,
     criadoPor: string | null,
     descricao: string | null,
     codigoComentario: number  | null
}

export interface DateFilter {
  dateFilterKey: string;
  from: Date | string;
  to: Date | string;
  dbField: string;
}
export interface Status {
  CODSTATUS: number;
  NOME: string;
  ACAO: number;
  ATIVO: number;
}
export interface Pessoa {
  CODPESSOA: number;
  NOME: string;
}

 export interface Follower {   
  id_seguidor_projeto : number;
  id_projeto : number;
  codpessoa : number;
  ativo : number;
  nome: string;
}
export interface OpportunityColumn {
  label: string;
  dataKey: string;
  autoComplete?: boolean;
  type: string;
  key?: number;
}
export interface Client {
  CODCLIENTE: number;
  NOMEFANTASIA: string;
}


export interface OpportunityOptionField {
  label: string;
  id: number;
  object: string;
  key: number;
}
export interface OpportunityFile {
       id_anexo_os : number,
       codos : number,
       nome_arquivo : string,
       arquivo : string
}