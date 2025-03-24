import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
} from "@mui/material";
import {
    createAdicional,
    createOpportunity,
    createOpportunityFiles,
    getOpportunityById,
    updateOpportunity,
} from "../../../utils";
import {
    Guide,
    Opportunity,
    OpportunityOptionField,
} from "../../../types";
import Slider from "react-slick";
import { userContext } from "../../../../Requisitions/context/userContext";


const useOpportunityModal = (initialOpportunity: Opportunity, context: any) => {
    const {
        creatingOpportunity,
        currentOppIdSelected,
        setCurrentOppIdSelected,
        setCreatingOpportunity, 
        toggleRefreshOpportunityInfo
    } = context;

    const [adicional, setAdicional] = useState(false);
    const [opportunity, setCurrentOpportunity] = useState<Opportunity>(initialOpportunity);
    const sliderRef = useRef<Slider | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isAdicionalChoiceOpen, setIsAdicionalChoiceOpen] = useState(true);
    const [refreshOpportunityFields, setRefreshOpportunityFields] = useState(false);
    const [projectChoiceModalOpen, setProjectChoiceModalOpen] = useState(false);
    const [renderFields, setRenderFields] = useState(false);
    const [saveProgressModalOpen, setSaveProgressModalOpen] = useState(false);
    const formDataFilesRef = useRef<FormData>(new FormData());
    const guidesReference = useRef<Guide[]>();
    const [changeWasMade, setChangeWasMade] = useState<boolean>(false);
    const saveButtonContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {user} = useContext(userContext);
    const settings = {
        swipe: true,
        arrows: false,
        accessibility: false,
        dots: false,
        infinite: false,
        speed: 200,
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: true,
        beforeChange: (_oldIndex: number, _newIndex: number) => { },
        afterChange: (current: number) => {
            setCurrentSlideIndex(current);
        },
    };

    const handleClose = () => {
        console.log('handleClose')
        setCreatingOpportunity(false);
        setCurrentOppIdSelected(0);
        setCurrentSlideIndex(0);
        setSaveProgressModalOpen(false);
        setChangeWasMade(false);
    };

    const handleCloseAdicionalChoice = () => {
        setAdicional(false);
        setIsAdicionalChoiceOpen(false);
    };

    const setGuidesReference = () => {
        guidesReference.current = [
            {
                name: "Cadastro",
                fields: [
                    { label: "Nº Projeto", dataKey: "idProjeto", autoComplete: true, type: "number", data: opportunity["idProjeto"] },
                    { label: "Nº Adicional", dataKey: "numeroAdicional", type: "number", data: opportunity["numeroAdicional"] },
                    { label: "Descrição da Proposta", dataKey: "nome", type: "text", data: opportunity["nome"] },
                    { label: "Status", dataKey: "codStatus", autoComplete: true, type: "number", data: opportunity["codStatus"] },
                    { label: 'Descrição da Venda', dataKey: 'descricaoVenda', autoComplete: false, type: 'text', data: opportunity['descricaoVenda']},
                    { label: "Cliente", dataKey: "fkCodCliente", autoComplete: true, type: "number", data: opportunity["fkCodCliente"] },
                    { label: "Data de Solicitação", dataKey: "dataSolicitacao", type: "date", data: opportunity["dataSolicitacao"] },
                    { label: "Data de Início", dataKey: "dataInicio", type: "date", data: opportunity["dataInicio"] },
                    { label: "Data de Fechamento", dataKey: "dataEntrega", type: "date", data: opportunity["dataEntrega"] },
                    { label: "Nº OS", dataKey: "codOs", autoComplete: false, type: "number", data: opportunity["codOs"] },
                ],
            },
            {
                name: "Interação",
                fields: [
                    { label: "Data de Interação", dataKey: "dataInteracao", type: "date", data: opportunity["dataInteracao"] },
                    { label: "Comentários", dataKey: "comentarios", type: "text", data: opportunity["comentarios"] },
                ],
            },
            {
                name: "Escopo",
                fields: [
                    { label: "Observações", dataKey: "observacoes", type: "text", data: opportunity["observacoes"] },
                    { label: "Anexos", dataKey: "files", type: "number", data: opportunity["files"] },
                ],
            },
            {
                name: "Venda",
                fields: [
                    { label: "Vendedor", dataKey: "responsavel", autoComplete: true, type: "text", data: opportunity["responsavel"] },
                    { label: "Valor Faturamento Dolphin", dataKey: "valorFatDolphin", type: "number", data: opportunity["valorFatDolphin"] },
                    { label: "Valor Faturamento Direto", dataKey: "valorFatDireto", type: "number", data: opportunity["valorFatDireto"] },
                    { label: "Valor Comissão", dataKey: "valorComissao", type: "number", data: opportunity["valorComissao"] },
                    { label: "Valor Total", dataKey: "valorTotal", type: "number", data: opportunity["valorTotal"] },
                ],
            },
            {
                name: "Seguidores",
                fields: [
                    { label: "Seguidores", dataKey: "seguidores", type: "Follower[]", data: opportunity["seguidores"] },
                ],
            },
        ];
    };

    const fetchOppData = useCallback(async () => {
        const data = await getOpportunityById(currentOppIdSelected);
        const formattedOpp = {
            ...data,
            dataSolicitacao: data.dataSolicitacao ? new Date(data.dataSolicitacao).toISOString().split("T")[0] : null,
            dataNecessidade: data.dataNecessidade ? new Date(data.dataNecessidade).toISOString().split("T")[0] : null,
            dataInicio: data.dataInicio ? new Date(data.dataInicio).toISOString().split("T")[0] : null,
            dataPrevEntrega: data.dataPrevEntrega ? new Date(data.dataPrevEntrega).toISOString().split("T")[0] : null,
            dataEntrega: data.dataEntrega ? new Date(data.dataEntrega).toISOString().split("T")[0] : null,
            dataLiberacao: data.dataLiberacao ? new Date(data.dataLiberacao).toISOString().split("T")[0] : null,
            dataInteracao: data.dataInteracao ? new Date(data.dataInteracao).toISOString().split("T")[0] : null,
        };
        console.log({formattedOpp})
        setCurrentOpportunity(formattedOpp);
        setIsLoading(false);
    }, [currentOppIdSelected, setCurrentOpportunity]);

    const handleAdicionalChoice = (isAdicional: boolean) => {
        if (isAdicional) {
            setAdicional(true);
            setProjectChoiceModalOpen(true);
            return;
        }
        setAdicional(false);
        setIsAdicionalChoiceOpen(false);
    };

    const handleChangeGuide = (index: number) => {
        sliderRef.current?.slickGoTo(index);
        setCurrentSlideIndex(index);
    };

    const handleSaveProjectChoiceAdicional = async () => {
        const data = await createAdicional(opportunity);
        if (data) {
            setCurrentOpportunity({
                ...opportunity,
                idAdicional: data.adicional.ID,
                numeroAdicional: data.adicional.NUMERO,
                codOs: data.codOs,
            });
            setCurrentOppIdSelected(data.codOs);
            setProjectChoiceModalOpen(false);
            setRefreshOpportunityFields(!refreshOpportunityFields);
            setAdicional(true);
            setCreatingOpportunity(false);
        }
    };

    const getUpdatedOpportunity = () => {
        let updatedOpportunity = { ...opportunity };
        guidesReference.current?.forEach((guide) => {
            guide.fields.forEach((field) => {
                console.log({dataKey: field.dataKey, data: field.data})
                updatedOpportunity = {
                    ...updatedOpportunity,
                    [field.dataKey]: field.data,
                };
            });
        });
        return updatedOpportunity;
    };

    const handlesaveProgressAction = async () => {
        await handleSaveOpportunity();
        handleClose();
    };

    const handleChangeAutoComplete = (
        _event: React.SyntheticEvent<Element, Event>,
        value: OpportunityOptionField | null,
        _reason: AutocompleteChangeReason,
        _details?: AutocompleteChangeDetails<{ label: string; id: number; object: string }> | undefined
    ) => {
        if (value?.object === "project") {
            setCurrentOpportunity({ ...opportunity, idProjeto: value?.id });
            return;
        }
        if (value?.object === "status") {
            setCurrentOpportunity({ ...opportunity, codStatus: value?.id });
            return;
        }
        if (value?.object === "saler") {
            setCurrentOpportunity({ ...opportunity, responsavel: value?.id });
            return;
        }
        if (value?.object === "client") {
            setCurrentOpportunity({ ...opportunity, fkCodCliente: value?.id });
            return;
        }
    };

    const handleFileUpload = async (codOs: number) => {
        if (formDataFilesRef.current) {
           await createOpportunityFiles(codOs, formDataFilesRef.current);
        }
    };

    const resetFormData = () => {
        formDataFilesRef.current = new FormData();
    };

    const createNewOpportunity = async () => {
        setIsLoading(true);
        const updatedOpportunity = getUpdatedOpportunity();
        if (!updatedOpportunity) return;
        try {
            const createOppResponse = await createOpportunity(updatedOpportunity);
            if (createOppResponse?.status === 200) {
                setCurrentOpportunity(updatedOpportunity);
                await handleFileUpload(createOppResponse.data.codOs);
                setCurrentOppIdSelected(createOppResponse.data.codOs);
                setCreatingOpportunity(false);
            }
        } catch (e) {
            console.log(e);
        } finally {
            resetFormData();
            setRefreshOpportunityFields(!refreshOpportunityFields);
            setIsLoading(false);
            toggleRefreshOpportunityInfo();            
        }
    };

    const updateExistingOpportunity = async () => {
        setIsLoading(true);
        const updatedOpportunity = getUpdatedOpportunity();
        if (!updatedOpportunity) return;
        try {
            const response = await updateOpportunity(updatedOpportunity, user);
            if (response?.status === 200) {
                setCurrentOpportunity(updatedOpportunity);
                await handleFileUpload(opportunity.codOs || 0);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
            resetFormData();
            setRefreshOpportunityFields(!refreshOpportunityFields);  
            setChangeWasMade(false);
            toggleRefreshOpportunityInfo();
        }
    };

    const handleSaveOpportunity = useCallback(async () => {
        if (opportunity.codOs) {
            await updateExistingOpportunity();
            return;
        }
        if (creatingOpportunity) {
            await createNewOpportunity();
            return;
        }
    }, [opportunity, refreshOpportunityFields, setCreatingOpportunity, setCurrentOppIdSelected, creatingOpportunity, currentSlideIndex]);



    useEffect(() => {
        console.log('useEffect setGuidesReference')
        setGuidesReference();
        setRenderFields(!renderFields);
    }, [opportunity, refreshOpportunityFields]);

    useEffect(() => {
        console.log('useEffect fetch data')
        if (creatingOpportunity) {
            setIsAdicionalChoiceOpen(true);
            setIsLoading(false)
            return;
        }
        if (currentOppIdSelected > 0) {
            setIsAdicionalChoiceOpen(false);
            fetchOppData();
            return;
        }
     
        setCurrentOpportunity(initialOpportunity);
    }, [currentOppIdSelected, refreshOpportunityFields, creatingOpportunity, fetchOppData]);

    useEffect(() => { 
        sliderRef.current?.slickGoTo(currentSlideIndex);
    }, [sliderRef]);

    return {
        adicional,
        opportunity,
        currentSlideIndex,
        creatingOpportunity,
        currentOppIdSelected,
        isAdicionalChoiceOpen,
        projectChoiceModalOpen,
        saveProgressModalOpen,
        sliderRef,
        saveButtonContainerRef,
        handleClose,
        handleCloseAdicionalChoice,
        handleAdicionalChoice,
        handleChangeGuide,
        handleSaveProjectChoiceAdicional,
        handlesaveProgressAction,
        handleChangeAutoComplete,
        handleFileUpload,
        handleSaveOpportunity,
        setProjectChoiceModalOpen,
        setSaveProgressModalOpen,
        guidesReference,
        formDataFilesRef,
        setCurrentSlideIndex,
        settings,
        isLoading,
        setIsLoading,
        changeWasMade,
        setChangeWasMade
    };
};

export default useOpportunityModal;