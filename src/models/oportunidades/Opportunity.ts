
import { Project } from "../Project";
import { ReducedUser } from "../User";
import { Client } from "./Client";
import { OpportunityStatus } from "./OpportunityStatus";
import { ProjectAdicional } from "./ProjectAdicional";
import { SimilarOpportunity } from "../../services/oportunidades/OpportunityService";
import { KanbanBoardName } from "../../utils/kanbanFlowRules";
import { KanbanCardOpportunity, OpportunityKanbanColumn } from "./OpportunityKanbanColumn";

export interface Opportunity {
  CODOS: number;
  CODTIPOOS: number;
  CODCCUSTO: string;
    OBRA: string | null;
    DATASOLICITACAO: string;
    DATANECESSIDADE: string;
    DOCREFERENCIA: string | null;
    LISTAMATERIAIS: string | null;
    DATAINICIO: string;
    DATAPREVENTREGA: string;
    DATAENTREGA: string | null;     
    CODSTATUS: number;
    NOME: string;
    DESCRICAO: string | null;
    ATIVIDADES: string | null;
    PRIORIDADE: number;
    SOLICITANTE: number;
    RESPONSAVEL: number;
    CODDISCIPLINA: number;
    GUT: number;
    GRAVIDADE: number;
    URGENCIA: number;
    TENDENCIA: number;
    DATALIBERACAO: string | null;
    RELACIONAMENTO: number;
    FK_CODCLIENTE: string;
    FK_CODCOLIGADA: number;
    VALORFATDIRETO: number;
    VALORSERVICOMO: string | null;
    VALORSERVICOMATAPLICADO: string | null;
    VALORMATERIAL: string | null;
    VALOR_TOTAL: number;
    CODSEGMENTO: number;
    CODCIDADE: number;
    VALORLOCACAO: string | null;
    ID_ADICIONAL: number;
    ID_PROJETO: number;
    DATAINTERACAO: string | null;
    VALORFATDOLPHIN: number;
    PRINCIPAL: boolean;
    VALOR_COMISSAO: number;
    id_motivo_perdido: number;
    observacoes: string;
    DESCRICAO_VENDA: string;
    EMAIL_VENDA_ENVIADO: boolean;
    responsavel: ReducedUser;
    adicional: ProjectAdicional;
    status: OpportunityStatus;
    cliente: Client;
    projeto: Project;
    kanbanStatus: OpportunityKanbanStatus;
}

export interface OpportunityKanbanStatus {
  comercial: OpportunityKanbanColumn | null;
  orcamento: OpportunityKanbanColumn | null;
}

export interface OpportunityKanbanCardDialogProps {
  open: boolean;
  opportunity: KanbanCardOpportunity | null;
  onClose: () => void;
}

export interface OpportunityKanbanArchivedCardsDialogProps {
  open: boolean;
  board: KanbanBoardName;
  onClose: () => void;
  onUnarchive: () => void;
}

export interface SimilarOpportunitiesModalProps {
  open: boolean;
  opportunities: SimilarOpportunity[];
  onClose: () => void;
  onCreateNew: () => void;
  onLinkTo: (codos: number) => void;
}