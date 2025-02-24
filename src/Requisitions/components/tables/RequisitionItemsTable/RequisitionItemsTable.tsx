/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Item
} from "../../../utils";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import {
  DataGrid,
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
import ItemActions from "../ItemActions/ItemActions";
import ItemsToolBar from "../ItemsToolBar/ItemsToolBar";

interface RequisitionItemsTableProps {
  requisitionId: number;
}

const columns: GridColDef[] = [
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
    flex: 1,
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
    flex: 1,
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
    flex: 1,
    type: "number",
    editable: true,
    renderCell: (params) => (
      <Typography sx={{ ...typographyStyles.bodyText }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "UNIDADE",
    headerName: "Unidade",
    flex: 1,
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
    flex: 1,
    editable: true,
    renderCell: (params) => (
      <Typography sx={{ ...typographyStyles.bodyText }}>
        {params.value && params.value !== "null" ? params.value : ""}
      </Typography>
    ),
  },
  {
    field: "ATIVO",
    headerName: "Ativo",
    flex: 1,
    type: "number",
    editable: false,
    renderCell: (params) => (
      <Typography
        sx={{
          ...typographyStyles.smallText,
          color: params.value ? "darkgreen" : "gray",
        }}
      >
        {params.value ? "Sim" : "Não"}
      </Typography>
    ),
  },
  {
    field: "ID",
    headerName: "ID",
    flex: 1,
    type: "number",
    editable: false,
    renderCell: (params) => (
      <Typography sx={{ ...typographyStyles.bodyText }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "ID_PRODUTO",
    headerName: "ID Produto",
    flex: 1,
    type: "number",
    editable: false,
    renderCell: (params) => (
      <Typography sx={{ ...typographyStyles.bodyText }}>
        {params.value}
      </Typography>
    ),
  },
];

const RequisitionItemsTable: React.FC<RequisitionItemsTableProps> = ({
  requisitionId,
}) => {
  const {
    visibleItems,
    isEditing,
    alert,
    gridApiRef,
    handleRowModesModelChange,
    handleCancelEdition,
    processRowUpdate,
    handleSave,
    setIsEditing,
    handleChangeSelection,
    handleDelete,
    handleCancelItems,
    handleActivateItems,
    handleCopyContent,
    selectedRows,
  } = useRequisitionItems(requisitionId);

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

        <GridFooter></GridFooter>
        {isEditing && (
          <Button onClick={handleSave} sx={BaseButtonStyles}>
            Salvar
          </Button>
        )}
        {isEditing && (
          <Button onClick={handleCancelEdition} sx={BaseButtonStyles}>
            Cancelar edição
          </Button>
        )}
      </GridFooterContainer>
    );
  };

  return (
    <Box sx={{ ...styles.container }}>
       <ItemsToolBar 
          handleCancelItems={handleCancelItems}
          handleActivateItems={handleActivateItems}
          handleCopyContent={handleCopyContent}
          handleDelete={handleDelete}
          selectedRows={selectedRows}
       />

      <DataGrid
        density="compact"
        rows={visibleItems}
        getRowId={(item: Item) => item.ID}
        columns={columns}
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
        checkboxSelection
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
