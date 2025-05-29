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
import useRequisitionItems from "../../../hooks/useRequisitionItems";
import ItemsToolBar from "../ItemsToolBar/ItemsToolBar";
import { green } from "@mui/material/colors";
import { QuoteItem, Requisition, RequisitionStatus } from "../../../types";
import ErrorIcon from "@mui/icons-material/Error";
import { User, userContext } from "../../../context/userContext";

interface RequisitionItemsTableProps {
  requisitionId: number;
  addedItems?: Item[];
  isInsertingQuantity?: boolean;
  setIsInsertingQuantity?: Dispatch<SetStateAction<boolean>>;
  requisitionStatus?: RequisitionStatus;
  requisitionData?: Requisition;
}

const RequisitionItemsTable: React.FC<RequisitionItemsTableProps> = ({
  requisitionId,
  addedItems,
  isInsertingQuantity,
  setIsInsertingQuantity,
  requisitionStatus,
  requisitionData,
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
    setVisibleItems,
    displayAlert,
    selectingPrices,
    setSelectingPrices,
    itemToSupplierMap,
    setItemToSupplierMap,
    quoteItems,
  } = useRequisitionItems(
    requisitionId,
    setIsInsertingQuantity,
    isInsertingQuantity,
    addedItems
  );

  const { user } = useContext(userContext);

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
      field: "data_entrega",
      headerName: "Data de entrega",
      width: 150, // Defina a largura desejada
      editable: true,
      type: "date",
      valueGetter: (value) => {
        return value && value !== 'null' ? new Date(value) : null;
      },
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
    const matchingColumn = Object.keys(row).find(
      (key: string) => key !== supplier && key.toLowerCase().includes(supplier)
    );
    return matchingColumn ? row[matchingColumn] : 0;
  };

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
    if (!selectingPrices) setSelectingPrices(true);
    if (isChecked && quoteItems && visibleItems) {
      const isOnMap = itemToSupplierMap.some((item: any) => item.ID === ID);
      const editedMap = itemToSupplierMap.map((item: any) =>
        item.ID === ID ? { ID, supplier } : item
      );
      const incrementedMap = [...itemToSupplierMap, { ID, supplier }];
      const updatedMap = isOnMap ? editedMap : incrementedMap;
      setItemToSupplierMap(updatedMap);

      const matchingQuoteItem = quoteItems.find(
        (quoteItem) =>
          quoteItem.fornecedor === supplier &&
          quoteItem.id_item_requisicao === ID
      );
      const matchingReqItem = visibleItems.find(
        (item) => item.ID === matchingQuoteItem?.id_item_requisicao
      );
      setVisibleItems(
        visibleItems.map((item) => {
          if (item.ID === matchingReqItem?.ID) {
            return {
              ...item,
              item_cotacao_selecionado: matchingQuoteItem as
                | QuoteItem
                | undefined,
            };
          }
          return item;
        })
      );
      return;
    }
    if (!isChecked && quoteItems && visibleItems) {
      const matchingQuoteItem = quoteItems.find(
        (quoteItem) =>
          quoteItem.fornecedor === supplier &&
          quoteItem.id_item_requisicao === ID
      );
      const matchingReqItem = visibleItems.find(
        (item) => item.ID === matchingQuoteItem?.id_item_requisicao
      );
      setVisibleItems(
        visibleItems.map((item) => {
          if (item.ID === matchingReqItem?.ID) {
            return {
              ...item,
              item_cotacao_selecionado: undefined,
            };
          }
          return item;
        })
      );
      setItemToSupplierMap(
        itemToSupplierMap.filter((item: any) => item.ID !== ID)
      );
      return;
    }
  };

  // Função para gerar as colunas da tabela dinamicamente, incluindo colunas de fornecedores
  const getColumns = (): GridColDef[] => {
    // Função auxiliar para verificar se o fornecedor está selecionado para o item
    const isSupplierSelected = (ID: number, supplier: string): boolean =>
      itemToSupplierMap.some((item: any) => item.ID === ID && item.supplier === supplier);

    // Se não houver colunas dinâmicas, retorna apenas as colunas estáticas
    if (!dinamicColumns) return staticColumns;

    // Mapeia as colunas dinâmicas (fornecedores) para GridColDef
    const supplierColumns: GridColDef[] = dinamicColumns.map((supplier: string) => ({
      field: supplier,
      headerName: supplier,
      width: 150,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        // Busca a quantidade cotada para o fornecedor
        const quotedQuantity = findQuotedQuantity(supplier, params.row);
        const isQuantityEqual = quotedQuantity === params.row.QUANTIDADE;

        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Exibe um ícone de alerta se a quantidade cotada for diferente da quantidade do item */}
            {params.value  &&  !isQuantityEqual && (
              <Tooltip title={`Quantidade cotada: ${quotedQuantity}`}>
              <ErrorIcon sx={{ color: "gray" }} />
              </Tooltip>
            )}
            {/* Valor formatado em moeda */}
            <Typography sx={{ ...typographyStyles.bodyText, color: green[600] }}>
              {params.value ? currencyFormatter.format(params.value) : ""}
            </Typography>
            {/* Checkbox para seleção do fornecedor, só exibe se houver valor */}
            {params.value  && (
              <Checkbox
              checked={isSupplierSelected(params.row.ID, params.field)}
              sx={{ zIndex: 40 }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChangeSupplierSelected(e, params)
              }
              />
            )}
            </Box>
        );
      },
    }));

    // Retorna as colunas estáticas seguidas das colunas de fornecedores
    return [...staticColumns, ...supplierColumns];
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

  const verifyPermissionToEditItem = (user: User) => {
    if (requisitionData) {
      const userRoles = {
        isResponsable:
          user.CODPESSOA === requisitionData.responsavel_pessoa?.CODPESSOA,
        isManager:
          user.CODPESSOA ===
          requisitionData.projeto_gerente?.gerente?.CODPESSOA,
        isDirector: user.PERM_DIRETOR,
        isPurchaser: user.PERM_COMPRADOR,
        isAdmin: user.PERM_ADMINISTRADOR,
      };
      if (
        !userRoles.isPurchaser &&
        !userRoles.isManager &&
        !userRoles.isDirector &&
        !userRoles.isAdmin &&
        !userRoles.isResponsable
      ) {
        throw new Error("Você não tem permissão para editar itens");
      }
    }
  };

  const verifyStatusPermission = (
    status: RequisitionStatus,
    params: GridCellParams
  ) => {
    const permittedEditionEtapa = [0, 6];
    if (params.colDef.field === "data_entrega") {
      const permitedEtapasForDataEntrega = [0, 6, 7];
      const permittedStatus = permitedEtapasForDataEntrega.includes(
        status.etapa
      );
      if (!permittedStatus) {
        console.log("status.etapa: ", status.etapa);
        throw new Error(
          `Não é permitido editar items no status '${status.nome}'`
        );
      }
      return;
    }
    const permittedStatus = permittedEditionEtapa.includes(status.etapa);
    if (!permittedStatus) {
      throw new Error(
        `Não é permitido editar items no status '${status.nome}'`
      );
    }
  };

  const startEditMode = (params: GridCellParams) => {
    
  const rowMode = gridApiRef.current.getRowMode(params.row.ID);
  if (rowMode === "edit") return;

    gridApiRef.current.startRowEditMode({
      id: params.row.ID,
      fieldToFocus: params.colDef.field,
      deleteValue: false,
    });
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
  };

  const handleCellClick = (params: GridCellParams) => {
    if (selectingPrices) return;
    if (user && requisitionStatus) {
      try {
        verifyPermissionToEditItem(user);
        if(user?.PERM_COMPRADOR || user.PERM_ADMINISTRADOR){ 
          startEditMode(params);
          return;
        }
        verifyStatusPermission(requisitionStatus, params);
        startEditMode(params);
      } catch (e: any) {
        console.log(e)
        displayAlert('error', e.message);
      }
    }
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
      {visibleItems && (
        <DataGrid
          density={isInsertingQuantity ? "comfortable" : "compact"}
          rows={visibleItems}
          getRowId={(item: Item) => item.ID}
          columns={
            isInsertingQuantity ? insertingQuantityColumns : getColumns()
          }
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
              throw new Error(
                "Row update failed: processRowUpdate returned undefined."
              );
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
      )}
    </Box>
  );
};


export default RequisitionItemsTable;
