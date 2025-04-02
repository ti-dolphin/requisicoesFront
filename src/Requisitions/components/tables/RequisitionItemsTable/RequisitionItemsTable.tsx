/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Dispatch, SetStateAction } from "react";
import {
  Item
} from "../../../utils";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridFooter,
  GridFooterContainer,
  GridFooterContainerProps,
  GridRowModel,
  GridRowModesModel,
} from "@mui/x-data-grid";
import styles from "./RequisitionItemsTable.styles";
import {
  alertAnimation,
  BaseButtonStyles,
} from "../../../../utilStyles";
import { motion, AnimatePresence } from "framer-motion";
import typographyStyles from "../../../utilStyles";
import useRequisitionItems from "./hooks";
import ItemsToolBar from "../ItemsToolBar/ItemsToolBar";
import { green } from "@mui/material/colors";

interface RequisitionItemsTableProps {
  requisitionId: number;
  addedItems?: Item[];
  isInsertingQuantity?: boolean;
  setIsInsertingQuantity?: Dispatch<SetStateAction<boolean>>;
}



const RequisitionItemsTable: React.FC<RequisitionItemsTableProps> = ({
  requisitionId,
  addedItems,
  isInsertingQuantity,
  setIsInsertingQuantity
}) => {
  const {
    visibleItems,
    isEditing,
    alert,
    gridApiRef,
    dinamicColumns,
    handleRowModesModelChange,
    handleCancelEdition,
    processRowUpdate,
    triggerSave,
    setIsEditing,
    handleChangeSelection,
    handleDelete,
    handleCancelItems,
    handleActivateItems,
    handleCopyContent,
    selectedRows,
  } = useRequisitionItems(
    requisitionId,
    setIsInsertingQuantity,
    isInsertingQuantity,
    addedItems
  );
  
 
  const staticColumns: GridColDef[] = [
    {
      field: "nome_fantasia",
      headerName: "Nome Fantasia",
      editable: false,
      width: 300,
      renderCell: (params) => (
        <Typography sx={{ ...typographyStyles.bodyText }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "codigo",
      headerName: "Código",
      width: 150, // Defina a largura desejada
      editable: false,
      renderCell: (params) => (
        <Typography sx={{ ...typographyStyles.bodyText }}>
          {params.value ? params.value : "Sem código"}
        </Typography>
      ),
    },
    {
      field: "OC",
      headerName: "OC",
      width: 100, // Defina a largura desejada
      type: "number",
      editable: true,
      renderCell: (params) => (
        <Typography sx={{ ...typographyStyles.bodyText }}>
          {params.value ?? "-"}
        </Typography>
      ),
    },
    {
      field: "QUANTIDADE",
      headerName: "Quantidade",
      width: 120, // Defina a largura desejada
      type: "number",
      editable: true,
      renderCell: (params) => (
        <Typography
          sx={{ ...typographyStyles.bodyText, pointerEvents: "none" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "UNIDADE",
      headerName: "Unidade",
      width: 100, // Defina a largura desejada
      editable: false,
      renderCell: (params) => (
        <Typography sx={{ ...typographyStyles.bodyText }}>
          {params.value ?? "-"}
        </Typography>
      ),
    },
    {
      field: "OBSERVACAO",
      headerName: "Observação",
      width: 200, // Defina a largura desejada
      editable: true,
      renderCell: (params) => (
        <Typography sx={{ ...typographyStyles.bodyText }}>
          {params.value && params.value !== "null" ? params.value : ""}
        </Typography>
      ),
    },
  ];

  
   const currencyFormatter = new Intl.NumberFormat("pt-BR", {
     style: "currency",
     currency: "BRL",
   });

  const  getColumns =  () => { 
      let supllierColumns : GridColDef[] = [];
      if(dinamicColumns) {
        dinamicColumns.forEach((c : string) => {
          supllierColumns.push({
            field: c,
            headerName: c,
            width: 150, // Defina a largura desejada
            editable: false,
            renderCell: (params) => (
              <Typography sx={{ ...typographyStyles.bodyText, color: green[600] }}>
                {params.value ? currencyFormatter.format(params.value) : ""}
              </Typography>
            ),
          });
        });
      }
      return [...staticColumns, ...supllierColumns]

  }

  const ReqItemsFooter = (props: GridFooterContainerProps) => {
    return (
      <GridFooterContainer
        sx={{ ...props.style, ...styles.gridFooterContainer }}
        {...props}
      >
        <AnimatePresence>
          {alert && (
            <motion.div {...alertAnimation}>
              <Alert severity={alert.severity as AlertColor}>
                {alert.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <GridFooter />
        {isEditing && (
          <Button onClick={triggerSave} sx={BaseButtonStyles}>
            Salvar
          </Button>
        )}
        {isEditing && (
          <Button onClick={handleCancelEdition} sx={{ ...BaseButtonStyles, height: 40}}>
            Cancelar edição
          </Button>
        )}
      </GridFooterContainer>
    );
  };

  const insertingQuantityColumns = staticColumns.filter(
    (column) =>
      column.field === "QUANTIDADE" ||
      column.field === "nome_fantasia" ||
      column.field === "UNIDADE"
  );

  const handleCellClick = (params: GridCellParams) => {
    console.log("handleCellClick");
      gridApiRef.current.startRowEditMode({id: params.row.ID, fieldToFocus: params.colDef.field, deleteValue: true});
      if(!isEditing){ 
        setIsEditing(true)
        return;
      }
  };

  return (
    <Box sx={{ ...styles.container }}>
      {!isInsertingQuantity && (
        <ItemsToolBar
          handleCancelItems={handleCancelItems}
          handleActivateItems={handleActivateItems}
          handleCopyContent={handleCopyContent}
          handleDelete={handleDelete}
          selectedRows={selectedRows}
         
        />
      )}

      <DataGrid
        density={isInsertingQuantity ? "comfortable" : "compact"}
        rows={visibleItems}
        getRowId={(item: Item) => item.ID}
        columns={isInsertingQuantity ? insertingQuantityColumns : getColumns()}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        apiRef={gridApiRef}
        editMode="row"
        pageSizeOptions={[100]}
        checkboxSelection={!isInsertingQuantity}
        onCellClick={handleCellClick}
        disableRowSelectionOnClick
        onRowSelectionModelChange={handleChangeSelection}
        onRowEditStart={() => setIsEditing(true)}
        processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) =>
          processRowUpdate(newRow, oldRow)
        }
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-menuIconButton": {
            display: "none",
          },
        }}
        slots={{
          footer: ReqItemsFooter,
        }}
        onRowModesModelChange={(rowModesModel: GridRowModesModel) =>
          handleRowModesModelChange(rowModesModel)
        }
      />
    </Box>
  );
};


export default RequisitionItemsTable;
