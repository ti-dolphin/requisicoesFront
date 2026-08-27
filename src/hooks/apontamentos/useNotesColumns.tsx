import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { TextHeader } from "../../components/TextHeader";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CommentIcon from "@mui/icons-material/Comment";
import { calculateColumnWidth } from "../../utils/calculateColumnWidth";

const getWeekDay = (dateString: string): string => {
  if (!dateString) return "-";
  const [year, month, day] = String(dateString).split("T")[0].split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const days = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  return days[date.getDay()];
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const [year, month, day] = String(dateString).split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

const FOLGA_CAMPO_TOOLTIP =
  "Registrar a primeira data para a folga ou a data do primeiro dia de retorno da folga";

const toDateInputValue = (dateValue: unknown): string => {
  if (!dateValue) return "";

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().split("T")[0];
  }

  const asString = String(dateValue).trim();
  if (!asString) return "";
  return asString.split("T")[0];
};

const getNextFolgaDate = (dateValue: unknown): string | null => {
  const baseDate = toDateInputValue(dateValue);
  if (!baseDate) return null;

  const parsedDate = new Date(`${baseDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  parsedDate.setDate(parsedDate.getDate() + 60);
  return parsedDate.toISOString().split("T")[0];
};

const getSituacaoLabel = (situacao: string): string => {
  switch (situacao) {
    case "A":
      return "Ativo";
    case "I":
      return "Inativo";
    case "P":
      return "Pendente";
    case "Z":
      return "Zerado";
    default:
      return situacao || "-";
  }
};

export function useNotesColumns(
  handleChangeFilters: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void,
  onCommentClick?: (codapont: number) => void,
  hasPermission: boolean = false,
  onEnter?: (field: string, value: string) => void
) {
  const { filters, rows } = useSelector((state: RootState) => state.notesTable);

  const columnWidths = useMemo(() => ({
    CHAPA: calculateColumnWidth(rows, 'CHAPA', 'Chapa', undefined, undefined, 70, 120),
    NOME_FUNCIONARIO: calculateColumnWidth(rows, 'NOME_FUNCIONARIO', 'Funcionário', undefined, undefined, 180, 400),
    NOME_FUNCAO: calculateColumnWidth(rows, 'NOME_FUNCAO', 'Função', undefined, undefined, 150, 350),
    NOME_GERENTE: calculateColumnWidth(rows, 'NOME_GERENTE', 'Gerente', undefined, undefined, 120, 300),
    NOME_CENTRO_CUSTO: calculateColumnWidth(rows, 'NOME_CENTRO_CUSTO', 'Centro de Custo', undefined, undefined, 150, 400),
    CODREDUZIDO: calculateColumnWidth(rows, 'CODREDUZIDO', 'Cód. Red.', undefined, undefined, 80, 150),
    DESCRICAO_STATUS: calculateColumnWidth(rows, 'DESCRICAO_STATUS', 'Status', undefined, undefined, 100, 200),
    NOME_LIDER: calculateColumnWidth(rows, 'NOME_LIDER', 'Líder', undefined, undefined, 120, 300),
    MODIFICADOPOR: calculateColumnWidth(rows, 'MODIFICADOPOR', 'Modificado Por', undefined, undefined, 120, 250),
  }), [rows]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Ações",
        width: 80,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip title="Comentários">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick?.(params.row.CODAPONT);
              }}
              sx={{ 
                color: params.row.COMENTADO ? "primary.main" : "text.secondary",
              }}
            >
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: "PONTO",
        headerName: "Ponto",
        width: 70,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          params.value ? 
            <CancelIcon sx={{ color: "red", fontSize: 18 }} /> :
            <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} />
        ),
      },
      {
        field: "ASSIDUIDADE",
        headerName: "Assiduidade",
        width: 90,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          params.value ? 
            <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} /> : 
            <CancelIcon sx={{ color: "red", fontSize: 18 }} />
        ),
      },
      {
        field: "COMENTADO",
        headerName: "Comentado",
        width: 90,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          params.value ? 
            <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} /> : 
            <CancelIcon sx={{ color: "gray", fontSize: 18 }} />
        ),
      },
      {
        field: "CHAPA",
        headerName: "Chapa",
        width: columnWidths.CHAPA,
        renderHeader: () => (
          <TextHeader
            label="Chapa"
            field="CHAPA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "NOME_FUNCIONARIO",
        headerName: "Funcionário",
        width: columnWidths.NOME_FUNCIONARIO,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
            <Typography fontSize="11px" fontWeight="bold">
              {params.value || "-"}
            </Typography>
          </Box>
        ),
        renderHeader: () => (
          <TextHeader
            label="Funcionário"
            field="NOME_FUNCIONARIO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "NOME_FUNCAO",
        headerName: "Função",
        width: columnWidths.NOME_FUNCAO,
        renderHeader: () => (
          <TextHeader
            label="Função"
            field="NOME_FUNCAO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "DATA",
        headerName: "Data",
        width: 100,
        type: "date",
        valueGetter: (value: string) => {
          const formatted = toDateInputValue(value);
          return formatted ? new Date(`${formatted}T00:00:00`) : null;
        },
        valueFormatter: (value: unknown) => formatDate(toDateInputValue(value) || ""),
      },
      {
        field: "DIA_SEMANA",
        headerName: "Dia da Semana",
        width: 120,
        valueGetter: (_value: any, row: any) => getWeekDay(row.DATA),
      },
      {
        field: "NOME_GERENTE",
        headerName: "Gerente",
        width: columnWidths.NOME_GERENTE,
        renderHeader: () => (
          <TextHeader
            label="Gerente"
            field="NOME_GERENTE"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "NOME_CENTRO_CUSTO",
        headerName: "Centro de Custo",
        width: columnWidths.NOME_CENTRO_CUSTO,
        renderHeader: () => (
          <TextHeader
            label="Centro de Custo"
            field="NOME_CENTRO_CUSTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "CODREDUZIDO",
        headerName: "CNO (CEI)",
        width: columnWidths.CODREDUZIDO,
      },
      {
        field: "DESCRICAO_STATUS",
        headerName: "Status",
        width: columnWidths.DESCRICAO_STATUS,
        renderHeader: () => (
          <TextHeader
            label="Status"
            field="DESCRICAO_STATUS"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "NOME_LIDER",
        headerName: "Líder",
        width: columnWidths.NOME_LIDER,
        renderHeader: () => (
          <TextHeader
            label="Líder"
            field="NOME_LIDER"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "DATA_ULTIMA_FOLGA_DE_CAMPO",
        headerName: "Retorno folga de campo",
        width: 185,
        type: "date",
        editable: hasPermission,
        renderHeader: () => (
          <Tooltip title={FOLGA_CAMPO_TOOLTIP} arrow>
            <Box component="span" sx={{ fontWeight: "bold", fontSize: 12 }}>
              Retorno folga de campo
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: unknown) => {
          const formatted = toDateInputValue(value);
          return formatted ? new Date(`${formatted}T00:00:00`) : null;
        },
        valueFormatter: (value: unknown) => formatDate(toDateInputValue(value) || ""),
        valueSetter: (value: unknown, row: any) => ({
          ...row,
          DATA_ULTIMA_FOLGA_DE_CAMPO: toDateInputValue(value) || null,
        }),
        preProcessEditCellProps: ({ props }: any) => {
          const rawValue = props.value;
          const normalizedValue = toDateInputValue(rawValue);
          if (!normalizedValue) {
            return { ...props, error: false };
          }

          const selectedDate = new Date(`${normalizedValue}T00:00:00`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const hasError = Number.isNaN(selectedDate.getTime()) || selectedDate > today;
          return { ...props, error: hasError };
        },
      },
      {
        field: "PROXIMA_FOLGA_DE_CAMPO",
        headerName: "Próxima folga de campo",
        width: 185,
        sortable: false,
        filterable: false,
        valueGetter: (_value: unknown, row: any) => {
          const nextDate = getNextFolgaDate(row.DATA_ULTIMA_FOLGA_DE_CAMPO);
          return nextDate ? new Date(`${nextDate}T00:00:00`) : null;
        },
        valueFormatter: (value: unknown) => {
          const formatted = toDateInputValue(value);
          return formatted ? formatDate(formatted) : "-";
        },
      },
      {
        field: "CODSITUACAO",
        headerName: "Situação",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          <Chip 
            label={getSituacaoLabel(params.value)} 
            size="small"
            color={params.value === "A" ? "success" : params.value === "I" ? "error" : "default"}
            sx={{ fontSize: 10 }}
          />
        ),
      },
      {
        field: "MODIFICADOPOR",
        headerName: "Modificado",
        width: columnWidths.MODIFICADOPOR,
      },
    ],
    [filters, handleChangeFilters, onCommentClick, columnWidths, hasPermission, onEnter]
  );

  return { columns };
}
