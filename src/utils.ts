import { DateTime } from "luxon";

export function normalizeText(value?: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim();
}

//retorna uma data a partir de uma string no formato yyyy-MM-dd
export function getDateFromDateString(dateString: string | null): Date | null {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const dt = DateTime.utc(year, month, day, 3, 0);

  if (!dt.isValid || dt.year <= 2000) return null;

  return dt.toUTC().toJSDate(); 
}
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

type CurrencyFormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

type DecimalFormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const MONEY_SCALE = 3;

export const MONEY_2_TO_3_FORMAT: Required<CurrencyFormatOptions> = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
};

export function roundToScale(value: number, scale = MONEY_SCALE): number {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(scale));
}

export function formatCurrency(
  value: number,
  options?: CurrencyFormatOptions
): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}

export function formatCurrency2To3(value: number): string {
  return formatCurrency(value, MONEY_2_TO_3_FORMAT);
}

export function formatDecimalPtBr(
  value: number,
  options?: DecimalFormatOptions
): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}

export function formatDecimalPtBr2To3(value: number): string {
  return formatDecimalPtBr(value, MONEY_2_TO_3_FORMAT);
}

export function calculateQuoteSubtotal(
  precoUnitario: number,
  quantidadeCotada: number,
  ipiPercent: number,
  stPercent: number
): number {
  const subtotal = precoUnitario * quantidadeCotada * (1 + ipiPercent / 100 + stPercent / 100);
  return roundToScale(subtotal, MONEY_SCALE);
}

export function calculateUnitPriceWithIpi(
  precoUnitario: number,
  ipiPercent: number
): number {
  const priceWithIpi = precoUnitario * (1 + ipiPercent / 100);
  return roundToScale(priceWithIpi, MONEY_SCALE);
}

export function calculateUnitPriceWithTaxes(
  precoUnitario: number,
  ipiPercent: number,
  stPercent: number
): number {
  const priceWithTaxes = precoUnitario * (1 + ipiPercent / 100 + stPercent / 100);
  return roundToScale(priceWithTaxes, MONEY_SCALE);
}

export function calculateLineTotalWithIpi(
  precoUnitario: number,
  quantidade: number,
  ipiPercent: number
): number {
  const totalWithIpi = precoUnitario * quantidade * (1 + ipiPercent / 100);
  return roundToScale(totalWithIpi, MONEY_SCALE);
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Remove R$, pontos (separador de milhar) e substitui vírgula por ponto
  const numericValue = value
    .replace(/R\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();
  return parseFloat(numericValue) || 0;
}

//retorna uma string no formato yyyy-MM-dd a partir de uma string no formato iso
export const getDateStringFromISOstring = (isoDate: string | undefined | null): string => {
  if (!isoDate) return "";
  const dt = DateTime.fromISO(isoDate, { zone: "utc" });
  return dt.isValid ? dt.toFormat("dd/MM/yyyy HH:mm") : "";
};

export function getDateStringFromDateObject(date: Date): string {
  const dt = DateTime.fromJSDate(date, { zone: "utc" });
  return dt.toFormat("dd/MM/yyyy"); // ou .toLocaleString(DateTime.DATE_SHORT) para pt-BR
}

export const formatDateToISOstring = (date: Date): string | null => {
  return DateTime.fromJSDate(date, { zone: "utc" }).toISO();
};

export const formatDateStringtoISOstring = (dateString: string): string => {
  const dt = DateTime.fromISO(dateString, { zone: "utc" });

  return dt.isValid ? dt.toISO() : "";
};

export const getDateFromISOstring = (ISOstring: string) => {
  try {
    // Parse como UTC mas converte para data local sem ajuste de timezone
    // Isso garante que a data mostrada seja exatamente a mesma que está no banco
    const dt = DateTime.fromISO(ISOstring, { zone: "utc" }).setZone("local", { keepLocalTime: true });
    return dt.isValid ? dt.toJSDate() : null;
  } catch (error) {
    return null;
  }
};

export const getDateKey = (value: any): string => {
  if (!value) return "";
  const date =
    value instanceof Date ? value : getDateFromISOstring(String(value));
  if (!date || isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const normalizeOcValue = (value: any): string => {
  const text = String(value ?? "").trim();
  return text === "0" ? "" : text;
};

/**
 * Extrai a parte "YYYY-MM-DD" de uma string de data (ex: "2024-06-10 15:00:00" -> "2024-06-10").
 * Retorna string vazia se valor inválido.
 */
export function getDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return "";
  // Aceita formatos "YYYY-MM-DD" ou "YYYY-MM-DD HH:mm:ss"
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

/**
 * Verifica o nível de urgência da requisição com base no tempo no status.
 * Retorna:
 * - 'critical' se está há 5 dias ou mais em Aprovação Gerente ou Diretoria (vermelho)
 * - 'warning' se está há 3 dias ou mais em Aprovação Gerente ou Diretoria (amarelo)
 * - null se não precisa destaque
 */
export function getRequisitionUrgencyLevel(
  statusId: number,
  dataUltimaAlteracaoStatus: string | null | undefined
): 'critical' | 'warning' | null {
  // Verifica se é um dos status de aprovação que devem ser monitorados
  const statusAprovacao = [2, 6, 7]; // 6 = Aprovação Gerente, 7 = Aprovação Diretoria
  if (!statusAprovacao.includes(statusId)) {
    return null;
  }

  // Verifica se há data da última alteração
  if (!dataUltimaAlteracaoStatus) {
    return null;
  }

  // Calcula dias desde a última alteração de status
  const dataAlteracao = DateTime.fromISO(dataUltimaAlteracaoStatus, { zone: "utc" });
  if (!dataAlteracao.isValid) {
    return null;
  }

  const agora = DateTime.utc();
  const diasNoStatus = agora.diff(dataAlteracao, 'days').days;

  // Define o nível de urgência baseado nos dias
  if (diasNoStatus >= 3) {
    return 'critical'; // Vermelho
  } else if (diasNoStatus >= 2) {
    return 'warning'; // Amarelo
  }

  return null;
}
