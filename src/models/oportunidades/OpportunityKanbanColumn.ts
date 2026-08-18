import { Card as KanbanCard } from "@caldwell619/react-kanban";

export interface OpportunityKanbanColumn {
  id: number;
  name: string;
}

export interface ArchivedOpportunity {
  CODOS: number;
  projeto: { ID: number };
  adicional: { NUMERO: number };
  cliente: { NOMEFANTASIA: string };
}

export interface KanbanCardFollower {
  CODPESSOA: number;
  NOME: string;
}

export interface KanbanCardOpportunity extends ArchivedOpportunity {
  kanban_column_id: number;
  kanban_column_id_orcamento: number | null;
  data_planejada: string | null;
  seguidores: KanbanCardFollower[];
}

export interface OpportunityKanbanCardData extends KanbanCard {
  id: number;
  opportunity: KanbanCardOpportunity;
}
