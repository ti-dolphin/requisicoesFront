import { Opportunity } from "../models/oportunidades/Opportunity";

export type KanbanBoardName = "Comercial" | "Orçamento";

export const BOARD_FIELD: Record<KanbanBoardName, "kanban_column_id" | "kanban_column_id_orcamento"> = {
  Comercial: "kanban_column_id",
  "Orçamento": "kanban_column_id_orcamento",
};

export const BLOCKED_COLUMN_ID = 15;

export const AUTO_ONLY_COLUMN_IDS = [3, 4, 9];

const GATED_COLUMNS: Record<number, { field: "kanban_column_id"; value: number }> = {
  14: { field: "kanban_column_id", value: 5 },
};

export function isManualMoveAllowed(
  columnId: number,
  opportunity: Pick<Opportunity, "kanban_column_id" | "kanban_column_id_orcamento">
): { allowed: true } | { allowed: false; message: string } {
  if (columnId === BLOCKED_COLUMN_ID) return { allowed: true };

  if (AUTO_ONLY_COLUMN_IDS.includes(columnId)) {
    return { allowed: false, message: "Essa coluna só é preenchida automaticamente pelo fluxo." };
  }

  const gate = GATED_COLUMNS[columnId];
  if (gate && opportunity[gate.field] !== gate.value) {
    return { allowed: false, message: "Essa coluna ainda não está liberada para essa oportunidade." };
  }

  return { allowed: true };
}
