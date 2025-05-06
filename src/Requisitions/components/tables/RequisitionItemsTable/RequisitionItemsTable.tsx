/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Dispatch, SetStateAction, useContext } from "react";
import {
  Item
} from "../../../utils";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Checkbox,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridFooter,
  GridFooterContainer,
  GridFooterContainerProps,
  GridRenderCellParams,
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
import { QuoteItem, RequisitionStatus } from "../../../types";
import { ItemsContext } from "../../../context/ItemsContext";
import ErrorIcon from '@mui/icons-material/Error';

interface RequisitionItemsTableProps {

  requisitionId: number;
  addedItems?: Item[];
  isInsertingQuantity?: boolean;
  setIsInsertingQuantity?: Dispatch<SetStateAction<boolean>>;
  requisitionStatus?: RequisitionStatus
}



const RequisitionItemsTable: React.FC<RequisitionItemsTableProps> = ({
  requisitionId,
  addedItems,
  isInsertingQuantity,
  setIsInsertingQuantity,
  requisitionStatus
}) => {
  const { adding } = useContext(ItemsContext);

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
    selectedRows, setVisibleItems,
    displayAlert,
    selectingPrices, setSelectingPrices,
    itemToSupplierMap, setItemToSupplierMap,
    quoteItems
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
      flex: 1,
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

  const findQuotedQuantity = (supplier: string, row: any) => {
    const matchingColumn = Object.keys(row).find((key: string) => (key !== supplier && key.toLowerCase().includes(supplier)));
    return matchingColumn ? row[matchingColumn] : 0;
  }

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleChangeSupplierSelected = (
    e: React.ChangeEvent<HTMLInputElement>,
    params: GridRenderCellParams
  ) => {
    const isChecked = e.target.checked;
    const { ID } = params.row;
    const { field: supplier } = params;
    if (isChecked && quoteItems && visibleItems) {
      const isOnMap = itemToSupplierMap.some((item: any) => item.ID === ID);
      const editedMap = itemToSupplierMap.map((item: any) => item.ID === ID ? { ID, supplier } : item);
      const incrementedMap = [...itemToSupplierMap, { ID, supplier }];
      const updatedMap = isOnMap ? editedMap : incrementedMap;
      setItemToSupplierMap(updatedMap);

      const matchingQuoteItem = quoteItems.find(
        (quoteItem) =>
          quoteItem.fornecedor === supplier && quoteItem.id_item_requisicao === ID
      );
      const matchingReqItem = visibleItems.find((item) => item.ID === matchingQuoteItem?.id_item_requisicao);
      setVisibleItems(visibleItems.map((item) => { 
        if (item.ID === matchingReqItem?.ID) {
          return {
            ...item,
            item_cotacao_selecionado: matchingQuoteItem as QuoteItem | undefined
          }
        }
        return item;
      }));
      return;
    }
    if (!isChecked && quoteItems && visibleItems) {
      const matchingQuoteItem = quoteItems.find(
        (quoteItem) =>
          quoteItem.fornecedor === supplier && quoteItem.id_item_requisicao === ID
      );
      const matchingReqItem = visibleItems.find((item) => item.ID === matchingQuoteItem?.id_item_requisicao);
      setVisibleItems(
        visibleItems.map((item) => {
          if (item.ID === matchingReqItem?.ID) {
            return {
              ...item,
              item_cotacao_selecionado: undefined
            }
          }
          return item
        }));
      setItemToSupplierMap(
        itemToSupplierMap.filter((item: any) => item.ID !== ID)
      );
      return;
    };
  };

  const getColumns = () => {
    let supllierColumns: GridColDef[] = [];
    if (dinamicColumns) {
      const supplierSelected = (ID: number, supplier: string) => {
        return itemToSupplierMap.some((item: any) => {
          return item.ID === ID && item.supplier === supplier;
        });
      };


      dinamicColumns.forEach((c: string) => {
        supllierColumns.push({
          field: c,
          headerName: c,
          width: 150, // Defina a largura desejada
          editable: false,
          renderCell: (params: GridRenderCellParams) => {
            const quotedQuantity = findQuotedQuantity(c, params.row);
            const quotedQuantityEqual = quotedQuantity === params.row.QUANTIDADE;
            return (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,

              }}>
                {!quotedQuantityEqual && (
                  <Tooltip title={`Quantidade cotada: ${quotedQuantity}`}>
                    <ErrorIcon sx={{ color: 'gray' }} />
                  </Tooltip>
                )

                }
                <Typography
                  sx={{ ...typographyStyles.bodyText, color: green[600] }}
                >
                  {params.value ? currencyFormatter.format(params.value) : ""}
                </Typography>
                {
                  (<Checkbox disabled={!selectingPrices} checked={supplierSelected(params.row.ID, params.field)}
                    sx={{ zIndex: 40 }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeSupplierSelected(e, params)} />)}
              </Box>
            )
          },
        });
      });
    }
    return [...staticColumns, ...supllierColumns];
  };

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
          <Button
            onClick={handleCancelEdition}
            sx={{ ...BaseButtonStyles, height: 40 }}
          >
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
    if (requisitionStatus?.etapa === 0 || adding) {
      gridApiRef.current.startRowEditMode({
        id: params.row.ID,
        fieldToFocus: params.colDef.field,
        deleteValue: true,
      });
      if (!isEditing) {
        setIsEditing(true);
        return;
      }
      return;
    }
    if (selectingPrices) return;
    displayAlert(
      "warning",
      `Não é permitido editar items no status '${requisitionStatus?.nome}'`
    );
  };

  return (
    <Box sx={{ ...styles.container }}>
      {!isInsertingQuantity && (
        <ItemsToolBar
          handleCancelItems={handleCancelItems}
          handleActivateItems={handleActivateItems}
          handleCopyContent={handleCopyContent}
          requisitionStatus={requisitionStatus}
          handleDelete={handleDelete}
          selectedRows={selectedRows}
          setSelectingPrices={setSelectingPrices}
          setItemToSupplierMap={setItemToSupplierMap}
          selectingPrices={selectingPrices}
          itemToSupplierMap={itemToSupplierMap}
          visibleRows={visibleItems}
          quoteItems={quoteItems}
          getColumns={getColumns}
          findQuotedQuantity={findQuotedQuantity}
        />
      )}
      {
        visibleItems &&
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

          // processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) =>
          //   processRowUpdate(newRow, oldRow)
          // }
          processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) => {
            const updatedRow = processRowUpdate(newRow, oldRow);
            if (!updatedRow) {
              throw new Error("Row update failed: processRowUpdate returned undefined.");
            }
            return updatedRow;
          }}
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
      }

    </Box>
  );
};


export default RequisitionItemsTable;
