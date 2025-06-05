import {
  Alert,
  AlertColor,
  Box,
  Button,
  CircularProgress,
  Modal,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import {
  Item,
  Product,
  ProductsTableModalProps,
  RequisitionItemPost,
} from "../../../types";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { postRequistionItems, updateRequisitionItems } from "../../../utils";
import typographyStyles from "../../../utilStyles";
import { CloseModalButton } from "../../../../generalUtilities";
import { useProductsTableModal } from "../../../hooks/useProductsTableModal";
import { alertAnimation, BaseButtonStyles } from "../../../../utilStyles";
import { motion } from "framer-motion";
import InsertQuantitiesModal from "../InsertQuantitiesModal/InsertQuantitiesModal";
import { updatePatrimony } from "../../../../Patrimony/utils";

const FullScreenModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: 6,
  width: "90vw", // 90% da largura da tela
  height: "95vh", // 90% da altura da tela
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  borderRadius: theme.shape.borderRadius,
  outline: "none", // Remove a borda padrão
}));

const columns: GridColDef[] = [
  {
    headerName: "Nome",
    field: "nome_fantasia",
    flex: 1,
    width: 250,
  },
  {
    headerName: "Codigo TOTVS",
    field: "codigo",
    width: 180,
  },
];

export const ProductsTableModal: React.FC<ProductsTableModalProps> = ({
  requisitionID,
  patrimony,
  choosingProductForPatrimony,
  setChoosingProductForPatrimony,
}) => {
  const {
    products,
    requisition,
    alert,
    handleSearch,
    adding,
    handleClose,
    isSelecting,
    setIsSelecting,
    selectedProducts,
    setSelectedProducts,
    handleSelectionChange,
    displayAlert,
    addedItems,
    setAddedItems,
    isInsertingQuantity,
    setIsInsertingQuantity,
    productIdList,
    changingProduct,
    setProducts,
    setSearchTerm,
    isLoading,
    setIsLoading,
  } = useProductsTableModal(
    requisitionID,
    patrimony,
    choosingProductForPatrimony,
    setChoosingProductForPatrimony
  );
  const gridApiRef = useGridApiRef();

  const handleCancelSelecting = () => {
    setIsSelecting(false);
    setSelectedProducts([]);
    gridApiRef.current.setRowSelectionModel([]);
  };

  const filterNonRepeatedProducts = () => {
    return selectedProducts
      .map((product) => {
        if (!productIdList.includes(product.ID)) {
          return {
            ID: 0,
            QUANTIDADE: 0,
            ID_REQUISICAO: requisitionID,
            ID_PRODUTO: product.ID,
            OBSERVACAO: null,
            ATIVO: 1,
            OC: null,
          };
        }
      })
      .filter((item) => item !== undefined) as RequisitionItemPost[];
  };

  const handleSaveAddItems = async () => {
    const newProductItems: RequisitionItemPost[] = filterNonRepeatedProducts();
    if (newProductItems.length) {
      try {
        setIsLoading(true);
        if (requisitionID === undefined) {
          displayAlert("error", "ID da requisição não definido.");
          return;
        }
        const data = await postRequistionItems(requisitionID, newProductItems);
        setSearchTerm("");
        setAddedItems(data.insertedItems);
        setIsInsertingQuantity(true);
      } catch (e: any) {
        displayAlert("error", e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveChangeItemProduct = async () => {
    console.log("handleSaveChangeItemProduct");
    let updatingItem = changingProduct[1];
    const selectedProduct = selectedProducts[0];
    if (updatingItem) {
      updatingItem.ID_PRODUTO = selectedProduct.ID;
    }
    const arrayFromSingleItem: Item[] = updatingItem ? [updatingItem] : [];
    if (requisitionID === undefined) {
      displayAlert("error", "ID da requisição não definido.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await updateRequisitionItems(
        arrayFromSingleItem,
        requisitionID
      );
      if (response.status === 200) {
        handleClose();
      }
    } catch (e: any) {
      displayAlert("error", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProductForPatrimony = async () => {
    const selectedProduct = selectedProducts[0];
    if (patrimony && selectedProduct) {
      try {
        setIsLoading(true);
        await updatePatrimony({
          ...patrimony,
          id_produto: selectedProduct.ID,
        });
        handleClose();
      } catch (e: any) {
        displayAlert("error", e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Modal
        open={
          adding || changingProduct[0] || Boolean(choosingProductForPatrimony)
        }
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <FullScreenModalBox>
          <CloseModalButton handleClose={handleClose} />
          {alert && (
            <Alert severity={alert.severity as AlertColor}>
              {alert.message}
            </Alert>
          )}
          <Stack sx={{ height: "100%", gap: 1, padding: 0.5 }}>
            {isLoading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "20%",
                  md: "5%",
                },
                display: "flex",
                alignItems: "center",
                flexDirection: {
                  xs: "column",
                  sm: "column",
                  md: "row",
                },
                gap: 1,
              }}
            >
              {requisition && (
                <Typography sx={typographyStyles.heading2}>
                  {requisition.projeto_descricao?.DESCRICAO} |{" "}
                  {requisition.DESCRIPTION}
                </Typography>
              )}
              <TextField
                variant="outlined"
                onKeyDown={handleSearch}
                InputProps={{
                  sx: { borderRadius: 10, height: 40 },
                  placeholder: "busque por nome...",
                }}
              />
            </Box>

            <Box
              sx={{
                height: {
                  xs: "70%",
                  md: "80%",
                },
              }}
            >
              <DataGrid
                checkboxSelection
                sx={{
                  "& .MuiDataGrid-menuIconButton": {
                    display: "none",
                  },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        height: "100%",
                      }}
                    >
                      <Typography sx={typographyStyles.heading2}>
                        Pesquise o produto desejado
                      </Typography>
                    </Box>
                  ),
                }}
                rowSelectionModel={selectedProducts.map(
                  (product) => product.ID
                )}
                onRowSelectionModelChange={(
                  rowSelectionModel: GridRowSelectionModel,
                  details: GridCallbackDetails
                ) => handleSelectionChange(rowSelectionModel, details)}
                density="compact"
                getRowId={(row: Product) => row.ID}
                rows={products}
                columns={columns}
                apiRef={gridApiRef}
                pageSizeOptions={[100]}
              />
            </Box>
            {isSelecting && (
              <motion.div {...alertAnimation}>
                <Stack
                  direction="row"
                  gap={2}
                  alignItems={"center"}
                  padding={1}
                >
                  {adding && (
                    <Button sx={BaseButtonStyles} onClick={handleSaveAddItems}>
                      Adicionar items
                    </Button>
                  )}
                  {changingProduct[0] && (
                    <Button
                      sx={BaseButtonStyles}
                      onClick={handleSaveChangeItemProduct}
                    >
                      Substituir o item selecionado
                    </Button>
                  )}
                  {choosingProductForPatrimony && (
                    <Button
                      sx={BaseButtonStyles}
                      onClick={handleSaveProductForPatrimony}
                    >
                      Definir produto
                    </Button>
                  )}
                  <Button onClick={handleCancelSelecting} sx={BaseButtonStyles}>
                    Cancelar
                  </Button>
                </Stack>
              </motion.div>
            )}
          </Stack>

          <InsertQuantitiesModal
            setAddedItems={setAddedItems}
            setProducts={setProducts}
            addedItems={addedItems}
            isInsertingQuantity={isInsertingQuantity}
            setIsInsertingQuantity={setIsInsertingQuantity}
            setSelectedProducts={setSelectedProducts}
            reqID={requisitionID}
          />
        </FullScreenModalBox>
      </Modal>
    </>
  );
};

export default ProductsTableModal;
