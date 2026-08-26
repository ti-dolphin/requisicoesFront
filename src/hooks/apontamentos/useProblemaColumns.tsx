import { GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { TextHeader } from "../../components/TextHeader";

const formatDate = (value: string | null) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

const BooleanCell = ({ value }: { value: boolean }) => {
  return value ? (
    <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} />
  ) : (
    <CancelIcon sx={{ color: "red", fontSize: 18 }} />
  );
};

export const useProblemaColumns = (
  handleChangeFilters: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void,
  onEnter?: (field: string, value: string) => void
) => {
  const { filters } = useSelector((state: RootState) => state.problemaTable);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "COMENTADO",
        headerName: "Comentado",
        width: 90,
        sortable: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params: any) => <BooleanCell value={params.value} />,
      },
      {
        field: "CHAPA",
        headerName: "Chapa",
        width: 80,
        sortable: true,
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
        headerName: "Colaborador",
        width: 250,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Colaborador"
            field="NOME_FUNCIONARIO"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "NOME_CENTRO_CUSTO",
        headerName: "Obra",
        width: 250,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Obra"
            field="NOME_CENTRO_CUSTO"
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
        sortable: true,
        valueFormatter: (params: any) => formatDate(params),
      },
      {
        field: "MOTIVO_PROBLEMA",
        headerName: "Motivo",
        width: 150,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Motivo"
            field="MOTIVO_PROBLEMA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "JUSTIFICATIVA",
        headerName: "Justificativa",
        width: 250,
        sortable: true,
        renderHeader: () => (
          <TextHeader
            label="Justificativa"
            field="JUSTIFICATIVA"
            filters={filters}
            handleChangeFilters={handleChangeFilters}
            onEnter={onEnter}
          />
        ),
      },
      {
        field: "DESCRICAO_STATUS",
        headerName: "Status",
        width: 120,
        sortable: true,
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
        field: "NOME_GERENTE",
        headerName: "Gerente",
        width: 150,
        sortable: true,
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
        field: "NOME_LIDER",
        headerName: "Líder",
        width: 150,
        sortable: true,
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
    ],
    [filters, handleChangeFilters, onEnter]
  );

  return { columns };
};
