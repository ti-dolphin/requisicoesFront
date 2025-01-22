/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import Box from "@mui/material/Box";
import {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { fetchAllProjects, Project } from "../../Requisitions/utils";
import {
  createAdicional,
  createOpportunity,
  createOpportunityFiles,
  fetchAllClients,
  fetchSalers,
  fetchStatusList,
  getOpportunityById,
  updateOpportunity,
} from "../utils";
import {
  Client,
  Comentario,
  Guide,
  Opportunity,
  OpportunityColumn,
  OpportunityFile,
  OpportunityOptionField,
  Status,
} from "../types";
import CloseIcon from "@mui/icons-material/Close";
import Slider from "react-slick";
import RenderOpportunityFields from "../components/RenderOpportunityFields";
import { userContext } from "../../Requisitions/context/userContext";
import OpportunityFiles from "../components/OpportunityFiles";
import AdicionalChoice from "./AdicionalChoice";
import ProjectChoiceModal from "./ProjectChoiceModal";
import FollowersTable from "../components/FollowersTable";
import OpportunityGuide from "../components/OpportunityGuide";
import GuideSelector from "../components/GuideSelector";

const CreateOpportunityModal = () => {
  const guides: Guide[] = [
    {
      name: "Cadastro",
      fields: [
        {
          label: "Nº Projeto",
          dataKey: "idProjeto", // Alinhado com a propriedade idProjeto da interface
          autoComplete: true,
          type: "number", // Tipo numérico
        },
        {
          label: "Nº Adicional",
          dataKey: "numeroAdicional",
          type: "number", // Tipo numérico
        },
        {
          label: "Descrição da Proposta",
          dataKey: "nome", // Alinhado com a propriedade descricao da interface
          type: "text", // Tipo texto
        },
        {
          label: "Status",
          dataKey: "codStatus", // Alinhado com a propriedade codStatus da interface
          autoComplete: true,
          type: "number", // Tipo numérico
        },
        {
          label: "Cliente",
          dataKey: "fkCodCliente", // Alinhado com a propriedade fkCodCliente da interface
          autoComplete: true,
          type: "text", // Tipo texto
        },
        {
          label: "Data de Solicitação",
          dataKey: "dataSolicitacao", // Alinhado com a propriedade dataSolicitacao da interface
          type: "Date", // Tipo data e hora
        },
        {
          label: "Data de Fechamento",
          dataKey: "dataEntrega", // Alinhado com a propriedade dataEntrega da interface
          type: "date", // Tipo data e hora
        },
        {
          label: "Data de Início",
          dataKey: "dataInicio",
          type: "date",
        },
      ],
    },
    {
      name: "Interação",
      fields: [
        {
          label: "Data de Interação",
          dataKey: "dataInteracao", // Alinhado com a propriedade dataInteracao da interface
          type: "date", // Tipo data e hora
        },
        {
          label: "Comentários",
          dataKey: "comentarios",
          type: "text",
        },
      ],
    },
    {
      name: "Escopo",
      fields: [
        {
          label: "Observações",
          dataKey: "observacoes", // Alinhado com a propriedade observacoes da interface
          type: "text", // Tipo texto
        },
      ],
    },
    {
      name: "Venda",
      fields: [
        {
          label: "Vendedor",
          dataKey: "responsavel", // Alinhado com a propriedade responsavel da interface
          autoComplete: true,
          type: "text", // Tipo texto
        },
        {
          label: "Valor Faturamento Dolphin",
          dataKey: "valorFatDolphin", // Alinhado com a propriedade valorFatDolphin da interface
          type: "number", // Tipo numérico
        },
        {
          label: "Valor Faturamento Direto",
          dataKey: "valorFatDireto", // Alinhado com a propriedade valorFatDireto da interface
          type: "number", // Tipo numérico
        },
        {
          label: "Valor Comissão",
          dataKey: "valorComissao", // Alinhado com a propriedade valorComissao da interface
          type: "number", // Tipo numérico
        },
        {
          label: "Valor Total",
          dataKey: "valorTotal", // Alinhado com a propriedade valorTotal da interface
          type: "number", // Tipo numérico
        },
      ],
    },
    {
      name: "Seguidores",
    },
  ];

  const settings = {
    swipe: true,
    arrows: false,
    accessibility: false,
    dots: false,
    infinite: false,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
    draggable: false,
    beforeChange: (oldIndex: number, newIndex: number) => {
      console.log(oldIndex, newIndex);
    },
    afterChange: (current: number) => {
      setCurrentSlideIndex(current);
      setCurrentCommentValue("");
      setEditingComment(undefined);
    },
  };

  const {
    creatingOpportunity,
    currentOppIdSelected,
    setCurrentOppIdSelected,
    setCreatingOpportunity,
    toggleRefreshOpportunityInfo,
  } = useContext(OpportunityInfoContext);
  const { user } = useContext(userContext);
  const [adicional, setAdicional] = useState(false);
  const [opportunity, setCurrentOpportunity] = useState<Opportunity>({
    codOs: 0, // Exemplo de código de OS (AUTO_INCREMENT, não precisa definir)
    codTipoOs: 1, // Valor padrão para o tipo de OS (campo com valor padrão '1')
    codCCusto: null, // Opcional
    obra: null, // Opcional
    dataSolicitacao: null, // Data atual (pode ser null se não obrigatório)
    dataNecessidade: null, // Data atual (pode ser null se não obrigatório)
    docReferencia: null, // Opcional
    listaMateriais: null, // Opcional
    dataInicio: null, // Opcional
    dataPrevEntrega: null, // Opcional
    dataEntrega: null, // Opcional
    codStatus: 1, // Valor padrão para o status (campo com valor padrão '1')
    nome: "", // Nome obrigatório
    descricao: null, // Opcional
    atividades: null, // Opcional
    prioridade: 0, // Valor padrão (campo com valor padrão '0')
    solicitante: 1, // Valor padrão para o solicitante (campo com valor padrão '1')
    responsavel: 1, // Valor padrão para o responsável (campo com valor padrão '1')
    codDisciplina: 1, // Valor padrão para o código de disciplina (campo com valor padrão '1')
    gut: 1, // Valor padrão para o GUT (campo com valor padrão '1')
    gravidade: 1, // Valor padrão para a gravidade (campo com valor padrão '1')
    urgencia: 1, // Valor padrão para urgência (campo com valor padrão '1')
    tendencia: 1, // Valor padrão para tendência (campo com valor padrão '1')
    dataLiberacao: null, // Opcional
    relacionamento: 1, // Valor padrão para relacionamento (campo com valor padrão '1')
    fkCodCliente: "-", // Valor padrão (campo com valor padrão '-')
    fkCodColigada: 0, // Valor padrão para código de coligada (campo com valor padrão '0')
    valorFatDireto: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorServicoMO: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorServicoMatAplicado: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorMaterial: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorTotal: 0.0, // Valor padrão (campo com valor padrão '0.00')
    codSegmento: 1, // Valor padrão para código de segmento (campo com valor padrão '1')
    codCidade: 0, // Valor padrão para código de cidade (campo com valor padrão '0')
    valorLocacao: 0.0, // Valor padrão (campo com valor padrão '0.00')
    idAdicional: 0, // Valor padrão (campo com valor padrão '0')
    idProjeto: 0, // Valor padrão (campo com valor padrão '0')
    dataInteracao: null, // Valor padrão (campo com valor padrão '1111-11-11')
    valorFatDolphin: 0.0, // Valor padrão para faturamento Dolphin (campo com valor padrão '0.00')
    principal: true, // Valor padrão (campo com valor padrão '1')
    valorComissao: 0.0, // Valor obrigatório
    idMotivoPerdido: 1, // Valor obrigatório (campo não pode ser nulo)
    observacoes: null, // Opcional
    descricaoVenda: null, // Opcional
    emailVendaEnviado: false, // Valor padrão (campo com valor padrão '0')
    numeroAdicional: 0, // Valor padrão com
    comentarios: [],
    seguidores: [],
  });
  const sliderRef = useRef<Slider | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAdicionalChoiceOpen, setIsAdicionalChoiceOpen] = useState(true);
  const [editingComment, setEditingComment] = useState<Comentario>();
  const [projectOptions, setProjectOptions] = useState<
    OpportunityOptionField[]
  >([]);
  const [refreshOpportunityFields, setRefreshOpportunityFields] =
    useState(false);
  //setRefreshUploads
  const [projectChoiceModalOpen, setProjectChoiceModalOpen] = useState(false);
  const [formDataFileArray, setFormDataFileArray] = useState<FormData>(
    new FormData()
  );

  const [salerOptions, setSalerOptions] = useState<OpportunityOptionField[]>(
    []
  );

  const [statusOptions, setStatusOptions] = useState<OpportunityOptionField[]>(
    []
  );

  const [clientOptions, setClientOptions] = useState<OpportunityOptionField[]>(
    []
  );

  const [currentCommentValue, setCurrentCommentValue] = React.useState("");
  const [saveProgressModalOpen, setSaveProgressModalOpen] = useState(false);

  const handleClose = () => {
    setCreatingOpportunity(false);
    setCurrentOppIdSelected(0);
    setCurrentSlideIndex(0);
    toggleRefreshOpportunityInfo();
    cleanEntries();
    setSaveProgressModalOpen(false);
  };

  const fetchClientOps = useCallback(async () => {
    const clients = await fetchAllClients();
    const options = clients.map((client: Client) => ({
      label: client.NOMEFANTASIA,
      id: client.CODCLIENTE,
      object: "client",
      key: client.CODCLIENTE,
    }));
    setClientOptions([...options]);
  }, [setClientOptions]);

  const fetchProjectsOps = useCallback(async () => {
    const projects = await fetchAllProjects();
    const options =
      (projects &&
        projects.map((project: Project) => ({
          label: project.DESCRICAO,
          id: project.ID,
          object: "project",
          key: project.ID,
        }))) ||
      [];
    setProjectOptions([...options]);
  }, [setProjectOptions]);

  const fetchStatusOps = useCallback(async () => {
    const statusList = await fetchStatusList();
    const options =
      statusList.map((status: Status) => ({
        label: status.NOME,
        id: status.CODSTATUS,
        object: "status",
        key: status.CODSTATUS,
      })) || [];
    setStatusOptions(options);
  }, [setStatusOptions]);

  const fetchSalerOps = useCallback(async () => {
    const salers = await fetchSalers();
    const options = salers.map(
      (saler: { NOME: string; CODPESSOA: number }) => ({
        label: saler.NOME,
        id: saler.CODPESSOA,
        object: "saler",
        key: saler.CODPESSOA,
      })
    );
    setSalerOptions(options);
  }, [setSalerOptions]);

  const fetchOppData = useCallback(async () => {
    const data = await getOpportunityById(currentOppIdSelected);
    const formattedOpp = {
      ...data,
      dataSolicitacao: data.dataSolicitacao
        ? new Date(data.dataSolicitacao).toISOString().split("T")[0]
        : null,
      dataNecessidade: data.dataNecessidade
        ? new Date(data.dataNecessidade).toISOString().split("T")[0]
        : null,
      dataInicio: data.dataInicio
        ? new Date(data.dataInicio).toISOString().split("T")[0]
        : null,
      dataPrevEntrega: data.dataPrevEntrega
        ? new Date(data.dataPrevEntrega).toISOString().split("T")[0]
        : null,
      dataEntrega: data.dataEntrega
        ? new Date(data.dataEntrega).toISOString().split("T")[0]
        : null,
      dataLiberacao: data.dataLiberacao
        ? new Date(data.dataLiberacao).toISOString().split("T")[0]
        : null,
      dataInteracao: data.dataInteracao
        ? new Date(data.dataInteracao).toISOString().split("T")[0]
        : null,
    };
    console.log({ formattedOpp });
    setCurrentOpportunity(formattedOpp);
  }, [currentOppIdSelected, setCurrentOpportunity]);

  const handleChangeAutoComplete = (
    _event: React.SyntheticEvent<Element, Event>,
    value: OpportunityOptionField | null,
    _reason: AutocompleteChangeReason,
    _details?:
      | AutocompleteChangeDetails<{ label: string; id: number; object: string }>
      | undefined
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

  const isNumeric = (value: string) => {
    return !isNaN(Number(value));
  };

  const handleChangeTextField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: OpportunityColumn
  ) => {
    const { value } = e.target;
    if (column.dataKey === "valorFatDireto") {
      console.log("valorFatDireto");
      const totalValue = Number(opportunity.valorFatDolphin) + Number(value);
      console.log({ totalValue });
      setCurrentOpportunity({
        ...opportunity,
        valorFatDireto: Number(value),
        valorTotal: totalValue,
      });
      return;
    }
    if (column.dataKey === "valorFatDolphin") {
      console.log("valorFatDolphin");
      const totalValue = Number(opportunity.valorFatDireto) + Number(value);
      console.log({ totalValue });
      setCurrentOpportunity({
        ...opportunity,
        valorFatDolphin: Number(value),
        valorTotal: totalValue,
      });
      return;
    }
    setCurrentOpportunity({
      ...opportunity,
      [column.dataKey]: isNumeric(value) ? Number(value) : value,
    });
  };

  const isDateField = (dataKey: string): boolean => dataKey.startsWith("data");

  const handleAdicionalChoice = (isAdicional: boolean) => {
    if (isAdicional) {
      setAdicional(true);
      setProjectChoiceModalOpen(true);
      return;
    }
    setAdicional(false);
    setIsAdicionalChoiceOpen(false);
  };

  const renderOptions = (column: {
    label: string;
    dataKey: string;
    autoComplete?: boolean;
  }) => {
    if (column.dataKey === "idProjeto") return projectOptions;
    if (column.dataKey === "responsavel") return salerOptions;
    if (column.dataKey === "codStatus") return statusOptions;
    if (column.dataKey === "fkCodCliente") return clientOptions;
  };

  const cleanEntries = () => {
    setAdicional(false);
    setCurrentCommentValue("");
    setEditingComment(undefined);
    setCurrentOpportunity({
      codOs: 0, // Exemplo de código de OS (AUTO_INCREMENT, não precisa definir)
      codTipoOs: 1, // Valor padrão para o tipo de OS (campo com valor padrão '1')
      codCCusto: null, // Opcional
      obra: null, // Opcional
      dataSolicitacao: null, // Data atual (pode ser null se não obrigatório)
      dataNecessidade: null, // Data atual (pode ser null se não obrigatório)
      docReferencia: null, // Opcional
      listaMateriais: null, // Opcional
      dataInicio: null, // Opcional
      dataPrevEntrega: null, // Opcional
      dataEntrega: null, // Opcional
      codStatus: 1, // Valor padrão para o status (campo com valor padrão '1')
      nome: "", // Nome obrigatório
      descricao: null, // Opcional
      atividades: null, // Opcional
      prioridade: 0, // Valor padrão (campo com valor padrão '0')
      solicitante: 1, // Valor padrão para o solicitante (campo com valor padrão '1')
      responsavel: 1, // Valor padrão para o responsável (campo com valor padrão '1')
      codDisciplina: 1, // Valor padrão para o código de disciplina (campo com valor padrão '1')
      gut: 1, // Valor padrão para o GUT (campo com valor padrão '1')
      gravidade: 1, // Valor padrão para a gravidade (campo com valor padrão '1')
      urgencia: 1, // Valor padrão para urgência (campo com valor padrão '1')
      tendencia: 1, // Valor padrão para tendência (campo com valor padrão '1')
      dataLiberacao: null, // Opcional
      relacionamento: 1, // Valor padrão para relacionamento (campo com valor padrão '1')
      fkCodCliente: "-", // Valor padrão (campo com valor padrão '-')
      fkCodColigada: 0, // Valor padrão para código de coligada (campo com valor padrão '0')
      valorFatDireto: 0.0, // Valor padrão (campo com valor padrão '0.00')
      valorServicoMO: 0.0, // Valor padrão (campo com valor padrão '0.00')
      valorServicoMatAplicado: 0.0, // Valor padrão (campo com valor padrão '0.00')
      valorMaterial: 0.0, // Valor padrão (campo com valor padrão '0.00')
      valorTotal: 0.0, // Valor padrão (campo com valor padrão '0.00')
      codSegmento: 1, // Valor padrão para código de segmento (campo com valor padrão '1')
      codCidade: 0, // Valor padrão para código de cidade (campo com valor padrão '0')
      valorLocacao: 0.0, // Valor padrão (campo com valor padrão '0.00')
      idAdicional: 0, // Valor padrão (campo com valor padrão '0')
      idProjeto: 0, // Valor padrão (campo com valor padrão '0')
      dataInteracao: null, // Valor padrão (campo com valor padrão '1111-11-11')
      valorFatDolphin: 0.0, // Valor padrão para faturamento Dolphin (campo com valor padrão '0.00')
      principal: true, // Valor padrão (campo com valor padrão '1')
      valorComissao: 0.0, // Valor obrigatório
      idMotivoPerdido: 1, // Valor obrigatório (campo não pode ser nulo)
      observacoes: null, // Opcional
      descricaoVenda: null, // Opcional
      emailVendaEnviado: false, // Valor padrão (campo com valor padrão '0')
      numeroAdicional: 0, // Valor padrão com
      comentarios: [],
      seguidores: [],
    });
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
      setCreatingOpportunity(false);
      setCurrentOppIdSelected(data.codOs);
      setProjectChoiceModalOpen(false);
      setRefreshOpportunityFields(!refreshOpportunityFields);
      setAdicional(true);
    }
  };

  const renderAutoCompleteValue = (
    field: OpportunityColumn
  ): OpportunityOptionField => {
    if (field.dataKey === "idProjeto") {
      const optionValueSelected = projectOptions.find(
        (option) => option.id === opportunity["idProjeto"]
      );
      if (optionValueSelected) return optionValueSelected;
    }
    if (field.dataKey === "codStatus") {
      const optionValueSelected = statusOptions.find(
        (option) => option.id === opportunity["codStatus"]
      );
      if (optionValueSelected) return optionValueSelected;
    }
    if (field.dataKey === "fkCodCliente") {
      const optionValueSelected = clientOptions.find(
        (option) => option.id === opportunity["fkCodCliente"]
      );
      if (optionValueSelected) return optionValueSelected;
    }
    if (field.dataKey === "responsavel") {
      const optionValueSelected = salerOptions.find(
        (option) => option.id === opportunity["responsavel"]
      );
      if (optionValueSelected) return optionValueSelected;
    }
    return {
      label: "",
      id: 0,
      object: "",
      key: 0,
    };
  };

  const handleChangeComentarios = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    codigoComentario?: number
  ) => {
    const { value } = e.target;
    setCurrentCommentValue(value);

    const newCommentIsBeingTyped =
      !codigoComentario || !opportunity.comentarios;
    let newComment;
    if (newCommentIsBeingTyped) {
      newComment = opportunity.comentarios.find(
        (comment) => comment.codigoComentario === 0
      );
      if (newComment) {
        newComment.descricao = value;
        setCurrentOpportunity({
          ...opportunity,
          comentarios: [...opportunity.comentarios],
        });
        return;
      }
      newComment = {
        email: 0,
        codOs: opportunity.codOs,
        criadoEm: new Date(),
        criadoPor: user?.NOME || "",
        descricao: value,
        codigoComentario: 0,
      };
      setCurrentOpportunity({
        ...opportunity,
        comentarios: [...opportunity.comentarios, newComment],
      });
      return;
    }
    //editting a comment
    const coments = [...(opportunity.comentarios || [])];
    const index = coments.findIndex(
      (c) => c.codigoComentario === codigoComentario
    );
    if (index >= 0) {
      coments[index].descricao = value;
      setCurrentOpportunity({
        ...opportunity,
        comentarios: coments,
      });
    }
  };

  const uploadFiles = useCallback(
    async (opportunityId: number) => {
      const isEmpty = ![...formDataFileArray.getAll("files")].length;
      if (opportunityId && !isEmpty) {
        await createOpportunityFiles(opportunityId, formDataFileArray);
        setFormDataFileArray(new FormData());
      }
    },
    [formDataFileArray]
  );

  const handleSaveOpportunity = useCallback(async () => {
    if (opportunity.codOs) {
      const response = await updateOpportunity(opportunity);
      if (response?.status === 200) {
        cleanEntries();
        await uploadFiles(opportunity.codOs);
        setRefreshOpportunityFields(!refreshOpportunityFields);
      }
      return;
    }
    const response = await createOpportunity({
      ...opportunity, //adding the user to followers
      seguidores: [
        ...opportunity.seguidores,
        {
          id_seguidor_projeto: 0,
          id_projeto: opportunity.idProjeto || 0,
          codpessoa: user?.CODPESSOA || 0,
          ativo: 1,
          nome: "",
        },
      ],
    });
    if (response?.status === 200) {
      setCreatingOpportunity(false);
      setCurrentOppIdSelected(response.data.codOs); //
      cleanEntries();
      await uploadFiles(response.data.codOs);
      setRefreshOpportunityFields(!refreshOpportunityFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    opportunity,
    refreshOpportunityFields,
    setCreatingOpportunity,
    setCurrentOppIdSelected,
    uploadFiles,
  ]);

  const handleDeleteFile = (file: OpportunityFile) => {
    const newOppFiles =
      [...(opportunity.files || [])].filter(
        (oppFile) => oppFile.nome_arquivo !== file.nome_arquivo
      ) || [];
    setCurrentOpportunity({
      ...opportunity,
      files: newOppFiles,
    });
  };

  const handleChangeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      const newFile: OpportunityFile = {
        id_anexo_os: Date.now(), // Gera um ID único temporário
        arquivo: URL.createObjectURL(file), // Gera a URL temporária para o preview
        nome_arquivo: file.name,
        codos: opportunity.codOs || 0,
      };
      const newOppFiles = [...(opportunity.files || []), newFile];
      setCurrentOpportunity({
        ...opportunity,
        files: newOppFiles,
      });
      setFormDataFileArray((prevFormDataFileArray) => {
        const updatedFormData = new FormData();
        prevFormDataFileArray.forEach((value, key) => {
          updatedFormData.append(key, value);
        });
        updatedFormData.append("files", file);
        return updatedFormData;
      });
    }
  };

  const handlesaveProgressAction = async () => {
    await handleSaveOpportunity();
    handleClose();
  };

  useEffect(() => {
    console.log("useeffect CreatingOpportunityModal");
    fetchProjectsOps();
    fetchStatusOps();
    fetchSalerOps();
    fetchClientOps();
    if (creatingOpportunity) {
      setIsAdicionalChoiceOpen(true);
    }
    if (currentOppIdSelected > 0) {
      setIsAdicionalChoiceOpen(false); //
      fetchOppData();
    }
  }, [
    currentOppIdSelected,
    refreshOpportunityFields,
    creatingOpportunity,
    fetchProjectsOps,
    fetchStatusOps,
    fetchSalerOps,
    fetchClientOps,
    fetchOppData,
  ]);

  return (
    <Modal
      open={creatingOpportunity || currentOppIdSelected > 0}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            //responsive width
            xs: "100%",
            md: "70%",
            lg: "50%",
            xl: "40%",
          },
          maxHeight: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          overFlow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 1,
          gap: 4,
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
          }}
          onClick={() => setSaveProgressModalOpen(true)}
        >
          <CloseIcon />
        </IconButton>{" "}
        <Typography fontFamily="Roboto" fontSize="large">
          Proposta
        </Typography>
        <Typography>
          {currentOppIdSelected > 0 ? `${opportunity.nome}` : ""}
        </Typography>
        <Stack
          direction="column"
          width="100%"
          gap={1}
          padding={1}
          overflow="scroll"
        >
          <GuideSelector
            guides={guides} // Passa os guias
            currentSlideIndex={currentSlideIndex} // Índice do guia selecionado
            handleChangeGuide={handleChangeGuide} // Função para lidar com a troca de guia
          />
          <Slider ref={sliderRef} {...settings}>
            {guides.map((guide) => (
              <OpportunityGuide
                key={guide.name} // É importante usar um identificador único, como o nome ou ID do guia
                guide={guide} // Passa o objeto `guide` diretamente
                renderAutoCompleteValue={renderAutoCompleteValue} // Função para renderizar valores de autocomplete
                handleChangeAutoComplete={handleChangeAutoComplete} // Função para lidar com mudanças no autocomplete
                renderOptions={renderOptions} // Função para renderizar opções de autocomplete
                adicional={adicional} // Informação adicional (personalizável)
                currentOppIdSelected={currentOppIdSelected} // ID da oportunidade selecionada
                opportunity={opportunity} // Objeto da oportunidade atual
                handleChangeTextField={handleChangeTextField} // Função para lidar com campos de texto
                isDateField={isDateField} // Verificação se o campo é uma data
                currentCommentValue={currentCommentValue} // Valor do comentário atual
                handleChangeComentarios={handleChangeComentarios} // Função para mudanças nos comentários
                editingComment={editingComment} // Indica se um comentário está sendo editado
                setEditingComment={setEditingComment} // Define o estado de edição de comentários
                setCurrentOpportunity={setCurrentOpportunity} // Define a oportunidade atual
                handleSaveOpportunity={handleSaveOpportunity} // Salva a oportunidade
                handleChangeFiles={handleChangeFiles} // Função para manipulação de arquivos
                handleDeleteFile={handleDeleteFile} // Função para deletar arquivos
              />
            ))}
          </Slider>
        </Stack>
        <Button variant="outlined" onClick={handleSaveOpportunity}>
          <Typography fontFamily="Roboto" fontSize="small">
            Salvar
          </Typography>
        </Button>
        <AdicionalChoice
          isAdicionalChoiceOpen={isAdicionalChoiceOpen}
          handleClose={handleClose}
          handleAdicionalChoice={handleAdicionalChoice}
        />
        <ProjectChoiceModal
          handleSaveProjectChoiceAdicional={handleSaveProjectChoiceAdicional}
          projectChoiceModalOpen={projectChoiceModalOpen}
          setProjectChoiceModalOpen={setProjectChoiceModalOpen}
          handleChangeAutoComplete={handleChangeAutoComplete}
          renderOptions={renderOptions}
        />
        <Dialog
          open={saveProgressModalOpen}
          onClose={handleClose}
          aria-labelledby="save-progress-title"
          aria-describedby="save-progress-description"
        >
          <DialogTitle id="save-progress-title">Salvar progresso?</DialogTitle>
          <DialogContent>
            <DialogContentText id="save-progress-description">
              Deseja salvar seu progresso antes de sair?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              onClick={handlesaveProgressAction}
              color="primary"
              autoFocus
            >
              Sim
            </Button>
            <Button onClick={handleClose} color="secondary">
              Não
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default CreateOpportunityModal;
