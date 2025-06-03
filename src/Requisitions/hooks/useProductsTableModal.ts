import { useContext, useState, useEffect } from "react";
import { ItemsContext } from "../context/ItemsContext";
import { Requisition, Product, AlertInterface, Item } from "../types";
import { searchProducts, fetchRequsitionById } from "../utils";
import { GridCallbackDetails, GridRowSelectionModel } from "@mui/x-data-grid";
import { Patrimony } from "../../Patrimony/types";


export const useProductsTableModal = (
  requisitionID?: number,
  patrimony?: Patrimony,
  choosingProductForPatrimony?: boolean,
  setChoosingProductForPatrimony?: React.Dispatch<React.SetStateAction<boolean>>
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
  const [isInsertingQuantity, setIsInsertingQuantity] =
    useState<boolean>(false);

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
      displayAlert(
        "Warning",
        "Selecione apenas um produto para substituir o item da requisição"
      );
      return;
    }
    if (choosingProductForPatrimony && rowSelectionModel.length > 1) {
      displayAlert(
        "Warning",
        "Selecione apenas um produto para ser o produto do patrimônio"
      );
      return;
    }
    if (rowSelectionModel.length > 0) {
      setIsSelecting(true);
      const localSelectedProducts = products.filter((product, _index) =>
        rowSelectionModel.find((id) => product.ID === id)
      );
      setSelectedProducts(localSelectedProducts);
      return;
    }
    setIsSelecting(false);
  };

  const fetchProductsByReqType = async () => {
    console.log('fetchProductsByReqType')
    if (requisition) {
      try {
        const products = await searchProducts(searchTerm, requisition.TIPO);
        setProducts(products);
      } catch (e: any) {
        displayAlert("error", e.message);
      }
    }
  };

  const fetchProductBySearchTerm = async () => {
    if (patrimony) {
      try {
        const products = await searchProducts(searchTerm);
        setProducts(products);
      } catch (e: any) {
        displayAlert("error", e.message);
      }
    }
  };

  const fetchRequisition = async () => {
    try {
      const requisition = await fetchRequsitionById(Number(requisitionID));
      setRequisition(requisition);
      if (requisition) {
        setRequisition(requisition);
      }
    } catch (e: any) {
      displayAlert("error", e.message);
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
    if(adding){ 
      toggleAdding?.();
    }
    setChangingProduct([false]);
    setChoosingProductForPatrimony?.(false);
    setProducts([]);
    setSearchTerm("");
    setSelectedProducts([]);
    setIsSelecting(false);
    setProducts([]);
    toggleRefreshItems();
  };

  useEffect(() => {
    //useEffect que busca produtos por tipo de requisição ou por patrimônio
    if (searchTerm !== "" && requisitionID) {
      fetchProductsByReqType();
      return;
    }
    if (searchTerm !== "" && patrimony) {
      fetchProductBySearchTerm();
      return;
    }
    if(searchTerm === ""){ 
      setProducts([]);
      setSelectedProducts([]);
      setIsSelecting(false);

    }
  }, [searchTerm]);

  useEffect(() => {
    //useEffect que busca requisição para adicionar items na requisição ou para escolher produto para patrimônio
    if (requisitionID && adding || changingProduct[0]) { //adicionando items na requisição ou alterando produto de um item da requisição
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
    setSearchTerm,
    productIdList,
    toggleRefreshItems,
    setChangingProduct,
    choosingProductForPatrimony,
    setChoosingProductForPatrimony,
    setProducts,
  };
};