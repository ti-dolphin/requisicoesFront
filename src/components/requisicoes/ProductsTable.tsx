import {
  GridCellModes,
  GridCellModesModel,
  GridCellParams,
  GridCloseIcon,
  GridRowModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import { Product, ProductPatrimonyType } from "../../models/Product";
import { Backdrop, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import BaseDataTable from "../shared/BaseDataTable";
import BaseTableToolBar from "../shared/BaseTableToolBar";
import { debounce } from "lodash";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { useProductPermissions } from "../../hooks/productPermissionsHook";
import { ProductService } from "../../services/ProductService";
import { setProductSelected, setRecentAddedProducts, removeRecentProduct } from "../../redux/slices/requisicoes/requisitionItemSlice";
import EditIcon from "@mui/icons-material/Edit";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useProductColumns } from "../../hooks/productColumnsHook";
import ProductAttachmentList from "../ProductAttachmentList";
import ProductStandardGuide from "../produtos/ProductStandardGuide";
import { setProducts, setViewingProductAttachment, setViewingStandardGuide } from "../../redux/slices/productSlice";
import { FixedSizeGrid } from "react-window";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { green, red } from "@mui/material/colors";
import ProductCard from "./ProductCard";
import { Requisition } from "../../models/requisicoes/Requisition";
import { fr } from "date-fns/locale";

interface ProductsTableProps {
  tipoFaturamento: number | null | undefined; // Tipo de faturamento a ser usado no filtro (0 = todos os produtos)
  fromReq?: boolean;
}

const ProductsTable = ({ tipoFaturamento, fromReq }: ProductsTableProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.user.user);
  const { addingProducts, recentProductsAdded, productsAdded, replacingItemProduct} = useSelector((state: RootState) => state.requisitionItem);
  const { editProductFieldsPermitted, hasStockPermission } = useProductPermissions(user);
  const {viewingProductAttachment, viewingStandardGuide, products, viewingProducts } = useSelector((state: RootState) => state.productSlice);
  const [searchTerm, setSearchTerm] = useState("");

  const [cellModesModel, setCellModesModel]  = React.useState<GridCellModesModel>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
  const { isMobile } = useIsMobile();
  const [patrimonyTypes, setPatrimonyTypes] = useState<ProductPatrimonyType[]>([]);
  // guarda os dados (código/descrição) dos produtos já adicionados nesta sessão do diálogo,
  // já que uma nova busca substitui "products" e o item selecionado pode sair da lista
  const [selectedProductsInfo, setSelectedProductsInfo] = useState<Product[]>([]);

  useEffect(() => {
    setSelectedProductsInfo((prev) => {
      const previouslyKnown = new Map(prev.map((product) => [product.ID, product]));
      return recentProductsAdded.map(
        (id) =>
          products.find((product) => product.ID === id) ??
          previouslyKnown.get(id) ?? { ID: id, codigo: "", descricao: `Produto ${id}` } as Product
      );
    });
  }, [recentProductsAdded, products]);

  const refreshProducts = useCallback(async () => {
    const params: any = { searchTerm };

    if (fromReq && (!tipoFaturamento || tipoFaturamento === 0)) {
      dispatch(setProducts([]));
      return;
    }

    params.tipoFaturamento = tipoFaturamento;

    const data = await ProductService.getMany(params);
    const sortedData = [...data].sort((a, b) => {
      const qtyA = a.quantidade_disponivel || 0;
      const qtyB = b.quantidade_disponivel || 0;
      return qtyB - qtyA;
    });

    dispatch(setProducts(sortedData));
  }, [dispatch, searchTerm, fromReq, tipoFaturamento]);

  const handleUpdatePatrimonyType = useCallback(async (productId: number, patrimonyTypeId: number | null) => {
    setIsUpdating(true);
    try {
      await ProductService.update(productId, {
        tipo_produto_patrimonio: patrimonyTypeId,
      });

      await refreshProducts();
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao atualizar tipo de patrimônio",
          type: "error",
        })
      );
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, refreshProducts]);
  const { columns } = useProductColumns({
    patrimonyTypes,
    onUpdatePatrimonyType: handleUpdatePatrimonyType,
    disablePatrimonyActions: isUpdating,
  });
  const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

  const handleCellClick = React.useCallback(
    (params: GridCellParams, event: React.MouseEvent) => {
      if (isUpdating) return;
      if (params.field === "__check__") return;
      if(params.field === 'anexos') return;
      
      if (!params.isEditable) {
        dispatch(
          setFeedback({
            message: "O campo selecionado não é editável",
            type: "error",
          })
        );
        return;
      }
      
      // Check field-specific permissions
      const stockFields = ['quantidade_estoque', 'unidade'];
      const permissionFields = ['perm_ti', 'perm_operacional', 'perm_faturamento_direto', 'perm_faturamento_dse'];
      const isStockField = stockFields.includes(params.field);
      const isPermissionField = permissionFields.includes(params.field);
      
      // Only administrators can edit permission fields
      if (isPermissionField && !user?.PERM_ADMINISTRADOR) {
        dispatch(
          setFeedback({
            message: "Apenas administradores podem editar permissões de produtos",
            type: "error",
          })
        );
        return;
      }
      
      // Stock users can only edit stock-related fields
      if (isStockField && !hasStockPermission && !editProductFieldsPermitted) {
        dispatch(
          setFeedback({
            message: "Você não tem permissão para editar este campo",
            type: "error",
          })
        );
        return;
      }
      
      // Non-stock fields require full product edit permission
      if (!isStockField && !isPermissionField && !editProductFieldsPermitted) {
        dispatch(
          setFeedback({
            message: "Você não tem permissão para editar este campo",
            type: "error",
          })
        );
        return;
      }
      
      if (addingProducts) {
        dispatch(
          setFeedback({
            message: "Você não pode alterar os campos do produto nesse momento",
            type: "error",
          })
        );
        return;
      }
      
      if (
        (event.target as any).nodeType === 1 &&
        !event.currentTarget.contains(event.target as Element)
      ) {
        return;
      }
      
      setCellModesModel((prevModel) => {
        return {
          ...Object.keys(prevModel).reduce(
            (acc, id) => ({
              ...acc,
              [id]: Object.keys(prevModel[id]).reduce(
                (acc2, field) => ({
                  ...acc2,
                  [field]: { mode: GridCellModes.View },
                }),
                {}
              ),
            }),
            {}
          ),
          [params.id]: {
            ...Object.keys(prevModel[params.id] || {}).reduce(
              (acc, field) => ({
                ...acc,
                [field]: { mode: GridCellModes.View },
              }),
              {}
            ),
            [params.field]: { mode: GridCellModes.Edit },
          },
        };
      });
    },
    [dispatch, editProductFieldsPermitted, hasStockPermission, addingProducts, isUpdating]
  );

  const handleChangeSelection = async (
    newRowSelectionModel: GridRowSelectionModel  ) => {
    if(replacingItemProduct){ 
      setRowSelectionModel(newRowSelectionModel);
      dispatch(setProductSelected(Number(newRowSelectionModel[0])));
      return;
    }

    const newIds = newRowSelectionModel as number[];
    // apenas os ids recém-marcados nesta mudança (os demais já estavam selecionados em buscas anteriores)
    const addedIds = newIds.filter((id) => !recentProductsAdded.includes(id));

    // Allow product 138331 to be added multiple times
    const alreadyAddedId = addedIds.find(
      (id) => id !== 138331 && productsAdded.includes(id)
    );
    if (alreadyAddedId !== undefined) {
      dispatch(setFeedback({ message: 'O produto ja foi adicionado a requisição', type: 'error' }));
      return;
    }

    dispatch(setRecentAddedProducts(newIds));
  };
  
  //Processa mudança de modo, edição ou visualização
  const handleCellModesModelChange = React.useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel);
    },
    []
  );
