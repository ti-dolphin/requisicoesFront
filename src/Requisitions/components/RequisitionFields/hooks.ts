import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { Requisition, OptionsState, AlertInterface } from "../../types";
import { fetchRequsitionById, updateRequisition } from "../../utils";
import { Option } from "../../types";
import { dateTimeRenderer } from "../../../Patrimony/utils";
import { RequisitionContext } from "../../context/RequisitionContext";

export const useRequisitionFields = () => {
    const { id } = useParams();
    const { user } = useContext(userContext);
    const {refreshRequisition} = useContext(RequisitionContext)
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [requisitionData, setRequisitionData] = useState<Requisition>();
    const [optionsState, setOptionsState] = useState<OptionsState>();
    const [alert, setAlert] = useState<AlertInterface>();

    const fetchRequisitionData = async () => {
        const data = await fetchRequsitionById(Number(id));
        if (data) {
            setRequisitionData({ ...data });
            setOptionsState({
                projectOption: data.projectOption,
                responsableOption: data.responsableOption,
                typeOption: data.typeOption,
                projectOptions: data.projectOptions,
                responsableOptions: data.responsableOptions,
                typeOptions: data.typeOptions,
            });
        }
    };

    const userAllowedToEdit = () => {
        if (requisitionData?.status?.nome === 'Em edição') {
            return user?.PERM_COMPRADOR || user?.CODPESSOA === requisitionData?.ID_RESPONSAVEL;
        }
  
    };

    const displayAlert = async (severity: string, message: string) => {
        setTimeout(() => {
            setAlert(undefined);
        }, 3000);
        setAlert({severity, message});
        return
    };

    const handleChangeAutoComplete = (e: any, value: any, field: any) => {
        console.log(e)
        if (requisitionData) {
            if (field.key === 'projectOption') {
                setOptionsState({
                    ...optionsState,
                    projectOption: value,
                });
                setRequisitionData({
                    ...requisitionData,
                    ID_PROJETO: value.id,
                });
                return;
            }
            if (field.key === 'typeOption') {
                setOptionsState({
                    ...optionsState,
                    typeOption: value,
                });
                setRequisitionData({
                    ...requisitionData,
                    TIPO: value.id,
                });
                return;
            }
            if (field.key === 'responsableOption') {
                setOptionsState({
                    ...optionsState,
                    responsableOption: value,
                });
                setRequisitionData({
                    ...requisitionData,
                    ID_RESPONSAVEL: value.id,
                });
                return;
            }
        }
    };

    const handleChangeTextField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: any) => {
        const { value } = e.target;
        if (requisitionData) {
            setRequisitionData({
                ...requisitionData,
                [field.key]: value,
            });
        }
    };

    const renderAutoCompleteValue = (field: any) => {
        const value: Option | undefined = optionsState && (optionsState[field.key as keyof OptionsState] as Option);
        return value;
    };

    const renderOptions = (field: any) => {
        if (optionsState) {
            const options = optionsState[field.optionName as keyof OptionsState] as Option[];
            return options;
        }
        return [{ label: 'Sem opções', id: 0 }];
    };

    const handleSave = async () => {
        if (requisitionData && user) {
            setIsEditing(false);
            try {
                const response = await updateRequisition(user?.CODPESSOA, requisitionData);
                if (response.status === 200) {
                    displayAlert('success', 'Requisição atualizada com sucesso!');
                }
            } catch (e: any) {
                displayAlert('warning', e.message);
            }
        }
    };

    const handleFocus = async (e: React.FocusEvent<HTMLInputElement | HTMLDivElement | HTMLTextAreaElement>) => {
        const { target } = e;
        if (userAllowedToEdit()) {
            setIsEditing(true);
            return;
        }
        await displayAlert('warning', 'Não é permitido editar o cabeçalho da requisição');
        target.blur();
    };

    const renderValue = (field: any) => {
      if(requisitionData) { 
           if (field.type === "date" && requisitionData) {
             return dateTimeRenderer(
               requisitionData[field.key as keyof Requisition] as string
             );
           }
           if (field.autoComplete) {
             return "autocomplete";
           }
           const value = requisitionData[field.key as keyof Requisition];

           return value === "null" ? '' : value;
      }
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
        fetchRequisitionData();
    };

    useEffect(() => {
        fetchRequisitionData();
    }, [refreshRequisition]);

    return {
        isEditing,
        requisitionData,
        optionsState,
        alert,
        handleChangeAutoComplete,
        handleChangeTextField,
        renderAutoCompleteValue,
        renderOptions,
        handleSave,
        handleFocus,
        handleCancelEditing,
        renderValue
    };
};