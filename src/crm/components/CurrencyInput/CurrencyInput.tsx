import React, { useState, useRef, useEffect } from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface CurrencyInputProps
  extends Omit<TextFieldProps, "onChange" | "value"> {
  value: number | null; // Valor numérico real (ex.: 1234.56)
  onChange: (value: number | null) => void; // Callback para atualizar o valor
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(""); // Valor formatado para exibição
  const inputRef = useRef<HTMLInputElement>(null);

  // Formatar o valor numérico para exibição (R$ 1.234,56)
  const formatValue = (num: number | null): string => {
    if (num === null || isNaN(num)) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Atualizar o valor exibido quando o prop value mudar
  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value]);

  // Lidar com a entrada do usuário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remover caracteres não numéricos, exceto vírgula
    const cleanedValue = input
      .replace(/[^\d,]/g, "") // Remove tudo exceto números e vírgula
      .replace(",", "."); // Converte vírgula para ponto para conversão numérica

    // Converter para número
    const numericValue = cleanedValue ? parseFloat(cleanedValue) : null;

    // Atualizar o valor real
    onChange(numericValue);

    // Atualizar o valor exibido
    setDisplayValue(formatValue(numericValue));

    // Ajustar a posição do cursor
    const cursorPosition = e.target.selectionStart;
    if (cursorPosition !== null && inputRef.current) {
      const newCursorPosition =
        cursorPosition + (formatValue(numericValue).length - input.length);
      setTimeout(() => {
        inputRef.current?.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }, 0);
    }
  };

  return (
    <TextField
      {...props}
      inputRef={inputRef}
      value={displayValue}
      onChange={handleChange}
      placeholder="R$ 0,00"
      inputProps={{
        inputMode: "decimal", // Teclado numérico no mobile
        style: { textAlign: "left" },
      }}
    />
  );
};

export default CurrencyInput;