// após clicar fora da célula ou pressionar enter, essa função é chamda
//para salvar as mudanças
  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      const payload: any = {
        unidade: newRow.unidade,
        quantidade_estoque: newRow.quantidade_estoque,
      };
      
      // Adicionar campos de permissões se estiver visualizando produtos
      if (viewingProducts) {
        payload.perm_ti = newRow.perm_ti ? 1 : 0;
        payload.perm_operacional = newRow.perm_operacional ? 1 : 0;
        payload.perm_faturamento_direto = newRow.perm_faturamento_direto ? 1 : 0;
        payload.perm_faturamento_dse = newRow.perm_faturamento_dse ? 1 : 0;
      }
      
      try {
        setIsUpdating(true);
        const updatedProduct = await ProductService.update(newRow.ID, payload);
        await refreshProducts();
        return { ...newRow, ...updatedProduct };
      } catch (error) {
        dispatch(
          setFeedback({
            message: "Erro ao atualizar produto",
            type: "error",
          })
        );
        return oldRow;
      } finally {
        setIsUpdating(false);
      }
    },
    [dispatch, viewingProducts, refreshProducts]
  );
  //muda o termo de busca
  const changeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value.toLowerCase());
  };
  const getRowSelectionModelForContext = () => { 
    return addingProducts ? recentProductsAdded : rowSelectionModel;
  };
  //método para dar update na quantidade em estoque no mobile
  const saveProductQuantity = async (newQuantity: number) => {
    if (!productBeingEdited) return;
    setIsUpdating(true);
    try {
      await ProductService.update(
        productBeingEdited.ID,
        { quantidade_estoque: newQuantity }
      );
      await refreshProducts();
      setProductBeingEdited(null);
      setQuantity(0);
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao atualizar produto",
          type: "error",
        })
      );
    } finally {
      setIsUpdating(false);
    }
  };
  //faz debounce na mudançda da busca
  const debouncedHandleChangeSearchTerm = debounce(changeSearchTerm, 500);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      // Usa o tipoFaturamento passado como prop
      if (fromReq && (!tipoFaturamento || tipoFaturamento === 0)) {
        dispatch(setProducts([]));
        return;
      }

      await refreshProducts();
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao buscar produtos",
          type: "error",
        })
      );
    } finally {
      setIsFetching(false);
    }
  }, [dispatch, searchTerm, tipoFaturamento, refreshProducts, fromReq]);

  const fetchPatrimonyTypes = useCallback(async () => {
    try {
      const data = await ProductService.getPatrimonyTypes();
      setPatrimonyTypes(data);
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao buscar tipos de patrimônio",
          type: "error",
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!viewingProducts) return;
    fetchPatrimonyTypes();
  }, [viewingProducts, fetchPatrimonyTypes]);


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <BaseTableToolBar
        handleChangeSearchTerm={debouncedHandleChangeSearchTerm}
      />
      {addingProducts && selectedProductsInfo.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, px: 1, py: 1 }}>
          {selectedProductsInfo.map((product) => (
            <Chip
              key={product.ID}
              size="small"
              color="primary"
              variant="outlined"
              label={product.descricao}
              title={product.descricao}
              onDelete={() => dispatch(removeRecentProduct(product.ID))}
              sx={{
                minWidth: 0,
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          ))}
        </Box>
      )}
      <Box sx={{ position: "relative", flexGrow: 1 }}>
      {isMobile ? (
        <Box
          ref={gridContainerRef}
          sx={{
            flexGrow: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FixedSizeGrid
            rowCount={products.length}
            columnCount={1}
            columnWidth={280}
            height={gridContainerRef.current?.clientHeight || 0}
            rowHeight={290}
            width={300}
          >
            {({ columnIndex, rowIndex, style }) => {
              const row = products[rowIndex];
              return (
                <ProductCard
                  key={row.ID}
                  row={row}
                  setProductBeingEdited={setProductBeingEdited}
                  productBeingEdited={productBeingEdited}
                  saveProductQuantity={saveProductQuantity}
                />
              );
            }}
          </FixedSizeGrid>
        </Box>
      ) : (
        <BaseDataTable
          density="compact"
          rowSelection
          rowSelectionModel={getRowSelectionModelForContext()}
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          disableColumnMenu
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              "& .MuiCheckbox-root": {
                display: "none",
              },
            },
          }}
          disableColumnFilter
          disableMultipleRowSelection={replacingItemProduct}
          onRowSelectionModelChange={handleChangeSelection}
          checkboxSelection={addingProducts || replacingItemProduct}
          getRowId={(row: any) => row.ID}
          loading={isFetching}
          theme={theme}
          rows={products}
          columns={columns}
          cellModesModel={cellModesModel}
          initialState={{
            pagination: { paginationModel: { pageSize: 20 } },
          }}
          pageSizeOptions={[20]}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          processRowUpdate={processRowUpdate}
        />
      )}
      {isUpdating && (
        <Backdrop
          open={true}
          sx={{
            position: "absolute",
            zIndex: 10,
            color: "#fff",
            backgroundColor: "rgba(255,255,255,0.45)",
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      )}
      </Box>

      <Dialog
        open={viewingProductAttachment !== null}
        onClose={() => dispatch(setViewingProductAttachment(null))}
        fullWidth
        maxWidth="md"
      >
        <IconButton
          onClick={() => dispatch(setViewingProductAttachment(null))}
          sx={{
            color: "error.main",
            height: 30,
            width: 30,
            position: "absolute",
            top: 4,
            right: 4,
            boxShadow: 3,
          }}
        >
          <GridCloseIcon />
        </IconButton>
        <DialogTitle>Lista de Anexos</DialogTitle>
        <DialogContent>
          <ProductAttachmentList />
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingStandardGuide !== null}
        onClose={() => dispatch(setViewingStandardGuide(null))}
        fullWidth
        maxWidth="md"
      >
        <IconButton
          onClick={() => dispatch(setViewingStandardGuide(null))}
          sx={{
            color: "error.main",
            height: 30,
            width: 30,
            position: "absolute",
            top: 4,
            right: 4,
            boxShadow: 3,
          }}
        >
          <GridCloseIcon />
        </IconButton>
        <DialogTitle>Produto Padrão</DialogTitle>
        <DialogContent>
          <ProductStandardGuide />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProductsTable;

