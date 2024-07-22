import { createContext, useState } from 'react';

interface Field {
    key?: string;
    label?: string;
}
interface RequisitionContextType {
    editingField: { isEditing: boolean, field: Field };
    handleChangeEditingField: (item: Field) => void;
    seteditingField: (value: { isEditing: boolean, field: Field }) => void;
}
interface RequisitionContextProviderProps {
    children: React.ReactNode
}

//===========================================================================
export const RequisitionContext = createContext<RequisitionContextType>({
    editingField: { isEditing: false, field: { label: '', key: '' } },
    handleChangeEditingField: () => { },
    seteditingField: () => { }
});


export const RequisitionContextProvider = ({ children }: RequisitionContextProviderProps) => {

    const [editingField, seteditingField] = useState<{ isEditing: boolean, field: Field }>({ isEditing: false, field: { label: '', key: '' } });

    const handleChangeEditingField = (item: Field) => {
        console.log('editMode: ', { isEditing: true, field: item });
        seteditingField({ isEditing: true, field: item })
    }

    return (
        <RequisitionContext.Provider value={{ editingField, handleChangeEditingField, seteditingField }}>
            {children}
        </RequisitionContext.Provider>
    )
}