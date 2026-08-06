import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import feedbackReducer from './slices/feedBackSlice';
import requisitionTableReducer from './slices/requisicoes/requisitionTableSlice';
import requisitionReducer from './slices/requisicoes/requisitionSlice';
import requisitionItemReducer from './slices/requisicoes/requisitionItemSlice';
import quoteReducer from './slices/requisicoes/quoteSlice';
import quoteItemReducer from './slices/requisicoes/quoteItemSlice';
import opportunityTableReducer from './slices/oportunidades/opportunityTableSlice';
import opportunityReducer from './slices/oportunidades/opportunitySlice';
import patrimonyTableReducer from './slices/patrimonios/PatrimonyTableSlice';
import checklistTableReducer from './slices/patrimonios/ChecklistTableSlice';
import productSliceReducer from './slices/productSlice';
import requisitionCommentReducer from './slices/requisicoes/requisitionCommentSlice';
import attendingItemsReducer from './slices/requisicoes/attenItemsSlice';
import notesTableReducer from './slices/apontamentos/notesTableSlice';
import pontoTableReducer from './slices/apontamentos/pontoTableSlice';
import problemaTableReducer from './slices/apontamentos/problemaTableSlice';
import commonFiltersReducer from './slices/apontamentos/commonFiltersSlice';
import ordemCompraTableReducer from './slices/ordensCompra/ordemCompraTableSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    feedback: feedbackReducer,
    requisitionTable: requisitionTableReducer,
    requisition: requisitionReducer,
    requisitionItem: requisitionItemReducer,
    quote: quoteReducer,
    quoteItem: quoteItemReducer,
    opportunityTable: opportunityTableReducer,
    opportunity: opportunityReducer,
    patrionyTable: patrimonyTableReducer,
    checklistTable: checklistTableReducer,
    productSlice: productSliceReducer,
    requisitionComment: requisitionCommentReducer,
    attendingItemsSlice: attendingItemsReducer,
    notesTable: notesTableReducer,
    pontoTable: pontoTableReducer,
    problemaTable: problemaTableReducer,
    commonFilters: commonFiltersReducer,
    ordemCompraTable: ordemCompraTableReducer,
  },
});

// Tipos para uso com TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
