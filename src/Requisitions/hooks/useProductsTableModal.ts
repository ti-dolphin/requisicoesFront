import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { ItemsContext } from "../context/ItemsContext";
import { Requisition, Product, AlertInterface, Item } from "../types";
import { searchProducts, fetchRequsitionById, updateRequisitionItems, updateManyProducts } from "../utils";
import { GridCallbackDetails, GridRowModel, GridRowModesModel, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { Patrimony } from "../../Patrimony/types";
import { updatePatrimony } from "../../Patrimony/utils";


export const useProductsTableModal = (
  requisitionID?: number,
  patrimony?: Patrimony,
  choosingProductForPatrimony?: boolean,
  setChoosingProductForPatrimony?: React.Dispatch<
    React.SetStateAction<boolean>
  >,
  setViewingProducts?: React.Dispatch<React.SetStateAction<boolean>>,
  viewingProducts?: boolean,
) => {
  const {
    adding,
    toggleAdding,
    productIdList,
    changingProduct,
    setChangingProduct,
    toggleRefreshItems,
  } = useContext(ItemsContext);

  const [requisition, setRequisition] = useState<Requisition>();
  const [products, setProducts] = useState<Product[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [addedItems, setAddedItems] = useState<Item[]>([]);
  const [isInsertingQuantity, setIsInsertingQuantity] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingProducts, setEditingProducts] = useState<boolean>(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [editedProducts, setEditedProducts] = useState<Product[]>([]);
  const [save, setSave] = useState<boolean>(false);
   const gridApiRef = useGridApiRef();
  const shouldExecuteSave = useRef(false);
  const shouldExecuteReset= useRef(false);



  const stopEditMode = async (
    row: number,
    fieldToFocus: string,
    ignoreModifications: boolean
  ) => {
    console.log("stopEditMode")
    gridApiRef.current.stopRowEditMode({
      id: row,
      field: fieldToFocus,
      ignoreModifications,
    });
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const handleSelectionChange = (
    rowSelectionModel: GridRowSelectionModel,
    _details: GridCallbackDetails
  ) => {
    if (changingProduct[0] && rowSelectionModel.length > 1) {
      //se estiver substituindo item da requisição
      displayAlert(
        "Warning",
        "Selecione apenas um produto para substituir o item da requisição"
      );
      return;
    }
    if (choosingProductForPatrimony && rowSelectionModel.length > 1) {
      // se estiver escolhendo um produto para o patrimonio e selecionar mais de um
      displayAlert(
        "Warning",
        "Selecione apenas um produto para ser o produto do patrimônio"
      );
      return;
    }
    if (rowSelectionModel.length > 0) {
      // adicionando items na requisição
      setIsSelecting(true);
      const localSelectedProducts = products.filter((product, _index) =>
        rowSelectionModel.find((id) => product.ID === id)
      );
      setSelectedProducts(localSelectedProducts);
      return;
    }
    setSelectedProducts([]);
    setIsSelecting(false);
  };

  const fetchProductsByReqType = async () => {
    if (requisition) {
      try {
        setIsLoading(true);
        const products = await searchProducts(searchTerm, requisition.TIPO);
        setProducts(products);
      } catch (e: any) {
        displayAlert("error", e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchProductBySearchTerm = async () => {
    console.log('fetchProductBySearchTerm')
    if (patrimony || viewingProducts) {
      try {
        setIsLoading(true);
        const products = await searchProducts(searchTerm);
        setProducts(products);
      } catch (e: any) {
        displayAlert("error", e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchRequisition = async () => {
    try {
      setIsLoading(true);
      const requisition = await fetchRequsitionById(Number(requisitionID));
      setRequisition(requisition);
      if (requisition) {
        setRequisition(requisition);
      }
    } catch (e: any) {
      displayAlert("error", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = e.target as any;
    if (e.key === "Enter") {
      const newSearchTerm = value.toUpperCase();
      setSearchTerm(newSearchTerm);
    }
  };

  const handleClose = () => {
    if (adding) {
      toggleAdding?.();
    }
    if(setViewingProducts){ 
      setViewingProducts(false);
    }
    setChangingProduct([false]);
    setChoosingProductForPatrimony?.(false);
    setProducts([]);
    setEditedProducts([]);
    setSearchTerm("");
    setSelectedProducts([]);
    setIsSelecting(false);
    setProducts([]);
    toggleRefreshItems();
  };
 const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    console.log('newRowModesModel: ', newRowModesModel)
    shouldExecuteSave.current = true;
    shouldExecuteReset.current = true;
    setRowModesModel(newRowModesModel);
  };

  const handleSaveProductsEdition = useCallback(async () => {
    //salva os produtos editados (campo quantidade apenas)
    try {
      const response = await updateManyProducts(editedProducts);
      if (response.status === 200) {
        displayAlert("success", "Produtos atualizados com sucesso!");
        setEditingProducts(false);
        // handleClose();
      }
    } catch (e: any) {
      displayAlert("error", e.message);
    } finally {
      setIsLoading(false);
    }
  }, [save]);
  
    const handleSaveChangeItemProduct = async () => {
      //atualiza o item substituído com um novo produto
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


  const triggerSave = async () => {
      const row = Object.keys(rowModesModel)[0];
      if (rowModesModel[row]) {
        const { fieldToFocus } = rowModesModel[row] as any;
        await stopEditMode(Number(row), fieldToFocus, false);
      }
      setSave(!save);
      setEditingProducts(false);
  };


  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    if(products){ 
      if (editingProducts && products) {
        const updatedRow = { ...newRow } as Product;
        console.log('updatedRow: ', updatedRow);
        setEditedProducts([...editedProducts, updatedRow]);
        setProducts(
          products.map((item: Product) =>
            item.ID === updatedRow.ID ? updatedRow : item
          )
        );
        return updatedRow;
      }
      return oldRow as Product;
    }
  };

  useEffect(() => {
    if (shouldExecuteSave.current) {
      handleSaveProductsEdition();
    }
  }, [save, handleSaveProductsEdition]);

  useEffect(() => {
    //useEffect que busca produtos por tipo de requisição ou por patrimônio
    console.log('serachTerm: ', searchTerm)
    if (searchTerm !== "" && requisitionID) {
      fetchProductsByReqType();
      return;
    }
    if (searchTerm !== "" && (patrimony || viewingProducts)) {
      fetchProductBySearchTerm();
      return;
    }
    if (searchTerm === "") {
      setProducts([]);
      setSelectedProducts([]);
      setIsSelecting(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    //useEffect que busca requisição para adicionar items na requisição ou para escolher produto para patrimônio
    if ((requisitionID && adding) || changingProduct[0]) {
      //adicionando items na requisição ou alterando produto de um item da requisição
      fetchRequisition();
      return;
    }
  }, [adding, changingProduct]);

  return {
    products,
    requisition,
    alert,
    handleSearch,
    adding,
    changingProduct,
    handleClose,
    searchTerm,
    selectedProducts,
    setSelectedProducts,
    isSelecting,
    setIsSelecting,
    handleSelectionChange,
    displayAlert,
    addedItems,
    setAddedItems,
    isInsertingQuantity,
    setIsInsertingQuantity,
    productIdList,
    toggleRefreshItems,
    gridApiRef,
    stopEditMode,
    setChangingProduct,
    choosingProductForPatrimony,
    setChoosingProductForPatrimony,
    setProducts,
    setSearchTerm,
    isLoading,
    setIsLoading,
    editingProducts,
    setEditingProducts,
    handleRowModesModelChange,
    processRowUpdate,
    editedProducts,
    rowModesModel,
    handleSaveProductsEdition,
    handleSaveChangeItemProduct,
    handleSaveProductForPatrimony,
    triggerSave,
  };
};