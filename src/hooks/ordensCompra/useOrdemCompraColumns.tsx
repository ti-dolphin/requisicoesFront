import { useMemo } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { TextHeader } from "../../components/TextHeader";
import { calculateColumnWidth } from "../../utils/calculateColumnWidth";
import { formatCurrency, getDateStringFromISOstring } from "../../utils";
import { OrdemCompra } from "../../models/OrdemCompra";

export function useOrdemCompraColumns(
  handleChangeFilters: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void,
  rows: any[] = [],
  onOpenRequisitions?: (order: OrdemCompra) => void
) {
  const { filters } = useSelector((state: RootState) => state.ordemCompraTable);

  const columnWidths = useMemo(() => {
    return {
      ID: calculateColumnWidth(rows, "ID", "ID", undefined, "12px Roboto", 80),
      COLIGADA: calculateColumnWidth(rows, "COLIGADA", "Coligada", undefined, "12px Roboto", 90),
      COD_CENTRO_CUSTO: calculateColumnWidth(rows, "COD_CENTRO_CUSTO", "Cod Centro de Custo"),
      CENTRO_CUSTO: calculateColumnWidth(rows, "CENTRO_CUSTO", "Centro de Custo", undefined, "12px Roboto", 140),
      NUMERO_MOVIMENTO: calculateColumnWidth(rows, "NUMERO_MOVIMENTO", "Numero Movimento", undefined, "12px Roboto", 140),
      DATA_EMISSAO: calculateColumnWidth(rows, "DATA_EMISSAO", "Data Emissao", getDateStringFromISOstring, "12px Roboto", 130),
      DATA_ENTREGA: calculateColumnWidth(rows, "DATA_ENTREGA", "Data Entrega", getDateStringFromISOstring, "12px Roboto", 130),
      VALOR_BRUTO: calculateColumnWidth(rows, "VALOR_BRUTO", "Valor Bruto", (value) => formatCurrency(Number(value || 0)), "12px Roboto", 130),
      FORNECEDOR: calculateColumnWidth(rows, "FORNECEDOR", "Fornecedor", undefined, "12px Roboto", 160),
      FORNECEDOR_NOME_FANTASIA: calculateColumnWidth(rows, "FORNECEDOR_NOME_FANTASIA", "Fornecedor Nome Fantasia", undefined, "12px Roboto", 200),
    };
  }, [rows]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ID",
        headerName: "ID",
        width: columnWidths.ID,
        renderHeader: () => (
          <TextHeader
            label="ID"
            field="ID"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "COLIGADA",
        headerName: "Coligada",
        width: columnWidths.COLIGADA,
        renderHeader: () => (
          <TextHeader
            label="Coligada"
            field="COLIGADA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "COD_CENTRO_CUSTO",
        headerName: "Cod Centro de Custo",
        width: columnWidths.COD_CENTRO_CUSTO,
        renderHeader: () => (
          <TextHeader
            label="Cod Centro de Custo"
            field="COD_CENTRO_CUSTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "CENTRO_CUSTO",
        headerName: "Centro de Custo",
        width: columnWidths.CENTRO_CUSTO,
        renderHeader: () => (
          <TextHeader
            label="Centro de Custo"
            field="CENTRO_CUSTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "NUMERO_MOVIMENTO",
        headerName: "Numero Movimento",
        width: columnWidths.NUMERO_MOVIMENTO,
        renderHeader: () => (
          <TextHeader
            label="Numero Movimento"
            field="NUMERO_MOVIMENTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "REQUISICAO",
        headerName: "Requisição",
        width: 140,
        sortable: false,
        filterable: false,
        renderHeader: () => (
          <Typography fontSize="12px" fontWeight={600}>
            Requisição
          </Typography>
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Button
            size="small"
            variant="text"
            onClick={(event) => {
              event.stopPropagation();
              onOpenRequisitions?.(params.row as OrdemCompra);
            }}
            sx={{ fontSize: "11px", textTransform: "none" }}
          >
            Ver requisições
          </Button>
        ),
      },
      {
        field: "DATA_EMISSAO",
        headerName: "Data Emissao",
        width: columnWidths.DATA_EMISSAO,
        valueGetter: (value) => getDateStringFromISOstring(value),
        renderHeader: () => (
          <TextHeader
            label="Data Emissao"
            field="DATA_EMISSAO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "DATA_ENTREGA",
        headerName: "Data Entrega",
        width: columnWidths.DATA_ENTREGA,
        valueGetter: (value) => getDateStringFromISOstring(value),
        renderHeader: () => (
          <TextHeader
            label="Data Entrega"
            field="DATA_ENTREGA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "VALOR_BRUTO",
        headerName: "Valor Bruto",
        width: columnWidths.VALOR_BRUTO,
        renderHeader: () => (
          <TextHeader
            label="Valor Bruto"
            field="VALOR_BRUTO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography fontSize="12px">
              {formatCurrency(Number(params.value || 0))}
            </Typography>
          </Box>
        ),
      },
      {
        field: "FORNECEDOR",
        headerName: "Fornecedor",
        width: columnWidths.FORNECEDOR,
        renderHeader: () => (
          <TextHeader
            label="Fornecedor"
            field="FORNECEDOR"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
      {
        field: "FORNECEDOR_NOME_FANTASIA",
        headerName: "Fornecedor Nome Fantasia",
        width: columnWidths.FORNECEDOR_NOME_FANTASIA,
        renderHeader: () => (
          <TextHeader
            label="Fornecedor Nome Fantasia"
            field="FORNECEDOR_NOME_FANTASIA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize="12px">{params.value}</Typography>
        ),
      },
    ],
    [columnWidths, filters, handleChangeFilters, onOpenRequisitions]
  );

  return { columns };
}
