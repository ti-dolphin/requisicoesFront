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
import { PatrimonyInfo } from "../../types";
import SearchAppBar from "../SearchAppBar";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { acceptMovementation, createMovementationfile, dateTimeRenderer, getPatrimonyInfo } from "../../utils";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";
import { ResponsableContext } from "../../context/responsableContext";
import { Alert, Box, Button, Checkbox, CircularProgress, IconButton, Modal, Stack, styled, Tooltip, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { userContext } from "../../../Requisitions/context/userContext";


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
interface ColumnData {
  dataKey: keyof PatrimonyInfo;
  label: string;
  numeric?: boolean;
  width: number;
}


 const columns: ColumnData[] = [
   {
     width: 70,
     label: "Patrimônio",
     dataKey: "id_patrimonio",
   },
   {
     width: 130,
     label: "Nome",
     dataKey: "nome",
   },
   {
     width: 200,
     label: "Descrição",
     dataKey: "descricao",
   },
   {
     width: 130,
     label: "Responsável",
     dataKey: "responsavel",
   },
   {
     width: 130,
     label: "Gerente",
     dataKey: "gerente",
   },
   {
     width: 300,
     label: "Projeto",
     dataKey: "projeto",
   },
   {
     width: 140,
     label: "Ultima Movimentação",
     dataKey: "dataMovimentacao",
   },
   {
     width: 40,
     label: "",
     dataKey: "id_patrimonio",
   },
 ];

 const style = {
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

const VirtuosoTableComponents: TableComponents<PatrimonyInfo> = {
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
            padding: "0.2",
          }}
        >
          <Typography fontSize="small" sx={{fontWeight: 'bold'}}>{column.label}</Typography>
        </TableCell>
      ))}
    </TableRow>
  );
}




