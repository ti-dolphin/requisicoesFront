import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Opportunity } from "../../../models/oportunidades/Opportunity";

export interface OpportunityState {
  creating: boolean;
  viewing: boolean;
  editing: boolean;
  deleting: boolean;
  opportunity: Partial<Opportunity> | null;
  deletingOpp : Opportunity | null;

}

const initialState: OpportunityState = {
  creating: false,
  viewing: false,
  editing: false,
  deleting: false,
  opportunity: null,
  deletingOpp : null
};

const opportunitySlice = createSlice({
  name: "opportunity",
  initialState,
  reducers: {
    setCreating(state, action: PayloadAction<boolean>) {
      state.creating = action.payload;
    },
    setViewing(state, action: PayloadAction<boolean>) {
      state.viewing = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.editing = action.payload;
    },
    setDeleting(state, action: PayloadAction<boolean>) {
      state.deleting = action.payload;
    },
    setDeletingOpp(state, action: PayloadAction<Opportunity | null>) {
      state.deletingOpp = action.payload;
    },
    setOpportunity(state, action: PayloadAction<Partial<Opportunity> | null>) {
      state.opportunity = action.payload;
    },
    updateOpportunityFields(state, action: PayloadAction<Partial<Opportunity>>) {
      state.opportunity = { ...(state.opportunity ?? {}), ...action.payload };
    },
  },
});

export const {
  setCreating,
  setViewing,
  setEditing,
  setDeleting,
  setOpportunity,
  updateOpportunityFields,
} = opportunitySlice.actions;
export default opportunitySlice.reducer;
