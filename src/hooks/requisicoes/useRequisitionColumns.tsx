import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Project } from "../../models/Project";
import { ReducedUser } from "../../models/User";
import { RequisitionStatus } from "../../models/requisicoes/RequisitionStatus";
import { formatCurrency, getDateFromISOstring } from "../../utils";
import { Box, IconButton, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MutableRefObject, useMemo } from "react";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setRequisitionBeingDeletedId } from "../../redux/slices/requisicoes/requisitionTableSlice";
import { TextHeader } from "../../components/TextHeader";
import { calculateColumnWidth } from "../../utils/calculateColumnWidth";

const getTypeByTipoFaturamento = (tipoFaturamento: any) => {
  switch (tipoFaturamento) {
    case 1:
      return "Faturamento Dolphin";
    case 2:
      return "Faturamento Direto";
    case 3:
      return "Compras Operacional";
    case 4:
      return "Estoque";
    case 5:
      return "Estoque Operacional";
    case 6:
      return "Compras TI";
    case 7:
      return "Estoque TI";
    default:
      return "-";
  }
};

export function useRequisitionColumns(
  handleChangeFilters : (event: React.ChangeEvent<HTMLInputElement>, field: string) => void,
  changeSelectedRow: (row: any) => void,
  _gridRef: MutableRefObject<GridApiCommunity>,
  rows: any[] = []
) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { filters } = useSelector((state: RootState) => state.requisitionTable);

  const columnWidths = useMemo(() => {
    return {
      ID_REQUISICAO: calculateColumnWidth(rows, "ID_REQUISICAO", "ID", undefined, "12px Roboto", 80),
      DESCRIPTION: calculateColumnWidth(rows, "DESCRIPTION", "Descrição", undefined, "bold 12px Roboto"),
      projeto: calculateColumnWidth(rows, "projeto", "Projeto", (project: Project) => project?.DESCRICAO || '', "12px Roboto"),
      responsavel: calculateColumnWidth(rows, "responsavel", "Requisitante", (user: ReducedUser) => user?.NOME || '', "12px Roboto"),
      status: calculateColumnWidth(rows, "status", "Status", (status: RequisitionStatus) => status?.nome || '', "12px Roboto"),
      custo_total: calculateColumnWidth(rows, "custo_total", "Custo Total", (value) => formatCurrency(Number(value || 0)), "12px Roboto"),
      gerente: calculateColumnWidth(rows, "gerente", "Gerente", (user: ReducedUser) => user?.NOME || '', "12px Roboto"),
      responsavel_projeto: calculateColumnWidth(rows, "responsavel_projeto", "Responsável Projeto", (user: ReducedUser) => user?.NOME || '', "12px Roboto"),
      comprador: calculateColumnWidth(rows, "comprador", "Comprador", (user: ReducedUser) => user?.NOME || '', "12px Roboto"),
      tipo_faturamento: calculateColumnWidth(rows, "tipo_faturamento", "Tipo", (value) => getTypeByTipoFaturamento(value), "12px Roboto"),
      data_requisitado: calculateColumnWidth(rows, "data_requisitado", "Data Requisitado", undefined, "12px Roboto"),
      data_ultima_alteracao_status: calculateColumnWidth(rows, "data_ultima_alteracao_status", "Data do Status", undefined, "12px Roboto"),
    };
  }, [rows]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ID_REQUISICAO",
        headerName: "ID",
        width: columnWidths.ID_REQUISICAO,
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
            <TextHeader
              label={"ID"}
              field={"ID_REQUISICAO"}
              filters={filters}
              handleChangeFilters={handleChangeFilters}
            />
          ),
      },
      {
        field: "DESCRIPTION",
        headerName: "Descrição",
        width: columnWidths.DESCRIPTION,
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Descrição"}
            field={"DESCRIPTION"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "projeto",
        headerName: "Projeto",
        width: columnWidths.projeto,
        valueGetter: (project: Project) => {
          return project?.DESCRICAO || '';
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Projeto"}
            field={"projeto"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "responsavel",
        headerName: "Requisitante",
        width: columnWidths.responsavel,
        valueGetter: (user: ReducedUser) => {
          return user?.NOME || '';
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Requisitante"}
            field={"responsavel"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: columnWidths.status,
        valueGetter: (status: RequisitionStatus) => {
          return status ? status.nome : "";
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Status"}
            field={"status"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "custo_total",
        headerName: "Custo Total",
        width: columnWidths.custo_total,
        type: "number",
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {formatCurrency(Number(params.value))}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "gerente",
        headerName: "Gerente",
        width: columnWidths.gerente,
        valueGetter: (user: ReducedUser) => {
          return user?.NOME || '';
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Gerente"}
            field={"gerente"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "responsavel_projeto",
        headerName: "Responsável Projeto",
        width: columnWidths.responsavel_projeto,
        valueGetter: (user: ReducedUser) => {
          return user?.NOME || '';
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Responsável Projeto"}
            field={"responsavel_projeto"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "comprador",
        headerName: "Comprador",
        width: columnWidths.comprador,
        valueGetter: (user: ReducedUser) => {
          return user ? user.NOME || '' : '';
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Comprador"}
            field={"comprador"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "tipo_faturamento",
        headerName: "Tipo",
        width: columnWidths.tipo_faturamento,
        valueGetter: (tipoFaturamento: number) => {
          return getTypeByTipoFaturamento(tipoFaturamento);
        },
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "text.primary",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
        renderHeader: () => (
          <TextHeader
            label={"Tipo"}
            field={"tipo_faturamento"}
            filters={filters}
            handleChangeFilters={handleChangeFilters}
          />
        ),
      },
      {
        field: "data_requisitado",
        headerName: "Data Requisitado",
        width: columnWidths.data_requisitado,
        type: "date",
        valueGetter: (value: string) => (value ? getDateFromISOstring(value) : null),
      },
      {
        field: "data_ultima_alteracao_status",
        headerName: "Data do Status",
        width: columnWidths.data_ultima_alteracao_status,
        type: "date",
        valueGetter: (value: string) => (value ? getDateFromISOstring(value) : null),
      },
      {
        field: "actions",
        headerName: "",
        width: 100,
        renderCell: (params: GridRenderCellParams) => {
          const { row } = params;
          return (
            <Box
              sx={{ zIndex: 30, display: "flex", alignItems: "center", gap: 1 }}
            >
              <IconButton
                onClick={() => {
                  changeSelectedRow(row);
                }}
                sx={{ color: "primary.main" }}
              >
                <VisibilityIcon />
              </IconButton>
              {user?.PERM_ADMINISTRADOR === 1 && (
                <IconButton
                  onClick={() => {
                    dispatch(setRequisitionBeingDeletedId(row.ID_REQUISICAO));
                  }}
                >
                  <DeleteIcon sx={{ color: "error.main" }} />
                </IconButton>
              )}
            </Box>
          );
        },
      },
    ],
    [filters, columnWidths, user, dispatch]
  );

  return { columns };
}
