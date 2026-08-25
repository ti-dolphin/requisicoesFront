import { QuoteItem } from "../models/requisicoes/QuoteItem";
import { normalizeMonetaryInput } from "./parseMonetaryInput";

export const QUOTE_ITEM_EXCEL_HEADERS = {
  ID: "ID Item",
  CODIGO: "Código",
  DESCRICAO: "Descrição do Produto",
  OBSERVACAO: "Observação",
  UNIDADE: "Unidade",
  QTD_SOLICITADA: "Qtde. Solicitada",
  QTD_COTADA: "Qtde. Cotada",
  PRECO_UNITARIO: "Preço Unitário",
  ICMS: "ICMS (%)",
  IPI: "IPI (%)",
  ST: "ST (%)",
} as const;

export const buildQuoteItemsExcelRows = (items: QuoteItem[]) =>
  items.map((item) => ({
    [QUOTE_ITEM_EXCEL_HEADERS.ID]: item.id_item_cotacao,
    [QUOTE_ITEM_EXCEL_HEADERS.CODIGO]: item.produto_codigo || "",
    [QUOTE_ITEM_EXCEL_HEADERS.DESCRICAO]: item.produto_descricao || "",
    [QUOTE_ITEM_EXCEL_HEADERS.OBSERVACAO]: item.observacao || "",
    [QUOTE_ITEM_EXCEL_HEADERS.UNIDADE]: item.produto_unidade || "",
    [QUOTE_ITEM_EXCEL_HEADERS.QTD_SOLICITADA]: Number(item.quantidade_solicitada || 0),
    [QUOTE_ITEM_EXCEL_HEADERS.QTD_COTADA]: Number(item.quantidade_cotada || 0),
    [QUOTE_ITEM_EXCEL_HEADERS.PRECO_UNITARIO]: Number(item.preco_unitario || 0),
    [QUOTE_ITEM_EXCEL_HEADERS.ICMS]: Number(item.ICMS || 0),
    [QUOTE_ITEM_EXCEL_HEADERS.IPI]: Number(item.IPI || 0),
    [QUOTE_ITEM_EXCEL_HEADERS.ST]: Number(item.ST || 0),
  }));

export interface QuoteItemImportUpdate {
  id_item_cotacao: number;
  payload: {
    id_cotacao: number;
    quantidade_cotada: number;
    preco_unitario: number;
    ICMS: number;
    IPI: number;
    ST: number;
    observacao: string | null;
  };
}

export interface QuoteItemImportResult {
  updates: QuoteItemImportUpdate[];
  errors: string[];
}

const isBlankCell = (value: any) =>
  value === undefined || value === null || String(value).trim() === "";

export const parseQuoteItemsExcelRows = (
  rows: Record<string, any>[],
  items: QuoteItem[]
): QuoteItemImportResult => {
  const updates: QuoteItemImportUpdate[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rawId = row[QUOTE_ITEM_EXCEL_HEADERS.ID];
    const idItemCotacao = Number(rawId);
    const item = items.find((qi) => qi.id_item_cotacao === idItemCotacao);

    if (isBlankCell(rawId) || !Number.isFinite(idItemCotacao) || !item) {
      errors.push(
        `Linha ${index + 2}: "${QUOTE_ITEM_EXCEL_HEADERS.ID}" inválido ou não encontrado (${rawId ?? ""})`
      );
      return;
    }

    const quantidadeCell = row[QUOTE_ITEM_EXCEL_HEADERS.QTD_COTADA];
    const precoCell = row[QUOTE_ITEM_EXCEL_HEADERS.PRECO_UNITARIO];
    const icmsCell = row[QUOTE_ITEM_EXCEL_HEADERS.ICMS];
    const ipiCell = row[QUOTE_ITEM_EXCEL_HEADERS.IPI];
    const stCell = row[QUOTE_ITEM_EXCEL_HEADERS.ST];
    const observacaoCell = row[QUOTE_ITEM_EXCEL_HEADERS.OBSERVACAO];

    const quantidadeCotada = isBlankCell(quantidadeCell)
      ? Number(item.quantidade_cotada || 0)
      : normalizeMonetaryInput(quantidadeCell);
    const precoUnitario = isBlankCell(precoCell)
      ? Number(item.preco_unitario || 0)
      : normalizeMonetaryInput(precoCell);
    const icms = isBlankCell(icmsCell) ? Number(item.ICMS || 0) : normalizeMonetaryInput(icmsCell);
    const ipi = isBlankCell(ipiCell) ? Number(item.IPI || 0) : normalizeMonetaryInput(ipiCell);
    const st = isBlankCell(stCell) ? Number(item.ST || 0) : normalizeMonetaryInput(stCell);
    const observacao = isBlankCell(observacaoCell)
      ? item.observacao
      : String(observacaoCell).trim();

    if (quantidadeCotada < 0 || precoUnitario < 0) {
      errors.push(`Item ${idItemCotacao}: valores não podem ser negativos`);
      return;
    }
    if (quantidadeCotada > Number(item.quantidade_solicitada || 0)) {
      errors.push(`Item ${idItemCotacao}: quantidade cotada maior que a solicitada`);
      return;
    }

    updates.push({
      id_item_cotacao: idItemCotacao,
      payload: {
        id_cotacao: Number(item.id_cotacao),
        quantidade_cotada: quantidadeCotada,
        preco_unitario: precoUnitario,
        ICMS: icms,
        IPI: ipi,
        ST: st,
        observacao,
      },
    });
  });

  return { updates, errors };
};
