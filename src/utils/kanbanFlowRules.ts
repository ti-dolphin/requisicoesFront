export type KanbanBoardName = "Comercial" | "Orçamento";

export const BOARD_FIELD: Record<KanbanBoardName, "kanban_column_id" | "kanban_column_id_orcamento"> = {
  Comercial: "kanban_column_id",
  "Orçamento": "kanban_column_id_orcamento",
};

// Valor do campo `board` em web_kanban_crm_columns pras colunas compartilhadas
// (Bloqueado/Arquivado/Excluído) — aparecem nos dois quadros.
export const SHARED_BOARD_VALUE = "Todos";

export const BLOCKED_COLUMN_ID = 17;
export const ARCHIVED_COLUMN_ID = 18;
export const DELETED_COLUMN_ID = 19;

// Colunas que só podem ser preenchidas pelo sistema — nunca destino de arraste manual.
export const AUTO_ONLY_COLUMN_IDS = [3, 10]; // Comercial.Proposta, Orçamento.Backlog

export function isManualMoveAllowed(
  columnId: number
): { allowed: true } | { allowed: false; message: string } {
  if (columnId === BLOCKED_COLUMN_ID || columnId === ARCHIVED_COLUMN_ID || columnId === DELETED_COLUMN_ID) {
    return { allowed: true };
  }

  if (AUTO_ONLY_COLUMN_IDS.includes(columnId)) {
    return { allowed: false, message: "Essa coluna só é preenchida automaticamente pelo fluxo." };
  }

  return { allowed: true };
}
