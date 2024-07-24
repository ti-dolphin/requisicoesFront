import { createContext, useState } from "react";

interface Field {
    key?: string;
    label?: string;
}
interface RequisitionContextType {
    editingField: { isEditing: boolean; field: Field };
    refreshRequisition: boolean;
    creating: boolean;
    currentKanbanFilter: {
        label: string;
        status: string;
    };
    handleChangeEditingField: (item: Field) => void;
    seteditingField: (value: { isEditing: boolean; field: Field }) => void;
    toggleRefreshRequisition: () => void;
    changeKanbanFilter: (value: {
        label: string;
        status: string;
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
    currentKanbanFilter: {label : 'A Fazer', status: 'requisitado'},
    handleChangeEditingField: () => { },
    seteditingField: () => { },
    toggleRefreshRequisition: () => { },
    toggleCreating: () => { },
    changeKanbanFilter: () => { }
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
    const [currentKanbanFilter, setCurrentKanbanFilter] = useState<{
        label: string;
        status: string;
    }>({ label: "A Fazer", status: "requisitado" });

    const changeKanbanFilter = (filter: {
        label: string;
        status: string;
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
            }}
        >
            {children}
        </RequisitionContext.Provider>
    );
};
