import { GridColDef } from "@mui/x-data-grid";
import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Checkbox } from "@mui/material";
import { TextHeader } from "../../components/TextHeader";
import { calculateColumnWidth } from "../../utils/calculateColumnWidth";

const formatDate = (value: string | null) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value: string | null) => {
  if (!value) return "";

  const rawValue = String(value).trim();
  const normalizedValue = rawValue.includes("T")
    ? rawValue
    : rawValue.replace(" ", "T");

  const parsedDate = new Date(normalizedValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    const seconds = String(parsedDate.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const [datePart, timePart] = rawValue.split("T");
  if (!datePart) return rawValue;
  const [year, month, day] = datePart.split("-");
  if (!timePart) return `${day}/${month}/${year}`;
  const time = timePart.replace("Z", "").split(".")[0];
  return `${day}/${month}/${year} ${time}`;
};

export const usePontoColumns = (
  handleChangeFilters: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void,
  onToggleField?: (codapont: number, field: string, nextValue: boolean) => void,
  hasPermission?: boolean,
  hasJustificativaPermission?: boolean
) => {
  const { filters, rows } = useSelector((state: RootState) => state.pontoTable);

  // Calculate widths for each column based on content using centralized function
  const columnWidths = useMemo(() => ({
    CHAPA: calculateColumnWidth(rows, 'CHAPA', 'Chapa', undefined, undefined, 70, 120),
    NOME_FUNCIONARIO: calculateColumnWidth(rows, 'NOME_FUNCIONARIO', 'Nome', undefined, undefined, 180, 400),
    DESCRICAO_STATUS: calculateColumnWidth(rows, 'DESCRICAO_STATUS', 'Status', undefined, undefined, 100, 200),
    NOME_CENTRO_CUSTO: calculateColumnWidth(rows, 'NOME_CENTRO_CUSTO', 'Centro de Custo', undefined, undefined, 150, 400),
    NOME_LIDER: calculateColumnWidth(rows, 'NOME_LIDER', 'Líder', undefined, undefined, 150, 300),
    MOTIVO_PROBLEMA: calculateColumnWidth(rows, 'MOTIVO_PROBLEMA', 'Motivo', undefined, undefined, 200, 500),
    JUSTIFICADO_POR: calculateColumnWidth(rows, 'JUSTIFICADO_POR', 'Justificado Por', undefined, undefined, 120, 250),
    JUSTIFICATIVA: calculateColumnWidth(rows, 'JUSTIFICATIVA', 'Justificativa', undefined, undefined, 200, 500),
  }), [rows]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "CHAPA",
        headerName: "Chapa",
        width: columnWidths.CHAPA,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Chapa"
            field="CHAPA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "NOME_FUNCIONARIO",
        headerName: "Nome",
        width: columnWidths.NOME_FUNCIONARIO,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Nome"
            field="NOME_FUNCIONARIO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "DATA",
        headerName: "Data",
        width: 100,
        sortable: true,
        valueFormatter: (params: any) => formatDate(params),
      },
      {
        field: "DESCRICAO_STATUS",
        headerName: "Status",
        width: columnWidths.DESCRICAO_STATUS,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Status"
            field="DESCRICAO_STATUS"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "NOME_CENTRO_CUSTO",
        headerName: "Centro de Custo",
        width: columnWidths.NOME_CENTRO_CUSTO,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Centro de Custo"
            field="NOME_CENTRO_CUSTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "NOME_LIDER",
        headerName: "Líder",
        width: columnWidths.NOME_LIDER,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Líder"
            field="NOME_LIDER"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "VERIFICADO",
        headerName: "Verificado",
        width: 90,
        sortable: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params: any) => (
          <Checkbox
            checked={!!params.value}
            size="small"
            disabled={!hasPermission}
            onChange={(e, checked) => {
              e.stopPropagation();
              if (hasPermission) {
                onToggleField?.(params.row.CODAPONT, "VERIFICADO", checked);
              }
            }}
            sx={{ padding: 0 }}
            title={!hasPermission ? "Você não tem permissão para alterar este campo" : ""}
          />
        ),
      },
      {
        field: "PROBLEMA",
        headerName: "Problema",
        width: 90,
        sortable: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params: any) => (
          <Checkbox
            checked={!!params.value}
            size="small"
            disabled={!hasPermission}
            onChange={(e, checked) => {
              e.stopPropagation();
              if (hasPermission) {
                onToggleField?.(params.row.CODAPONT, "PROBLEMA", checked);
              }
            }}
            sx={{ padding: 0 }}
            title={!hasPermission ? "Você não tem permissão para alterar este campo" : ""}
          />
        ),
      },
      {
        field: "AJUSTADO",
        headerName: "Ajustado",
        width: 90,
        sortable: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params: any) => (
          <Checkbox
            checked={!!params.value}
            size="small"
            disabled={!hasPermission}
            onChange={(e, checked) => {
              e.stopPropagation();
              if (hasPermission) {
                onToggleField?.(params.row.CODAPONT, "AJUSTADO", checked);
              }
            }}
            sx={{ padding: 0 }}
            title={!hasPermission ? "Você não tem permissão para alterar este campo" : ""}
          />
        ),
      },
      {
        field: "DATA_HORA_MOTIVO",
        headerName: "Data Motivo",
        width: 150,
        sortable: true,
        valueFormatter: (params: any) => formatDateTime(params),
      },
      {
        field: "MOTIVO_PROBLEMA",
        headerName: "Motivo",
        width: columnWidths.MOTIVO_PROBLEMA,
        sortable: true,
        editable: hasPermission,
        valueGetter: (value: string) => value || "",
        renderCell: (params: any) => {
          const shouldHighlight = !!params.row?.PROBLEMA && !params.row?.AJUSTADO;
          return (
            <span style={{ color: shouldHighlight ? "#d32f2f" : "inherit" }}>
              {params.value || ""}
            </span>
          );
        },
        renderHeader: () => (
          <TextHeader
            label="Motivo"
            field="MOTIVO_PROBLEMA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "DATA_HORA_JUSTIFICATIVA",
        headerName: "Data Justificativa",
        width: 150,
        sortable: true,
        valueFormatter: (params: any) => formatDateTime(params),
      },
      {
        field: "JUSTIFICADO_POR",
        headerName: "Justificado por",
        width: columnWidths.JUSTIFICADO_POR,
        sortable: true,
      },
      {
        field: "JUSTIFICATIVA",
        headerName: "Justificativa",
        width: columnWidths.JUSTIFICATIVA,
        sortable: true,
        editable: hasJustificativaPermission,
        valueGetter: (value: string) => value || "",
      },
    ],
    [filters, handleChangeFilters, onToggleField, hasPermission, hasJustificativaPermission, columnWidths]
  );

  return { columns };
};
