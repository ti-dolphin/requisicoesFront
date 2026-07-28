import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quote } from "../../../models/requisicoes/Quote";
import { RequisitionItem } from "../../../models/requisicoes/RequisitionItem";

interface RequisitionItemState {
  addingProducts: boolean;
  items: RequisitionItem[];
  updatingRecentProductsQuantity: boolean;
  recentProductsAdded: number[];
  productsAdded: number[];
  replacingItemProduct: boolean;
  itemBeingReplaced: number | null;
  productSelected: number | null;
  newItems: number[];
  refresh: boolean;
  currentQuoteIdSelected: number | null;
  selectedQuote: Partial<Quote> | null;
  updatingChildReqItems: boolean;
  viewingItemAttachment: number | null;
  // 1 = anexo comum, 2 = nota fiscal
  viewingItemAttachmentType: number;
}
const initialState: RequisitionItemState = {
  addingProducts: false,
  items: [],
  updatingRecentProductsQuantity: false,
  recentProductsAdded: [],
  productsAdded: [],
  replacingItemProduct: false,
  itemBeingReplaced: null,
  productSelected: null,
  newItems: [],
  refresh: false,
  currentQuoteIdSelected: null,
  selectedQuote: null,
  updatingChildReqItems: false,
  viewingItemAttachment: null,
  viewingItemAttachmentType: 1,
};

const requisitionItemSlice = createSlice({
  name: "requisitionItem",
  initialState,
  reducers: {
    setAddingProducts(state, action: PayloadAction<boolean>) {
      state.addingProducts = action.payload;
    },
    setUpdatingRecentProductsQuantity(state, action: PayloadAction<boolean>) {
      state.updatingRecentProductsQuantity = action.payload;
    },
    setNewItems(state, action: PayloadAction<number[]>) {
      state.newItems = action.payload;
    },

    setRefresh(state, action: PayloadAction<boolean>) {
      state.refresh = action.payload;
    },
    setReplacingItemProduct(state, action: PayloadAction<boolean>) {
      state.replacingItemProduct = action.payload;
    },

    setItems(state, action: PayloadAction<RequisitionItem[]>) {
      state.items = action.payload;
    },

    replaceItem(state, action: PayloadAction<{id_item_requisicao: number, updatedItem: RequisitionItem}>) {
      const index = state.items.findIndex(item => item.id_item_requisicao === action.payload.id_item_requisicao);
      if (index !== -1) {
        state.items[index] = action.payload.updatedItem;
      }
    },

    setProductSelected(state, action: PayloadAction<number | null>) {
      state.productSelected = action.payload;
    },

    setItemBeingReplaced(state, action: PayloadAction<number | null>) {
      state.itemBeingReplaced = action.payload;
    },
    setRecentAddedProducts(state, action: PayloadAction<number[]>) {
      state.recentProductsAdded = action.payload;
    },
    setProductsAdded(state, action: PayloadAction<number[]>) {
      state.productsAdded = action.payload;
    },
    removeRecentProduct(state, action: PayloadAction<number>) {
      state.recentProductsAdded = state.recentProductsAdded.filter(
        (id) => id !== action.payload
      );
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter(
        (item) => item.id_item_requisicao !== action.payload
      );
    },
    clearRecentProducts(state) {
      state.recentProductsAdded = [];
    },
    clearNewItems(state) {
      state.newItems = [];
    },
    setCurrentQuoteIdSelected(state, action: PayloadAction<number | null>) {
      state.currentQuoteIdSelected = action.payload;
    },
    setSelectedQuote(state, action: PayloadAction<Partial<Quote> | null>) {
      state.selectedQuote = action.payload;
    },
    setUpdatingChildReqItems(state, action: PayloadAction<boolean>) {
      state.updatingChildReqItems = action.payload;
    },
    setViewingItemAttachment(state, action: PayloadAction<number | null>) {
      state.viewingItemAttachment = action.payload;
    },
    setViewingItemAttachmentType(state, action: PayloadAction<number>) {
      state.viewingItemAttachmentType = action.payload;
    }
  },
});

export const {
  setAddingProducts,
  setUpdatingRecentProductsQuantity,
  setRecentAddedProducts,
  removeRecentProduct,
  clearRecentProducts,
  setNewItems,
  clearNewItems,
  setProductsAdded,
  setReplacingItemProduct,
  setItemBeingReplaced,
  setProductSelected,
  setRefresh,
  setCurrentQuoteIdSelected,
  setSelectedQuote,
  setUpdatingChildReqItems,
  setViewingItemAttachment,
  setViewingItemAttachmentType,
  replaceItem,
  setItems,
  removeItem,
} = requisitionItemSlice.actions;

export default requisitionItemSlice.reducer;



