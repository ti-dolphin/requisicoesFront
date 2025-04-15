import { Alert, AlertColor, Box, Button, Modal, Stack, styled, TextField, Typography } from "@mui/material";
import {

  Product,
  ProductsTableModalProps,
  RequisitionItemPost,

} from "../../../types";
import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import {  postRequistionItems } from "../../../utils";
import typographyStyles from "../../../utilStyles";
import { CloseModalButton } from "../../../../generalUtilities";
import { useProductsTableModal } from "./hooks";
import { alertAnimation, BaseButtonStyles } from "../../../../utilStyles";
import { motion } from "framer-motion";
import InsertQuantitiesModal from "../InsertQuantitiesModal/InsertQuantitiesModal";

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
     productIdList
   } = useProductsTableModal(requisitionID);

   const gridApiRef = useGridApiRef();

   const handleCancelSelecting = ( ) =>  {
      setIsSelecting(false);
      setSelectedProducts([]);
      gridApiRef.current.setRowSelectionModel([]);
   };
   
   const filterNonRepeatedProducts = ( ) => { 
    return selectedProducts.map((product) => {
     if(!productIdList.includes(product.ID)){ 
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
    }).filter((item) => item !== undefined) as RequisitionItemPost[];
   }

   const handleSaveAddItems = async () => {
     const newProductItems: RequisitionItemPost[] = filterNonRepeatedProducts();
     console.log({newProductItems})
    if(newProductItems.length) {
        try {
          const data = await postRequistionItems(
            requisitionID,
            newProductItems
      
          );
          setAddedItems(data.insertedItems);
          setIsInsertingQuantity(true);
        } catch (e: any) {
          displayAlert("error", e.message);
        }
    }
   }

  return (
    <>
      <Modal
        open={adding}
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
                  {requisition.projeto_descricao?.DESCRICAO} | {requisition.DESCRIPTION}
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
                  <Button sx={BaseButtonStyles} onClick={handleSaveAddItems}>
                    Adicionar items
                  </Button>
                  <Button onClick={handleCancelSelecting} sx={BaseButtonStyles}>
                    Cancelar
                  </Button>
                </Stack>
              </motion.div>
            )}
          </Stack>

          <InsertQuantitiesModal
            setAddedItems={setAddedItems}
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
