const MONEY_SCALE = 3;
const REEDIT_EPSILON = 0.0005;

const roundToScale = (value: number, scale = MONEY_SCALE): number =>
  Number.isFinite(value) ? Number(value.toFixed(scale)) : 0;

const isEmpty = (value: unknown): boolean =>
  value === "" || value === null || value === undefined;

const sanitizeMonetaryRaw = (value: string): string =>
  value.replace(/\s+/g, "").replace(/[^\d.,-]/g, "");

const parseBrazilianDecimal = (unsigned: string, sign: number): number => {
  const lastCommaIndex = unsigned.lastIndexOf(",");
  const integerPartRaw = unsigned.slice(0, lastCommaIndex);
  const decimalPartRaw = unsigned.slice(lastCommaIndex + 1);

  const integerDigits = integerPartRaw.replace(/\./g, "").replace(/\D/g, "") || "0";
  const decimalDigits = decimalPartRaw.replace(/\D/g, "").slice(0, MONEY_SCALE);

  const normalized = decimalDigits
    ? `${integerDigits}.${decimalDigits}`
    : integerDigits;

  return roundToScale(sign * Number(normalized));
};

const parseIntegerWithThousandSeparator = (unsigned: string, sign: number): number => {
  const integerDigits = unsigned.replace(/\./g, "").replace(/\D/g, "") || "0";
  return roundToScale(sign * Number(integerDigits));
};

const parseDotAmbiguous = (
  unsigned: string,
  sign: number,
  previousValue?: number
): number => {
  const groups = unsigned.split(".").filter(Boolean);
  if (groups.length === 0) return 0;

  const lastGroup = groups[groups.length - 1];

  if (groups.length === 2 && lastGroup.length <= 2) {
    const integerDigits = groups[0].replace(/\D/g, "") || "0";
    return roundToScale(sign * Number(`${integerDigits}.${lastGroup}`));
  }

  if (lastGroup.length === 3 && previousValue !== undefined) {
    const integerDigits = groups.slice(0, -1).join("").replace(/\D/g, "") || "0";
    const decimalCandidate = sign * Number(`${integerDigits}.${lastGroup}`);
    if (
      Number.isFinite(decimalCandidate) &&
      Math.abs(decimalCandidate - Number(previousValue)) < REEDIT_EPSILON
    ) {
      return roundToScale(decimalCandidate);
    }
  }

  return parseIntegerWithThousandSeparator(unsigned, sign);
};

export const normalizeMonetaryInput = (
  value: unknown,
  previousValue?: number
): number => {
  if (isEmpty(value)) return 0;

  if (typeof value === "number") {
    return roundToScale(value);
  }

  const raw = String(value).trim();
  if (!raw) return 0;

  const cleaned = sanitizeMonetaryRaw(raw);
  if (!cleaned) return 0;

  const sign = cleaned.startsWith("-") ? -1 : 1;
  const unsigned = cleaned.replace(/-/g, "");
  if (!unsigned) return 0;

  if (unsigned.includes(",")) {
    return parseBrazilianDecimal(unsigned, sign);
  }

  if (unsigned.includes(".")) {
    return parseDotAmbiguous(unsigned, sign, previousValue);
  }

  return roundToScale(sign * Number(unsigned));
};

export const parseMonetaryInput = (value: unknown): number =>
  normalizeMonetaryInput(value);