export default function MovementsTable() {
  const {refreshPatrimonyInfo, currentFilter, toggleRefreshPatrimonyInfo}= useContext(PatrimonyInfoContext);
  const [acceptMovementationModalOpen,setAcceptMovementationodalOpen] = useState<number>(0);
  const [movementationAcceptedAlert, setMovementationAcceptedAlert] = useState<boolean>(false);
  const {user} = useContext(userContext);
  const [rows, setRows] = useState<PatrimonyInfo[]>();
  const [filteredRows, setFilteredRows] = useState<PatrimonyInfo[]>();
  const [selectedItems, setSelectedItems ] = useState<PatrimonyInfo[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const fetchData = async ( ) => { 
     const patrimonyInfoData = await getPatrimonyInfo();
     if(currentFilter === 'Todos'){ 
       if (patrimonyInfoData) {
         setFilteredRows(patrimonyInfoData);
       }
       return
     }
     if(currentFilter === 'Meus'){ 
      if (patrimonyInfoData) {
        setFilteredRows(patrimonyInfoData.filter((register ) =>  (
          register.responsavel.toUpperCase() === user?.NOME?.toUpperCase()
        )));
      }
      return;
     }
    setRows(patrimonyInfoData);
  }

  function RowContent(
    _index: number,
    row: PatrimonyInfo,
    setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>,
    selectedItems: PatrimonyInfo[],
    setAcceptMovementationodalOpen: (value: number) => void
  ) {
    const { setResponsable } = useContext(ResponsableContext);

    const handleSelectItem = (
      e: React.ChangeEvent<HTMLInputElement>,
      row: PatrimonyInfo
    ) => {
      if (e.target.checked) {
        const currentSelectedItems = [...selectedItems];
        currentSelectedItems.push(row);
        setSelectedItems([...currentSelectedItems]);
        console.log("currentSelected: \n", currentSelectedItems);
        return;
      }
      const currentSelectedItems = [...selectedItems];
      currentSelectedItems.splice(currentSelectedItems.indexOf(row), 1);
      setSelectedItems([...currentSelectedItems]);
    };
    const handleOpenPatrimonyDetail = (id_patrimonio: number) => {
      setResponsable(row.id_responsavel);
      window.location.href = `/patrimony/details/${id_patrimonio}`;
    };

    const isOnSelectedItems = (row: PatrimonyInfo) => {
      if (selectedItems.find((item) => row === item)) {
        return true;
      }
      return false;
    };

    const handleAcceptMovementation = (movemnetationId: number) => {
      setAcceptMovementationodalOpen(movemnetationId);
    };

    return (
      <React.Fragment>
        {columns.map((column) =>
          column.label !== "" ? (
            <TableCell
              sx={{
                cursor: "pointer",
                paddingX: "0.2",
                textTransform: "capitalize",
              }}
              key={column.dataKey}
              onClick={() => handleOpenPatrimonyDetail(row.id_patrimonio)}
              align={column.numeric ? "center" : "left"}
            >
              {column.dataKey === "dataMovimentacao" ? (
                <Typography fontSize="small">
                  {dateTimeRenderer(row[column.dataKey])}
                </Typography>
              ) : (
                <Typography fontSize="small">
                  {column.dataKey === "projeto"
                    ? String(row[column.dataKey])
                    : String(row[column.dataKey]).toLowerCase()}
                </Typography>
              )}
            </TableCell>
          ) : (
            <TableCell align="center">
              <Stack direction="row">
                {row["aceito"] === 0 && row.id_responsavel === user?.CODPESSOA ? (
                  <Tooltip title="aceitar movimentação">
                    <ErrorOutlineIcon
                      onClick={() =>
                        handleAcceptMovementation(row["numeroMovimentacao"])
                      }
                      sx={{ color: "#F7941E", cursor: "pointer" }}
                    />
                  </Tooltip>
                ) : (
                  ""
                )}
                <Checkbox
                  checked={isOnSelectedItems(row)}
                  onChange={(e) => handleSelectItem(e, row)}
                  sx={{ margin: "0", padding: "0" }}
                />
              </Stack>
            </TableCell>
          )
        )}
      </React.Fragment>
    );
  }
  const displayMovementationAcceptedAlert = ( ) => { 
     setTimeout(() => {
       setMovementationAcceptedAlert(false);
     }, 3 * 1000);
     console.log("alert false");
     setMovementationAcceptedAlert(true);
  }
   const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
         const responseAccept = await acceptMovementation(acceptMovementationModalOpen);
         if (responseAccept && responseAccept.status === 200) {
           setIsLoading(false);
           displayMovementationAcceptedAlert();
           toggleRefreshPatrimonyInfo();
           setAcceptMovementationodalOpen(0);
           return;
         }
       }
       window.alert("Erro ao fazer upload!");
     }
   };

  const handleSearch = (e : React.KeyboardEvent<HTMLInputElement> ) =>  {
    const { value } = e.currentTarget;
      if(e.key === 'Enter'){ 
       setFilteredRows(prevRows => {
        const searchValue = value.toLowerCase();
        return prevRows &&  prevRows.filter((moviment) => (
            moviment.gerente.toLowerCase().includes(searchValue) ||
            moviment.projeto.toLowerCase().includes(searchValue) ||
            moviment.responsavel.toLowerCase().includes(searchValue) ||
            moviment.id_patrimonio === Number(searchValue) ||
            moviment.patrimonio.toLowerCase().includes(searchValue) ||
            moviment.descricao.toLowerCase().includes(searchValue) ||
            moviment.dataMovimentacao.toLowerCase().includes(searchValue)
          ));
      });
      return;
      }
      if( e.key === 'Backspace'){ 
        setFilteredRows(rows);
        return;
      }

}
  React.useEffect(() => {
    console.log("fetchData");
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPatrimonyInfo, currentFilter]);
 
  return (
    <Paper style={{ height: "86%", width: "100%" }}>
      {movementationAcceptedAlert && (
        <Alert
          variant="filled"
          className="drop-shadow-lg"
          severity="success"
          sx={{
            width: "400px",
            position: "absolute",
            left: "50%",
            marginLeft: "-200px",
            zIndex: 20,
          }}
        >
          A Movimentação foi aceita por você
        </Alert>
      )}

      <Modal
        open={acceptMovementationModalOpen !== 0}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUploadFile}
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
      <SearchAppBar
        setFilteredRows={setFilteredRows}
        selectedItems={selectedItems}
        handleSearch={handleSearch}
        setSelectedItems={setSelectedItems}
      />
      <TableVirtuoso
        data={filteredRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(index, row) =>
          RowContent(
            index,
            row,
            setSelectedItems,
            selectedItems,
            setAcceptMovementationodalOpen
          )
        }
      />
    </Paper>
  );
  }
