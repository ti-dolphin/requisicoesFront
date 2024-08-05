import { createContext, useState } from "react";

interface Field {
    key?: string;
    label?: string;
}
interface RequisitionContextType {
    editingField: { isEditing: boolean; field: Field };
    refreshRequisition: boolean;
    creating: boolean;
    currentKanbanFilter?: {
        label: string;
    };
    activeStep?: number;
    changeActiveStep : (value: number) => void;
    handleChangeEditingField: (item: Field) => void;
    seteditingField: (value: { isEditing: boolean; field: Field }) => void;
    toggleRefreshRequisition: () => void;
    changeKanbanFilter: (value: {
        label: string;
    }) => void;
    toggleCreating: () => void;
}
interface RequisitionContextProviderProps {
    children: React.ReactNode;
}

//===========================================================================
export const RequisitionContext = createContext<RequisitionContextType>({
  creating: false,
  editingField: { isEditing: false, field: { label: "", key: "" } },
  refreshRequisition: false,
  changeActiveStep: () => {},
  handleChangeEditingField: () => {},
  seteditingField: () => {},
  toggleRefreshRequisition: () => {},
  toggleCreating: () => {},
  changeKanbanFilter: () => {},
});

export const RequisitionContextProvider = ({
    children,
}: RequisitionContextProviderProps) => {
    const [editingField, seteditingField] = useState<{
        isEditing: boolean;
        field: Field;
    }>({ isEditing: false, field: { label: "", key: "" } });
    const [refreshRequisition, setRefreshRequisition] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const [activeStep, setActiveStep ] = useState<number | undefined>();
    const [currentKanbanFilter, setCurrentKanbanFilter] = useState<{
        label: string;
    }>();

    const changeActiveStep = (value : number ) =>  { 
        setActiveStep(value);
    };
    const changeKanbanFilter = (filter: {
        label: string;
    }) => {
        setCurrentKanbanFilter(filter);
    };

    const handleChangeEditingField = (item: Field) => {
        console.log("editMode: ", { isEditing: true, field: item });
        seteditingField({ isEditing: true, field: item });
    };
    const toggleRefreshRequisition = () => {
        setRefreshRequisition(!refreshRequisition);
    };
    const toggleCreating = () => {
        console.log("toggleCreating - RequisitionContext: ");
        setCreating(!creating);
    };

    return (
      <RequisitionContext.Provider
        value={{
          editingField,
          refreshRequisition,
          creating,
          currentKanbanFilter,
          handleChangeEditingField,
          seteditingField,
          toggleRefreshRequisition,
          toggleCreating,
          changeKanbanFilter,
          activeStep,
          changeActiveStep,
        }}
      >
        {children}
      </RequisitionContext.Provider>
    );
};
