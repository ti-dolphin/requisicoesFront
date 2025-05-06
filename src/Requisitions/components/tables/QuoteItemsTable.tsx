import { useEffect, useRef, useState } from "react";
import { AlertInterface, Quote, QuoteItem } from "../../types";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowModel,
  GridRowModesModel,
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
import { green, red } from "@mui/material/colors";
import { updateQuoteItems } from "../../utils";
import { useParams } from "react-router-dom";

interface props {
  items: QuoteItem[];
  isSupplier: boolean | undefined;
  isEditing: boolean | undefined;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  saveQuoteData: () => Promise<void>;
  quoteData : Quote;
  shippingPrice: number;
  setCurrentQuoteData: (value: React.SetStateAction<Quote | undefined>) => void;
  originalQuoteData: Quote | undefined;
}

 const currencyFormatter = new Intl.NumberFormat("pt-BR", {
   style: "currency",
   currency: "BRL",
 });

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
     width: 350,
     flex: 1,
     editable: false,
     cellClassName: "descricao_item-cell",
   },
   { 
      field: 'observacao',
      headerName: 'Observação',
      width: 200,
      editable: true
   },
   {
     field: "preco_unitario",
     headerName: `Preço Unitário`,
     width: 150,
     editable: true,
     type: "number",
     valueFormatter: (value: Number) => currencyFormatter.format(Number(value)),
   },
   {
     field: "ICMS",
     headerName: "ICMS %",
     width: 100,
     editable: true,
     cellClassName: "ICMS-cell",
     valueFormatter: (value: number) =>
       value !== null && value !== undefined
         ? `${Number(value).toFixed(2)}%`
         : "",
   },
   {
     field: "IPI",
     headerName: "IPI %",
     width: 100, // Ajustado para 150
     editable: true,
     cellClassName: "IPI-cell",
     valueFormatter: (value: number) =>
       value !== null && value !== undefined
         ? `${Number(value).toFixed(2)}%`
         : "",
   },
   {
     field: "ST",
     headerName: "ST/DIFAL%",
     width: 100, // Ajustado para 150
     editable: true,
     cellClassName: "ST-cell",
     valueFormatter: (value: number) =>
       value !== null && value !== undefined
         ? `${Number(value).toFixed(2)}%`
         : "",
   },
   {
     field: "quantidade_solicitada",
     headerName: "Quantidade Solicitada",
     width: 170,
     editable: false,
   },
   {
     field: "quantidade_cotada",
     headerName: "Quantidade Cotada",
     width: 170,
     editable: true,
     cellClassName: "quantidade_cotada-cell",
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

 
  const fieldInstructions = () => {
    const formFields = [
      {
        label: "Preço Unitário",
        instructions: "com ICMS incluso",
      },
      {
        label: "Alíquota ICMS",
        instructions: "%",
      },
      {
        label: "Alíquota IPI",
        instructions: "%",
      },
      {
        label: "Alíquota ST",
        instructions: "%",
      },
      {
        label: "Quantidade Cotada",
        instructions:
          "qunatidade disponível para fornecer, caso seja diferente da quantidade solicitada",
      },
      { 
        label: 'Observação',
        instructions: 'Caso não tenha o item mas tenha algum similar, informe o nome do item aqui'
      }
    ];
    return (
      <Stack direction="column" flexWrap="wrap" gap={2} alignItems="start">
        <Typography sx={typographyStyles.heading2}>
          Por favor, preencha as seguintes colunas:
        </Typography>
        <Typography sx={typographyStyles.smallText} component="div">
          <ul>
            {formFields.map((field, index) => (
              <li key={index}>
                <Typography sx={typographyStyles.bodyText} component="span">
                  {field.label}{" "}
                  {field.instructions && (
                    <Typography
                      component="span"
                      sx={{
                        ...typographyStyles.smallText,
                        fontStyle: "italic",
                      }}
                    >
                      ({field.instructions})
                    </Typography>
                  )}
                </Typography>
              </li>
            ))}
          </ul>
        </Typography>
      </Stack>
    );
  };

const QuoteItemsTable = ({
  items,
  isSupplier,
  isEditing,
  setIsEditing,
  quoteData,
  saveQuoteData,
  shippingPrice,
  setCurrentQuoteData,
  originalQuoteData
}: props) => {
  const [currentItems, setCurrentItems] = useState<QuoteItem[]>([...items]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [reverseChanges, setReverseChanges] = useState(false);
  const [saveItems, setSaveItems] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertInterface>();
  const gridApiRef = useGridApiRef();
  const shouldExecuteSaveItems = useRef(false);
  const shouldExecuteResetItems = useRef(false);
  const { quoteId } = useParams();

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

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    shouldExecuteSaveItems.current = true;
    shouldExecuteResetItems.current = true;
    setRowModesModel(newRowModesModel);
  };

  const validateQuotedQuantity = (item: QuoteItem) => {
    const updatedRow = { ...item } as QuoteItem;
    const { quantidade_solicitada, quantidade_cotada } = updatedRow;
    if (quantidade_cotada > quantidade_solicitada) {
      displayAlert(
        "warning",
        "Quantidade cotada não pode ser maior que a quantidade solicitada"
      );
      updatedRow.quantidade_cotada = quantidade_solicitada;
    }
    return updatedRow;
  };

  function convertToNumber(valor: string | number) {
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      const valorLimpo = valor
        .replace(/[^\d,.]/g, "")
        .replace(/\.(?=\d{3})/g, "")
        .replace(",", ".");

      const numero = parseFloat(valorLimpo);
      return isNaN(numero) ? 0 : numero;
    }
    return 0;
  }

  const calculateSubtotal = (item: QuoteItem) => {
    const precoUnitario = calculateTaxes(item);
    const quantidadeCotada = item.quantidade_cotada || 0;
    const subtotal = precoUnitario * quantidadeCotada;
    item.ICMS = convertToNumber(item.ICMS);
    item.IPI = convertToNumber(item.IPI);
    item.ST = convertToNumber(item.ST);
    item.subtotal = subtotal;
    return item;
  };

  const calculateTaxes = (item: QuoteItem): number => {
    const updatedRow = { ...item } as QuoteItem;
    const { preco_unitario, IPI, ST } = updatedRow;
    const precoUnitario = convertToNumber(preco_unitario);
    const ipi = convertToNumber(IPI);
    const st = convertToNumber(ST);
    const unitPriceWithTaxes = precoUnitario * (1 + (ipi + st) / 100);
    return unitPriceWithTaxes;
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    console.log("processRowUpdate");
    if (isEditing) {
      let updatedRow = { ...newRow } as QuoteItem;
      updatedRow = validateQuotedQuantity(updatedRow);
      updatedRow = calculateSubtotal(updatedRow);
      setCurrentItems(
        currentItems.map((item) =>
          item.id_item_cotacao === updatedRow.id_item_cotacao
            ? updatedRow
            : item
        )
      );
      return updatedRow;
    }
    return oldRow as QuoteItem;
  };

    const validateItems = (items: QuoteItem[]) => {
      console.log("validateItems");

      if (!items || items.length === 0) {
        throw new Error("A cotação deve conter pelo menos um item");
      }
      for (const [index, item] of items.entries()) {
        if (!item.preco_unitario || item.preco_unitario === 0) {
          if (item.quantidade_cotada !== 0) {
            throw new Error(
              `Item ${index + 1} (${
                item.descricao_item
              }): Quando o preço unitário é zero, a quantidade cotada deve ser 0`
            );
          }
        }
        if (item.quantidade_cotada < 0) {
          throw new Error(
            `Item ${index + 1} (${
              item.descricao_item
            }): A quantidade cotada não pode ser negativa`
          );
        }
      }
    };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await saveQuoteData();
      validateItems(currentItems);
      const response = await updateQuoteItems(currentItems, Number(quoteId), isSupplier);
      if (response.status === 200) {
        displayAlert("success", "items da cotação atualizados com sucesso!");
        console.log('updated items: ', response.data)
        const updatedItems = response.data;
        setCurrentItems(updatedItems);
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsEditing(true);
      displayAlert("error", e.message);
      setIsLoading(false);
    }finally{ 
      setIsEditing(false)
    }
  };

  const handleCellClick = (params: GridCellParams) => {
    gridApiRef.current.startRowEditMode({
      id: params.row.id_item_cotacao,
      fieldToFocus: params.colDef.field,
      deleteValue: true
    });
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 8000);
    setAlert({ severity, message });
    return;
  };

  const triggerSave = async () => {
    try {
      console.log("triggerSave");
      const row = Object.keys(rowModesModel)[0];
      const { fieldToFocus } = rowModesModel[row] as any;
      await stopEditMode(Number(row), fieldToFocus, false);
      setSaveItems(!saveItems);
      setIsEditing(false);
    } catch (e) {
      setSaveItems(!saveItems);
      setIsEditing(false);
    }
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
    try {
      const row = Object.keys(rowModesModel)[0];
      const { fieldToFocus } = rowModesModel[row] as any;
      stopEditMode(Number(row), fieldToFocus, true);
    } catch (e) {
      console.log(e);
    } finally {
      console.log('finally');
      setIsEditing(false);
      setReverseChanges(!reverseChanges);
    }
  };

  useEffect(() => {
    if (shouldExecuteResetItems.current) {
      console.log('reversing changes')
      console.log('setting orgiinal data: ', originalQuoteData)
      setCurrentQuoteData(originalQuoteData)
      setCurrentItems(items);
      return;
    }
  }, [reverseChanges]);

  useEffect(() => {
    if (shouldExecuteSaveItems.current) {
      handleSave();
    }
  }, [saveItems]);

  useEffect(() => {
    if (isEditing) {
      shouldExecuteSaveItems.current = true;
      shouldExecuteResetItems.current = true;
    }
  }, [isEditing]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: isLoading ? "center" : "start",
        gap: 2,
        padding: 1,
      }}
    >
    
      {alert && (
        <Alert
          sx={{
            border:
              alert.severity === "error"
                ? "1px solid red"
                : alert.severity === "warning"
                ? "1px solid orange"
                : "1px solid green",
          }}
          severity={alert.severity as AlertColor}
        >
          {alert?.message}
        </Alert>
      )}
      <Stack direction="column" gap={2} sx={{ alignItems: "start" }}>
        {!isSupplier && (
          <Button
            sx={{ ...BaseButtonStyles, width: 200 }}
            onClick={handleGenerateSupplierUrl}
          >
            Gerar Link de fornecedor
          </Button>
        )}
        {isSupplier && (
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            gap={2}
          >
            <Button
              sx={{
                ...BaseButtonStyles,
                width: 200,
                backgroundColor: green[600],
                "&:hover": {
                  backgroundColor: green[500],
                },
              }}
              onClick={triggerSave}
            >
              Enviar cotação
            </Button>
            {isEditing && (
              <Button
                onClick={handleCancelEdition}
                sx={{
                  ...BaseButtonStyles,
                  width: 200,
                  backgroundColor: red[700],
                  "&:hover": {
                    backgroundColor: red[500],
                  },
                }}
              >
                Cancelar edição
              </Button>
            )}
          </Stack>
        )}
        {isSupplier && (
          <Stack direction="column" flexWrap="wrap" gap={2} alignItems="start">
            {fieldInstructions()}
          </Stack>
        )}
        {isEditing && !isSupplier && (
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            gap={2}
          >
            <Button
              onClick={triggerSave}
              sx={{
                ...BaseButtonStyles,
                width: 200,
                backgroundColor: green[700],
                "&:hover": {
                  backgroundColor: green[500],
                },
              }}
            >
              Salvar
            </Button>
            <Button
              onClick={handleCancelEdition}
              sx={{
                ...BaseButtonStyles,
                width: 200,
                backgroundColor: red[700],
                "&:hover": {
                  backgroundColor: red[500],
                },
              }}
            >
              Cancelar edição
            </Button>
          </Stack>
        )}
      </Stack>
      <Stack direction="row" gap={1} alignItems="center">
        <Typography sx={{ ...typographyStyles.heading2 }}>Total:</Typography>
        <Typography sx={{ ...typographyStyles.heading2, color: green[500] }}>
          {currentItems && currencyFormatter.format(
            currentItems.reduce((acc, item) => acc + item.subtotal, 0) +
            Number(shippingPrice) 
          ) 
          }
        </Typography>
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
          // onRowSelectionModelChange={handleSelection}
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
            maxHeight: 500,
            ".id_item_cotacao-cell": {
              color: "gray",
            },
            ".subtotal-cell": {
              color: "gray",
            },
            ".descricao_item-cell": {
              color: "gray",
            },
            ".quantidade_cotada-cell": {
              color: "gray",
            },
            "& .MuiDataGrid-menuIcon": {
              display: "none",
            },
            width: "100%",
          }}
        />
      )}
      {isLoading && <CircularProgress />}
    </Box>
  );
};

export default QuoteItemsTable;
