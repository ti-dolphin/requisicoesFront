import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import { IconButton, Stack, Typography } from "@mui/material";
import { Movementation } from "../../types";
import MovimentationFileModal from "../../modals/MovimentationFileModal";
import EditIcon from "@mui/icons-material/Edit";
import { MovimentationContext } from "../../context/movementationContext";
import { useContext } from "react";
import EditMovimentationObservationModal from "../../modals/EditMovimentationObservationModal";
import { dateTimeRenderer, getMovementationsByPatrimonyId } from "../../utils";
import { useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMovementationModal from "../../modals/DeleteMovementationModal";
import { userContext } from "../../../Requisitions/context/userContext";

// Define the interface for the new data structure

// Column data configuration
interface ColumnData {
  dataKey: keyof Movementation;
  label: string;
  numeric?: boolean;
  width: number;
}

const columns: ColumnData[] = [
  {
    width: 170, // 28.33% do total
    label: "Projeto",
    dataKey: "projeto",
    numeric: false,
  },
  {
    width: 170, // 28.33% do total
    label: "Observação",
    dataKey: "observacao",
    numeric: false,
  },
  {
    width: 100, // 16.67% do total
    label: "Data",
    dataKey: "data",
    numeric: false,
  },
  {
    width: 110, // 18.33% do total
    label: "Responsável",
    dataKey: "responsavel",
    numeric: false,
  },
  {
    width: 50, // 8.33% do total
    label: "Nº Movimentação",
    dataKey: "id_movimentacao",
    numeric: true,
  },
];

// Sample dummy data

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
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric ? "right" : "left"}
          style={{ width: column.width }}
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

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
      console.log("singleMov");
      alert("Não é permitido excluir a única movimentação!");
    }
    if (!isWhoCreated()) {
      alert("Apenas quem criou pode excluir a movimentação!");
      return;
    }
    toggleDeletingMovementation(row);
  };

  const isWhoCreated = () => {
    return user?.CODPESSOA === row.id_ultimo_responsavel;
  };

  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          sx={{ paddingY: "0", border: "0.5px solid" }}
          key={column.dataKey}
          align={column.numeric ? "right" : "left"}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent={
              column.dataKey === "id_movimentacao" ? "end" : "space-between"
            }
          >
            <Typography
              sx={{
                fontSize: "12px",
                textAlign: "left",
                textTransform: "capitalize",
              }}
            >
              {column.dataKey === "data"
                ? dateTimeRenderer(row.data)
                : String(row[column.dataKey])}
            </Typography>

            {column.dataKey === "projeto" ? (
              <MovimentationFileModal movementationId={row.id_movimentacao} />
            ) : column.dataKey === "observacao" ? (
              <IconButton
                onClick={() => {
                  togglEditingMovementationObservation(true, row);
                }}
              >
                <EditIcon sx={{ color: "#F7941E" }} />
              </IconButton>
            ) : column.dataKey === "id_movimentacao" ? (
              <IconButton onClick={() => handleClickDeleteMovimentation(row)}>
                <DeleteIcon sx={{ color: "#F7941E" }} />
              </IconButton>
            ) : (
              ""
            )}
          </Stack>
        </TableCell>
      ))}
    </React.Fragment>
  );
};

//MAIN COMPONENT
export default function DetailMovementsTable() {
  const { id_patrimonio } = useParams();
  const [movementations, setMovementations] = React.useState<Movementation[]>(
    []
  );
  const { refreshMovimentation } = useContext(MovimentationContext);
  // const { user }= useContext(userContext);

  const fetchMovementations = async () => {
    const movementationsData = await getMovementationsByPatrimonyId(
      Number(id_patrimonio)
    );
    if (movementationsData) {
      console.log("movementationsData: ", movementationsData);
      setMovementations([...movementationsData]);
    }
  };

  const singleMovementation = () => {
    return movementations.length === 0;
  };

  React.useEffect(() => {
    fetchMovementations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMovimentation]);

  return (
    <Paper
      className="border bg-slate-300"
      style={{ height: "90%", width: "100%" }}
    >
      <TableVirtuoso
        data={movementations}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(_index, row) => (
          <RowContent row={row} singleMovementation={singleMovementation} />
        )}
      />
      <DeleteMovementationModal />
      <EditMovimentationObservationModal />
    </Paper>
  );
}
