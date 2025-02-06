/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Item,
  fetchItems,
  updateRequisitionItems,
} from "../../utils";
import {
  Alert,
  AlertColor,
  Button,
  Typography,
} from "@mui/material";
import { userContext } from "../../context/userContext";
import { DataGrid, GridColDef, GridFooter, GridFooterContainer, GridFooterContainerProps, GridRowModel, GridRowModesModel, useGridApiRef } from "@mui/x-data-grid";
import styles from "./RequisitionItemsTable.styles";
import { alertAnimation, BaseButtonStyles } from "../../../utilStyles";
import { AlertInterface } from "../../types";
import { motion, AnimatePresence } from "framer-motion";

interface RequisitionItemsTableProps{ 
  requisitionId : number
}

const columns: GridColDef[] = [
  {
    field: 'nome_fantasia',
    headerName: 'Nome Fantasia',
    flex: 1,

    renderCell: (params) => (
      <Typography variant="body2">{params.value}</Typography>
    ),
  },
  {
    field: 'codigo',
    headerName: 'Código',
    flex: 1,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value ? params.value : 'Sem código'}
      </Typography>
    ),
  },
  {
    field: 'OC',
    headerName: 'OC',
    flex: 1,
    type: 'number',
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2">{params.value ?? '-'}</Typography>
    ),
  },
  {
    field: 'QUANTIDADE',
    headerName: 'Quantidade',
    flex: 1,
    type: 'number',
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2">{params.value}</Typography>
    ),
  },
  {
    field: 'UNIDADE',
    headerName: 'Unidade',
    flex: 1,
    renderCell: (params) => (
      <Typography variant="body2">{params.value ?? '-'}</Typography>
    ),
  },
  {
    field: 'OBSERVACAO',
    headerName: 'Observação',
    flex: 1,
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value ? params.value : 'Sem observação'}
      </Typography>
    ),
  },
  {
    field: 'ATIVO',
    headerName: 'Ativo',
    flex: 1,
    type: 'number',
    renderCell: (params) => (
      <Typography variant="body2">{params.value ?? '-'}</Typography>
    ),
  },
  {
    field: 'ID',
    headerName: 'ID',
    flex: 1,
    type: 'number',
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2">{params.value}</Typography>
    ),
  },
  {
    field: 'ID_PRODUTO',
    headerName: 'ID Produto',
    flex: 1,
    type: 'number',
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2">{params.value}</Typography>
    ),
  },
];

const RequisitionItemsTable: React.FC<RequisitionItemsTableProps> = ({ requisitionId }) => {
  const { user } = useContext(userContext)
  const [items, setItems] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const gridApiRef = useGridApiRef();
  const [alert, setAlert] = useState<AlertInterface>();

  console.log({user});
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    console.log({ newRowModesModel });
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    console.log('processRowUpdate');
    const updatedRow = { ...newRow } as Item;
    setItems(items.map(item => (item.ID === updatedRow.ID ? updatedRow : item)));
    return updatedRow;
  };

  const handleSave = async () => {
    const rowId = Object.keys(rowModesModel)[0];
    gridApiRef.current.stopRowEditMode({ id : rowId, ignoreModifications: false });

    try {
      const response = await updateRequisitionItems(items, requisitionId);
      if (response.status === 200) {
        displayAlert('success', 'Items atualizados com sucesso!');
        return;
      }
    }
    catch (e: any) {
      displayAlert('error', 'Houve algum erro ao atualizar os itens');
    }
  }

  const displayAlert = async (severety: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severety, message });
    return;
  } 

   const ReqItemsFooter = (props : GridFooterContainerProps ) =>  {
    return ( 
      <GridFooterContainer sx={{...props.style, ...styles.gridFooterContainer}} {...props}>
          <AnimatePresence>
            {alert && (
            <motion.div {...alertAnimation}>
              <Alert severity={alert.severety as AlertColor}>{alert.message}</Alert>
            </motion.div>
             )}
          </AnimatePresence>
         
        <GridFooter>
        </GridFooter>
        {isEditing && <Button onClick={handleSave} sx={BaseButtonStyles}>Salvar</Button>}
      </GridFooterContainer>
    )
   }

    const fetchReqItems = useCallback(async () =>  {
      const items = await fetchItems(requisitionId);
      if(items){ 
        setItems(items);
      }}, []);

    useEffect(() =>  {
      fetchReqItems();
    }, []);

    return (
      <DataGrid
        rows={items}
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
        onRowEditStart={() => setIsEditing(true)}
        onRowEditStop={() => setIsEditing(false)}
        processRowUpdate={processRowUpdate}
        slots={{
          footer : ReqItemsFooter
        }}
        onRowModesModelChange={(rowModesModel: GridRowModesModel) => handleRowModesModelChange(rowModesModel)}
      />
    )
  
};


export default RequisitionItemsTable;
