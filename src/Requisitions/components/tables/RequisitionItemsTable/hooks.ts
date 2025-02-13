import { GridRowModesModel, useGridApiRef, GridRowModel } from "@mui/x-data-grid";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { AlertInterface, Item } from "../../../types";
import { fetchItems, updateRequisitionItems } from "../../../utils";


const useRequisitionItems = (requisitionId: number) => {
    const [items, setItems] = useState<Item[]>([]);
    const [visibleItems, setVisibleItems] = useState<Item[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [toggleSave, setToggleSave] = useState<boolean>(false);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
    const gridApiRef = useGridApiRef();
    const [alert, setAlert] = useState<AlertInterface>();
    const [reverseChanges, setReverseChanges] = useState(false);
    const shouldExecuteSaveItems = useRef(false);
    const shouldExecuteResetItems = useRef(false);



    const displayAlert = async (severity: string, message: string) => {
        setTimeout(() => {
            setAlert(undefined);
        }, 3000);
        setAlert({ severity, message });
        return;
    }



    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        shouldExecuteSaveItems.current = true;
        shouldExecuteResetItems.current = true;
        setRowModesModel(newRowModesModel);
    };

    const handleCancelEdition = async () => {
        const row = Object.keys(rowModesModel)[0];
        const { fieldToFocus } = rowModesModel[row] as any;
        stopEditMode(Number(row), fieldToFocus, true);
        setIsEditing(false);
        setReverseChanges(!reverseChanges);
    }

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
        if (isEditing) {
            const updatedRow = { ...newRow } as Item;
            setVisibleItems(visibleItems.map(item => (item.ID === updatedRow.ID ? updatedRow : item)));
            return updatedRow;
        }
        return oldRow as Item;
    };

    const fetchReqItems = useCallback(async () => {
        const items = await fetchItems(requisitionId);
        if (items) {
            setItems(items);
            setVisibleItems(items);
        }
    }, []);

    const saveItems = useCallback(async () => {
        try {
            const response = await updateRequisitionItems(visibleItems, requisitionId);
            if (response.status === 200) {
                displayAlert('success', 'Items atualizados com sucesso!');
                return;
            }
        }
        catch (e: any) {
            displayAlert('error', 'Houve algum erro ao atualizar os itens');
        }
    }, [toggleSave]);

    const stopEditMode = async (row: number, fieldToFocus: string, ignoreModifications: boolean) => {
        gridApiRef.current.stopRowEditMode({ id: row, field: fieldToFocus, ignoreModifications });
    }

    const handleSave = async () => {
        const row = Object.keys(rowModesModel)[0];
        const { fieldToFocus } = rowModesModel[row] as any;
        await stopEditMode(Number(row), fieldToFocus, false);
        setToggleSave(!toggleSave)
        setIsEditing(false);
    }

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const isRowClicked = target.closest('.MuiDataGrid-row'); // Verifica se o clique foi em uma linha
            const isCellClicked = target.closest('.MuiDataGrid-cell'); // Verifica se o clique foi em uma célula
            if (!isRowClicked && !isCellClicked && isEditing) {
                handleCancelEdition(); // Reverte as edições se o clique foi fora de qualquer linha
            }
        };
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [isEditing]);

    useEffect(() => {
        fetchReqItems();
    }, []);

    useEffect(() => {
        if (shouldExecuteResetItems.current) {
            setVisibleItems(items);
            return
        }
    }, [reverseChanges]);

    useEffect(() => {
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
        displayAlert,
        handleRowModesModelChange,
        handleCancelEdition,
        processRowUpdate,
        handleSave,
        setIsEditing
    };
};
export default useRequisitionItems;
