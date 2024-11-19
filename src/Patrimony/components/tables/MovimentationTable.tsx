/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import MovimentationFileModal from "../../modals/MovimentationFileModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMovementationModal from "../../modals/DeleteMovementationModal";
import EditMovimentationObservationModal from "../../modals/EditMovimentationObservationModal";
import { MovimentationContext } from "../../context/movementationContext";
import { dateTimeRenderer, getMovementationsByPatrimonyId } from "../../utils";
import { userContext } from "../../../Requisitions/context/userContext";
import { useContext } from "react";

// Tipo Movementation
interface Movementation {
  id_movimentacao: number;
  id_projeto: number;
  id_patrimonio: number;
  id_ultima_movimentacao: number;
  responsavel?: string;
  projeto?: string;
  data: string;
  id_ultimo_responsavel?: number;
  id_responsavel: number;
  numeroMovimentacao?: number;
  observacao: string;
  aceito: number;
}

// Configuração das colunas
const columns: {
  label: string;
  width: number;
  dataKey: keyof Movementation;
}[] = [
  { label: "Projeto", width: 190, dataKey: "projeto" },
  { label: "Observação", width: 200, dataKey: "observacao" },
  { label: "Data", width: 150, dataKey: "data" },
  { label: "Responsável", width: 150, dataKey: "responsavel" },
  { label: "Nº Movimentação", width: 150, dataKey: "id_movimentacao" },
];

// Componentes para a tabela virtualizada
const VirtuosoTableComponents: TableComponents<Movementation> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead
      sx={{ boxShadow: "none", border: "none" }}
      {...props}
      ref={ref}
    />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

// Cabeçalho fixo
function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          sx={{
            width: column.width,
            backgroundColor: "background.paper",
            border: "none",
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Linha de conteúdo
const RowContent = ({
  row,
  singleMovementation,
}: {
  row: Movementation;
  singleMovementation: () => boolean;
}) => {
  const { togglEditingMovementationObservation, toggleDeletingMovementation } =
    useContext(MovimentationContext);
  const { user } = useContext(userContext);

  const handleClickDeleteMovimentation = (row: Movementation) => {
    if (singleMovementation()) {
      alert("Não é permitido excluir a única movimentação!");
      return;
    }
    if (!isWhoCreated() && !user?.PERM_ADMINISTRADOR) {
      alert(
        "Apenas quem criou ou o administrador pode excluir a movimentação!"
      );
      return;
    }
    toggleDeletingMovementation(row);
  };

  const isWhoCreated = () => user?.CODPESSOA === row.id_ultimo_responsavel;

  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          sx={{
            paddingY: "6px",
            border: "none",
            width: column.width,
            
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={
              column.dataKey === "id_movimentacao" ? "end" : "space-between"
            }
          >
            <Typography sx={{ fontSize: "12px", textAlign: "left" }}>
              {column.dataKey === "data"
                ? dateTimeRenderer(row.data)
                : row[column.dataKey] || "-"}
            </Typography>

            {column.dataKey === "projeto" && (
              <MovimentationFileModal movementationId={row.id_movimentacao} />
            )}
            {column.dataKey === "observacao" && (
              <IconButton
                onClick={() => togglEditingMovementationObservation(true, row)}
              >
                <EditIcon sx={{ color: "#F7941E" }} />
              </IconButton>
            )}
            {column.dataKey === "id_movimentacao" && (
              <IconButton onClick={() => handleClickDeleteMovimentation(row)}>
                <DeleteIcon sx={{ color: "#F7941E" }} />
              </IconButton>
            )}
          </Stack>
        </TableCell>
      ))}
    </React.Fragment>
  );
};

// Componente principal
export default function DetailMovementsTable() {
  const { id_patrimonio } = useParams();
  const [movementations, setMovementations] = React.useState<Movementation[]>(
    []
  );
  const { refreshMovimentation } = useContext(MovimentationContext);

  const fetchMovementations = async () => {
    const movementationsData = await getMovementationsByPatrimonyId(
      Number(id_patrimonio)
    );
    if (movementationsData) setMovementations([...movementationsData]);
  };

  const singleMovementation = () => movementations.length === 1;

  React.useEffect(() => {
    fetchMovementations();
  }, [refreshMovimentation]);

  return (
    <Box sx={{ height: "90%", width: "100%", padding: 0, boxShadow: "none" }}>
      <TableVirtuoso
      style={{boxShadow: 'none'}}
        data={movementations}
        components={{
          ...VirtuosoTableComponents,
          TableRow: (props) => (
            <TableRow
              {...props}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#e7eaf6" },
              }}
            />
          ),
        }}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(_index, row) => (
          <RowContent row={row} singleMovementation={singleMovementation} />
        )}
      />
      <DeleteMovementationModal />
      <EditMovimentationObservationModal />
    </Box>
  );
}
