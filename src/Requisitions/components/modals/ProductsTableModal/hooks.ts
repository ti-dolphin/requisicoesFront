import { useContext, useState, useEffect } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
import { Requisition, Product, AlertInterface, Item } from "../../../types";
import { searchProducts, fetchRequsitionById } from "../../../utils";
import { GridCallbackDetails, GridRowSelectionModel } from "@mui/x-data-grid";


export const useProductsTableModal = (requisitionID: number) => {
    const { adding, toggleAdding, productIdList } = useContext(ItemsContext);
    const [requisition, setRequisition] = useState<Requisition>();
    const [products, setProducts] = useState<Product[]>([]);
    const [alert, setAlert] = useState<AlertInterface>();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [addedItems, setAddedItems] = useState<Item[]>([]);
    const [isInsertingQuantity, setIsInsertingQuantity] = useState<boolean>(false);
    const displayAlert = async (severity: string, message: string) => {
        setTimeout(() => {
            setAlert(undefined);
        }, 3000);
        setAlert({ severity, message });
        return;
    };

    const handleSelectionChange = (rowSelectionModel: GridRowSelectionModel,
        _details: GridCallbackDetails) => {
        if (rowSelectionModel.length > 0) {
            setIsSelecting(true);
            const localSelectedProducts = products.filter((product, _index) => rowSelectionModel.find((id) => product.ID === id));
            setSelectedProducts(localSelectedProducts);
            return;
        }
        setIsSelecting(false);
    }

    const fetchProducts = async () => {
        if (requisition) {
            try {
                const products = await searchProducts(searchTerm, requisition.TIPO);
                setProducts(products);
            } catch (e: any) {
                displayAlert("error", e.message);
            }
        }
    };

    const fetchRequisition = async () => {
        try {
            const requisition = await fetchRequsitionById(requisitionID);
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
            console.log('setting new searchTerm')
            const newSearchTerm = value.toUpperCase();
            console.log('newSearchTerm', newSearchTerm)
            setSearchTerm(newSearchTerm);
        }
    }

    const handleClose = () => {
        toggleAdding();
        setProducts([]);
        setSearchTerm('');
        setSelectedProducts([]);
    }

    useEffect(() => {
        console.log('useEffect search term');
        if (searchTerm !== '') {
            console.log('fetching products')
            fetchProducts();
            return;
        };

    }, [searchTerm, adding]);

    useEffect(() => {
        fetchRequisition();
    }, [adding]);
    return {
        products,
        requisition,
        alert,
        handleSearch,
        adding,
        handleClose,
        searchTerm,
        selectedProducts, setSelectedProducts,
        isSelecting, setIsSelecting,
        handleSelectionChange,
        displayAlert,
        addedItems, setAddedItems,
        isInsertingQuantity, setIsInsertingQuantity,
        productIdList
    }
}