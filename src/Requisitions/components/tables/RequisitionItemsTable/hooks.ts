import {
  GridRowModesModel,
  useGridApiRef,
  GridRowModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { AlertInterface, Item } from "../../../types";
import {
  deleteRequisitionItems,
  fetchItems,
  updateRequisitionItems,
} from "../../../utils";
import { ItemsContext } from "../../../context/ItemsContext";
import { useLocation, useNavigate } from "react-router-dom";

const useRequisitionItems = (
  setIsInsertingQuantity: Dispatch<SetStateAction<boolean>>,
  requisitionId: number,
  isInsertingQuantity?: boolean,
  addedItems?: Item[],
) => {
  const { toggleAdding } = useContext(ItemsContext);
  const [items, setItems] = useState<Item[]>([]);
  const [visibleItems, setVisibleItems] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toggleSave, setToggleSave] = useState<boolean>(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [selectedRows, setSelectedRows] = useState<Item[]>();
  const gridApiRef = useGridApiRef();
  const [alert, setAlert] = useState<AlertInterface>();
  const [reverseChanges, setReverseChanges] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const shouldExecuteSaveItems = useRef(false);
  const shouldExecuteResetItems = useRef(false);
  const { adding, setProductIdList } = useContext(ItemsContext);
  const [dinamicColumns, setDinamicColumns] = useState<any>();
  const location = useLocation();
  const navigate = useNavigate();
  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 6000);
    setAlert({ severity, message });
    return;
  };

  const handleDelete = async (requisitionItems: Item[]) => {
    console.log("os items deletados serão: ", requisitionItems);
    try {
      const ids = requisitionItems.map((item) => item.ID);
      const response = await deleteRequisitionItems(ids, requisitionId);
      if (response.status === 200) {
        setRefresh(!refresh);
        displayAlert("success", "Items deletados com sucesso!");
        return;
      }
    } catch (e) {
      displayAlert("error", "Houve algum erro ao deletar o item");
    }
  };

  const handleCancelItems = async (items: Item[]) => {
    const updatedItems = items.map((item) => ({ ...item, ATIVO: 0 }));
    try {
      const response = await updateRequisitionItems(
        updatedItems,
        requisitionId
      );
      if (response.status === 200) {
        setRefresh(!refresh);
        displayAlert("success", "Items inativados com sucesso!");
        return;
      }
    } catch (e) {
      displayAlert("error", "Houve algum erro ao inativar os itens");
    }
  };

  const handleActivateItems = async (items: Item[]) => {
    const updatedItems = items.map((item) => ({ ...item, ATIVO: 1 }));
    try {
      const response = await updateRequisitionItems(
        updatedItems,
        requisitionId
      );
      if (response.status === 200) {
        setRefresh(!refresh);
        displayAlert("success", "Items ativados com sucesso!");
        return;
      }
    } catch (e) {
      displayAlert("error", "Houve algum erro ao ativar os itens");
    }
  };

  const handleCopyContent = async (selectedItems: Item[]) => {
    const container = document.createElement("div");
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${selectedItems
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.nome_fantasia}</td>
                        <td>${item.QUANTIDADE}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
    const table = container.firstElementChild;
    if (!table) {
      displayAlert("error", "Erro ao gerar a tabela.");
      return;
    }
    try {
      const blob = new Blob([table.outerHTML], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": blob });
      await navigator.clipboard.write([clipboardItem]);
      displayAlert("success", "Tabela copiada para a área de transferência!");
    } catch (e) {
      displayAlert("error", "Houve um erro ao copiar a tabela.");
      console.error(e);
    }
  };

  const handleChangeSelection = (rowSelectionModel: GridRowSelectionModel) => {
    setSelectedRows(
      items.filter((item) => rowSelectionModel.includes(item.ID))
    );
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    shouldExecuteSaveItems.current = true;
    shouldExecuteResetItems.current = true;
    setRowModesModel(newRowModesModel);
  };

  const handleCancelEdition = () => {
    console.log("handleCancelEdition");
    try{ 
        const row = Object.keys(rowModesModel)[0];
        const { fieldToFocus } = rowModesModel[row] as any;
        stopEditMode(Number(row), fieldToFocus, true);
    }catch(e){ 
        console.log(e)
    }finally{ 
        setIsEditing(false);
        setReverseChanges(!reverseChanges);
    }
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    console.log("processRowUpdate");
    if (isEditing) {
      const updatedRow = { ...newRow } as Item;
      setVisibleItems(
        visibleItems.map((item) =>
          item.ID === updatedRow.ID ? updatedRow : item
        )
      );
      return updatedRow;
    }
    return oldRow as Item;
  };

  const fetchReqItems = useCallback(async () => {
    console.log("requisitonId: ", requisitionId);
    const { items, columns } = await fetchItems(requisitionId);
    console.log("items: ", items);
    setDinamicColumns(columns);
    if (items) {
      if (isInsertingQuantity && addedItems?.length) {
        const itemsToBeSet = items.filter((item: Item) =>
          addedItems.find((addedItem) => addedItem.ID === item.ID)
        );
        setItems(itemsToBeSet);
        setVisibleItems(itemsToBeSet);
        return;
      }
      setProductIdList(items.map((item: Item) => item.ID_PRODUTO));
      setItems(items);
      setVisibleItems(items);
    }
  }, [isInsertingQuantity, addedItems]);


    function validateItems(items: Item[]): void {
        if (!items?.length) {
            throw new Error("Nenhum item para validar");
        }
        const invalidItems = items.filter(item =>
            item.QUANTIDADE === null || item.QUANTIDADE === 0
        );
        if (invalidItems.length > 0) {
            const errorMessages = invalidItems.map(item =>
                `Item ${item.ID} (${item.nome_fantasia }): Quantidade não pode ser zero ou vazia`
            );
            throw new Error(`\n${errorMessages.join('\n')}`);
        }
    }


  const saveItems = useCallback(async () => {
    try {
      validateItems(visibleItems);
      const response = await updateRequisitionItems(
        visibleItems,
        requisitionId
      );
      if (response.status === 200) {
        displayAlert("success", "Items atualizados com sucesso!");
        if(location.pathname === `/requisitions`){ 
            navigate(`requisitionDetail/${requisitionId}`);
        }
        setIsInsertingQuantity(false);
        toggleAdding()
        return;
      }
    } catch (e: any) {
        handleCancelEdition();
        displayAlert("error", `Erro ao atualizar os itens: ${e.message}`);
    }
  }, [toggleSave]);

  const stopEditMode = async (
    row: number,
    fieldToFocus: string,
    ignoreModifications: boolean
  ) => {
    console.log("stopEditMode");
    gridApiRef.current.stopRowEditMode({
      id: row,
      field: fieldToFocus,
      ignoreModifications,
    });
  };

  const triggerSave = async () => {
    try {
      const row = Object.keys(rowModesModel)[0];
      const { fieldToFocus } = rowModesModel[row] as any;
      await stopEditMode(Number(row), fieldToFocus, false);
      setToggleSave(!toggleSave);
      setIsEditing(false);
    } catch (e) {
      setToggleSave(!toggleSave);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isRowClicked = target.closest(".MuiDataGrid-row"); // Verifica se o clique foi em uma linha
      const isCellClicked = target.closest(".MuiDataGrid-cell"); // Verifica se o clique foi em uma célula
      const isSaveButtonClicked = target.closest(".MuiButton-root");
      const shouldCancelEdition =
        !isRowClicked && !isCellClicked && isEditing && !isSaveButtonClicked;
      if (shouldCancelEdition) {
        handleCancelEdition(); // Reverte as edições se o clique foi fora de qualquer linha
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isEditing]);

  useEffect(() => {
    fetchReqItems();
  }, [refresh, adding]);

  useEffect(() => {
    if (shouldExecuteResetItems.current) {
      setVisibleItems(items);
      return;
    }
  }, [reverseChanges]);

  useEffect(() => {
    console.log("saveItems useEffect");
    console.log(
      "shouldExecuteSaveItems.current: ",
      shouldExecuteSaveItems.current
    );
    if (shouldExecuteSaveItems.current) {
      saveItems();
    }
  }, [toggleSave, saveItems]);

  return {
    items,
    visibleItems,
    isEditing,
    alert,
    rowModesModel,
    gridApiRef,
    selectedRows,
    dinamicColumns,
    displayAlert,
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
  };
};
export default useRequisitionItems;
