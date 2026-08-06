import React, { useState, useMemo, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { debounce } from "lodash";
import { OpportunityFilters } from "../hooks/oportunidades/useOpportunityFilters";
import { RequisitionFilters } from "../redux/slices/requisicoes/requisitionTableSlice";
import { PatrimonyFilters } from "../redux/slices/patrimonios/PatrimonyTableSlice";
import { NotesFilters } from "../redux/slices/apontamentos/notesTableSlice";
import { PontoFilters } from "../redux/slices/apontamentos/pontoTableSlice";
import { ProblemaFilters } from "../redux/slices/apontamentos/problemaTableSlice";
import { OrdemCompraFilters } from "../redux/slices/ordensCompra/ordemCompraTableSlice";

interface TextHeaderProps {
  label: string;
  field: string;
  filters:
    | OpportunityFilters
    | RequisitionFilters
    | PatrimonyFilters
    | NotesFilters
    | PontoFilters
    | ProblemaFilters
    | OrdemCompraFilters; 
  handleChangeFilters: (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => void;
}

export const TextHeader: React.FC<TextHeaderProps> = ({
  label,
  field,
  filters,
  handleChangeFilters,
}) => {
  const filterValue = filters[field as keyof typeof filters] ? String(filters[field as keyof typeof filters]) : "";
  const [localValue, setLocalValue] = useState<string>();
  const isTypingRef = React.useRef(false);

  const debouncedSync = useMemo(
    () =>
      debounce((value: string) => {
        handleChangeFilters(
          { target: { value: value === "" ? "" : value } } as any,
          field
        );
        isTypingRef.current = false;
      }, 600),
    [handleChangeFilters, field]
  );

  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(filterValue);
    }
  }, [filterValue]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <TextField
        placeholder={label}
        variant="standard"
        size="small"
        type="text"
        value={localValue || ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          isTypingRef.current = true;
          setLocalValue(value);
          debouncedSync(value);
        }}
        InputProps={{
          sx: { fontSize: "12px" },
        }}
      />
    </Box>
  );
};
