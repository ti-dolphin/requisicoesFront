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
import { Box, Button, CircularProgress, IconButton, Modal, Stack, styled, Tooltip, Typography } from "@mui/material";
import { Movementation } from "../../types";
import MovimentationFileModal from "../../modals/MovimentationFileModal";
import EditIcon from "@mui/icons-material/Edit";
import { MovimentationContext } from "../../context/movementationContext";
import { SetStateAction, useContext, useState } from "react";
import EditMovimentationObservationModal from "../../modals/EditMovimentationObservationModal";
import { acceptMovementation, createMovementationfile, dateTimeRenderer, getMovementationsByPatrimonyId } from "../../utils";
import { useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMovementationModal from "../../modals/DeleteMovementationModal";
import { userContext } from "../../../Requisitions/context/userContext";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
    width: 190, // 28.33% do total
    label: "Projeto",
    dataKey: "projeto",
    numeric: false,
  },
  {
    width: 100, // 28.33% do total
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
    width: 100, // 18.33% do total
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
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
 const acceptModalStyle = {
   position: "absolute" as const,
   top: "50%",
   left: "50%",
   transform: "translate(-50%, -50%)",
   width: 400,
   bgcolor: "background.paper",
   border: "0.5px solid #000",
   boxShadow: 24,
   p: 4,
 };

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
    <TableHead sx={{boxShadow: 'none', border: 'none'}} {...props} ref={ref} />
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
            border: 'none'
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
  setAcceptMovementationodalOpen,
}: {
  row: Movementation;
  singleMovementation: () => boolean;
  setAcceptMovementationodalOpen: React.Dispatch<SetStateAction<number>>;
}) => {
  const { togglEditingMovementationObservation, toggleDeletingMovementation } =
    useContext(MovimentationContext);
  const { user } = useContext(userContext);

  const handleClickDeleteMovimentation = (row: Movementation) => {
    if (singleMovementation()) {
      console.log("singleMov");
      alert("Não é permitido excluir a única movimentação!");
    }
    if (notAllowedToCreateMovementation()) {
      alert(
        "Apenas quem criou ou o administrador pode excluir a movimentação!"
      );
      return;
    }
    toggleDeletingMovementation(row);
  };

  const notAllowedToCreateMovementation = () => {
    return !isWhoCreated() && !user?.PERM_ADMINISTRADOR;
  };

  const isWhoCreated = () => {
    return user?.CODPESSOA === row.id_ultimo_responsavel;
  };

  const handleAcceptMovementation = (movemnetationId: number) => {
    setAcceptMovementationodalOpen(movemnetationId);
  };
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          sx={{ paddingY: "6px", border: "none" }}
          key={column.dataKey}
          align={column.numeric ? "right" : "left"}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
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
              <>
                <IconButton onClick={() => handleClickDeleteMovimentation(row)}>
                  <DeleteIcon sx={{ color: "#F7941E" }} />
                </IconButton>
                {row["aceito"] === 0 && user?.CODPESSOA === row.id_responsavel && (
                  <Tooltip title="aceitar movimentação">
                    <ErrorOutlineIcon
                      onClick={() =>
                        handleAcceptMovementation(row["id_movimentacao"])
                      }
                      sx={{ color: "#F7941E", cursor: "pointer" }}
                    />
                  </Tooltip>
                )}
              </>
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
    const [acceptMovementationModalOpen, setAcceptMovementationodalOpen] = useState<number>(0);
    const [loading, setIsLoading] = useState<boolean>(false);
    const { refreshMovimentation, toggleRefreshMovimentation } = useContext(MovimentationContext);
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
   const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
       console.log("handleUploadFile");
       console.log("e.target.files: ", e.target.files);
       console.log(
         "acceptMovementationModalOpen: ",
         acceptMovementationModalOpen
       );
     if (e.target.files && acceptMovementationModalOpen !== 0) {
       setIsLoading(true);
       console.log(": ");
       const file = e.target.files[0];
       const formData = new FormData();
       formData.append("file", file);
       const response = await createMovementationfile(
         acceptMovementationModalOpen,
         formData
       );
       if (response && response.status === 200) {
         const responseAccept = await acceptMovementation(
           acceptMovementationModalOpen
         );
         if (responseAccept && responseAccept.status === 200) {
           setIsLoading(false);
           toggleRefreshMovimentation();
           setAcceptMovementationodalOpen(0);
           return;
         }
       }
       window.alert("Erro ao fazer upload!");
     }
   };
  React.useEffect(() => {
    fetchMovementations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMovimentation]);

  return (
    <Box
      sx={{
        height: "90%",
        width: "100%",
        padding: 2,
        boxShadow: "none",
        dropShadow: "none",
      }}
    >
      <TableVirtuoso
        style={{ border: "none", boxShadow: "none" }}
        data={movementations}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(_index, row) => (
          <RowContent
            row={row}
            setAcceptMovementationodalOpen={setAcceptMovementationodalOpen}
            singleMovementation={singleMovementation}
          />
        )}
      />

      <DeleteMovementationModal />
      <EditMovimentationObservationModal />
      <Modal
        open={acceptMovementationModalOpen !== 0}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={acceptModalStyle}>
          <IconButton
            sx={{
              color: "red",
              position: "absolute",
              right: "1rem",
              top: "1rem",
            }}
            onClick={() => setAcceptMovementationodalOpen(0)}
          >
            <CloseIcon />
          </IconButton>
          <Stack spacing={2}>
            <Typography
              textAlign="center"
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Registre o Recebimento
            </Typography>
            <Typography
              textAlign="center"
              id="modal-modal-description"
              sx={{ mt: 2 }}
            >
              Foto com patrimonio e acessórios
            </Typography>
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Anexar
              <VisuallyHiddenInput
                accept="image/*,application/pdf"
                onChange={handleUploadFile}
                type="file"
              />
            </Button>
            {loading && (
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Enviando...</Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
