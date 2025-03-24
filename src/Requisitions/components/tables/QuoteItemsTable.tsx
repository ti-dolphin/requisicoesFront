import { useEffect, useRef, useState } from "react";
import { AlertInterface, QuoteItem } from "../../types";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowModel,
  GridRowModesModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { BaseButtonStyles } from "../../../utilStyles";
import typographyStyles from "../../utilStyles";

interface props {
  items: QuoteItem[];
  isSupplier: boolean | undefined;
}

const QuoteItemsTable = ({ items, isSupplier }: props) => {
  const [currentItems, setCurrentItems] = useState<QuoteItem[]>([...items]);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<number[]>();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [reverseChanges, setReverseChanges] = useState(false);
  const [saveItems, setSaveItems] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertInterface>();
  const gridApiRef = useGridApiRef();
  const shouldExecuteSaveItems = useRef(false);
  const shouldExecuteResetItems = useRef(false);

  console.log({
    isSelecting,
    selectionModel,
    setIsLoading
  });

  const handleGenerateSupplierUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("supplier", "1");
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        console.log("URL copiada para a área de transferência:", url);
      })
      .catch((err) => {
        console.error("Erro ao copiar a URL:", err);
      });
    displayAlert("success", "Link copiado para área de transferência");
  };

  const handleSelection = (newSelectionModel: GridRowSelectionModel) => {
    setIsSelecting(true);
    if (newSelectionModel.length) {
      setIsSelecting(true);
      setSelectionModel(newSelectionModel as number[]);
      return;
    }
    setIsSelecting(false);
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    shouldExecuteSaveItems.current = true;
    shouldExecuteResetItems.current = true;
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    console.log("processRowUpdate");
    if (isEditing) {
        const updatedRow = { ...newRow } as QuoteItem;
        setCurrentItems(currentItems.map(item => (item.id_item_cotacao === updatedRow.id_item_cotacao ? updatedRow : item)));
        return updatedRow;
    }
    return oldRow as QuoteItem;
  };

   
  const handleSave = async () => {
    console.log("handleSave");
    try {
        console.log('updatedItems: ', currentItems)
    //   const response = await updateQuoteItems(currentItems, Number(quoteId));
    //   if (response.status === 200) {
    //     displayAlert('success', 'items da cotação atualizados com sucesso!');
    //     const updatedItems = response.data;
    //     setCurrentItems(updatedItems);
    //   }
    } catch (e: any) {
      displayAlert("error", e.message);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id_item_cotacao",
      headerName: "ID Item",
      width: 100,
      editable: false,
      cellClassName: "id_item_cotacao-cell",
    },
    {
      field: "descricao_item",
      headerName: "Descrição",
      width: 400,
      editable: false,
      cellClassName: "descricao_item-cell",
    },
    {
      field: "preco_unitario",
      headerName: "Preço Unitário (com ICMS incluso)",
      width: 250,
      editable: true,
      valueFormatter: (value: Number) =>
        value.toLocaleString("pt-BR", {
          style: "currency",  
          currency: "BRL",
        }),
    },
    {
      field: "ICMS",
      headerName: "Alíquota ICMS %",
      width: 150,
      editable: true,
      cellClassName: "ICMS-cell",
    },
    {
      field: "IPI",
      headerName: "Alíquota IPI %",
      width: 150,
      editable: true,
      cellClassName: "IPI-cell",
    },
    {
      field: "ST",
      headerName: "Alíquota ST %",
      width: 150,
      editable: true,
      cellClassName: "ST-cell",
    },
    {
      field: "quantidade",
      headerName: "Quantidade",
      width: 120,
      editable: false,
    },
    {
      field: "subtotal",
      headerName: "Subtotal (R$)",
      width: 150,
      editable: false,
      cellClassName: "subtotal-cell",
      valueFormatter: (value: Number) =>
        value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
  ];

  const handleCellClick = (params: GridCellParams) => {
    gridApiRef.current.startRowEditMode({
      id: params.row.id_item_cotacao,
      fieldToFocus: params.colDef.field,
    });
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
  };



  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

   const triggerSave = async () => {
     console.log("triggerSave");
     const row = Object.keys(rowModesModel)[0];
     const { fieldToFocus } = rowModesModel[row] as any;
     await stopEditMode(Number(row), fieldToFocus, false);
     setSaveItems(!saveItems);
     setIsEditing(false);
   };

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

  const handleCancelEdition = async () => {
    console.log("handleCancelEdition");
    const row = Object.keys(rowModesModel)[0];
    const { fieldToFocus } = rowModesModel[row] as any;
    stopEditMode(Number(row), fieldToFocus, true);
    setIsEditing(false);
    setReverseChanges(!reverseChanges);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isRowClicked = target.closest(".MuiDataGrid-row"); // Verifica se o clique foi em uma linha
      const isCellClicked = target.closest(".MuiDataGrid-cell"); // Verifica se o clique foi em uma célula
      if (!isRowClicked && !isCellClicked && isEditing) {
        handleCancelEdition(); // Reverte as edições se o clique foi fora de qualquer linha
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isEditing]);

      useEffect(() => {
        console.log("reverseChanges");
        console.log(
          "shouldExecuteResetItems.current: ",
          shouldExecuteResetItems.current
        );
          if (shouldExecuteResetItems.current) {
            console.log(items);
              setCurrentItems(items);
              return;
          }
      }, [reverseChanges]);

         useEffect(() => {
              if (shouldExecuteSaveItems.current) {
                  handleSave();
              }
      
          }, [saveItems]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: isLoading ? "center" : "start",
        gap: 1,
        padding: 1,
      }}
    >
      {alert && (
        <Alert severity={alert.severity as AlertColor}>{alert?.message}</Alert>
      )}
      <Stack direction="row" gap={2}>
        {!isSupplier && (
          <Button
            sx={{ ...BaseButtonStyles, width: 200 }}
            onClick={handleGenerateSupplierUrl}
          >
            Gerar Link de fornecedor
          </Button>
        )}
        {isSupplier && (
          <Button
            sx={{ ...BaseButtonStyles, width: 200 }}
            onClick={triggerSave}
          >
            Enviar cotação
          </Button>
        )}
        {isSupplier && (
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
            <Typography sx={typographyStyles.heading1}>
              Por favor, preencha a coluna preço unitário com seus valores!
            </Typography>
            <Typography sx={typographyStyles.heading2}>
              após preencher todos os itens, clique em "Enviar Cotação"!
            </Typography>
          </Stack>
        )}
        {isEditing && !isSupplier && (
          <Button
            onClick={triggerSave}
            sx={{ ...BaseButtonStyles, width: 200 }}
          >
            Salvar
          </Button>
        )}
      </Stack>

      {!isLoading && (
        <DataGrid
          rows={currentItems}
          getRowId={(row: QuoteItem) => row.id_item_cotacao}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          editMode="row"
          onRowEditStart={() => setIsEditing(true)}
          apiRef={gridApiRef}
          onRowSelectionModelChange={handleSelection}
          onRowModesModelChange={(rowModesModel: GridRowModesModel) =>
            handleRowModesModelChange(rowModesModel)
          }
          processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) =>
            processRowUpdate(newRow, oldRow)
          }
          onCellClick={handleCellClick}
          density="compact"
          pageSizeOptions={[50, 100]}
          disableRowSelectionOnClick
          sx={{
            ".id_item_cotacao-cell": {
              color: "gray",
            },
            ".subtotal-cell": {
              color: "gray",
            },
            '.descricao_item-cell': { 
                color: 'gray'
            }
          }}
        />
      )}
      {isLoading && <CircularProgress />}
    </Box>
  );
};

export default QuoteItemsTable;
