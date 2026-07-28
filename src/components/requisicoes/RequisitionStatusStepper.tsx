
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useRequisitionStatus } from "../../hooks/requisicoes/useRequisitionStatus";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled, Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import RequisitionStatusService from "../../services/requisicoes/RequisitionStatusService";
import { setRefreshRequisition, setRequisition } from "../../redux/slices/requisicoes/requisitionSlice";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { useRequisitionStatusPermissions } from "../../hooks/requisicoes/useRequisitionStatusPermissions";
import { RequisitionStatus } from "../../models/requisicoes/RequisitionStatus";
import RequisitionItemService from "../../services/requisicoes/RequisitionItemService";
import { gridColumnLookupSelector } from "@mui/x-data-grid";
import { setRefresh } from "../../redux/slices/requisicoes/requisitionItemSlice";
import QuoteService from "../../services/requisicoes/QuoteService";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ElegantInput from "../shared/ui/Input";
import RequisitionCommentService from "../../services/requisicoes/RequisitionCommentService";
import { addComment } from "../../redux/slices/requisicoes/requisitionCommentSlice";
import { startAttendingItems, stopAttendingItems } from "../../redux/slices/requisicoes/attenItemsSlice";
import RequisitionItemsTable from "./RequisitionItemsTable";
import { set } from "lodash";
import { RequisitionItemAttachmentService } from "../../services/requisicoes/RequisitionItemAttachmentService";
import { RequisitionFileService } from "../../services/requisicoes/RequisitionFileService";
import { normalizeText } from "../../utils";

interface RequisitionStatusStepperProps {
  id_requisicao: number;
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 1,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")<{
  ownerState: { active: boolean; completed: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
      ? theme.palette.success.main
      : ownerState.active
      ? "#F19700"
      : theme.palette.grey[400],
  zIndex: 1,
  color: "#fff",
  width: 24,
  height: 24,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 700,
  fontSize: 14,
  border: ownerState.active
    ? `2px solid #F19700`
    : "none",
}));

function CustomStepIcon(props: any) {
  const { active, completed, className, icon } = props;
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckIcon fontSize="small" /> : icon}
    </StepIconRoot>
  );
}

const RequisitionStatusStepper = ({
  id_requisicao,
}: RequisitionStatusStepperProps) => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requisition, refreshRequisition } = useSelector(
    (state: RootState) => state.requisition
  );
  const { attendingItems, notAttendedItems } = useSelector(
    (state: RootState) => state.attendingItemsSlice
  );
  const { items } = useSelector((state: RootState) => state.requisitionItem);
  const {
    permissionToChangeStatus,
    permissionToCancel,
    permissionToActivate,
    permissionToRevertStatus,
  } = useRequisitionStatusPermissions(user, requisition);
  const { statusList } = useRequisitionStatus(id_requisicao);
  const { refresh } = useSelector((state: RootState) => state.requisitionItem);
  const [fillingComment, setFillingComment] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [focusedElement, setFocusedElement] = useState<EventTarget | null>(
    null
  );
  const [justifyingLessThenThreeQuotes, setJustifyingLessThenThreeQuotes] =
    useState<boolean>(false);
  const [showValidationDialog, setShowValidationDialog] =
    useState<boolean>(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<
    "acao_anterior" | "acao_posterior" | null
  >(null);
  const [showMissingTargetPriceDialog, setShowMissingTargetPriceDialog] =
    useState<boolean>(false);
  const [
    pendingStatusChangeMissingTarget,
    setPendingStatusChangeMissingTarget,
  ] = useState<"acao_anterior" | "acao_posterior" | null>(null);
  const [skipTargetPriceValidation, setSkipTargetPriceValidation] =
    useState<boolean>(false);
  const [tiposFaturamento, setTiposFaturamento] = useState<
    Array<{ id: number; nome: string; nome_faturamento: string }>
  >([]);
  const [showChangeTypeDialog, setShowChangeTypeDialog] =
    useState<boolean>(false);
  const [selectedTipoFaturamento, setSelectedTipoFaturamento] = useState<
    number | null
  >(null);
  const [showValueIncreaseDialog, setShowValueIncreaseDialog] =
    useState<boolean>(false);
  const [
    pendingStatusChangeValueIncrease,
    setPendingStatusChangeValueIncrease,
  ] = useState<"acao_anterior" | "acao_posterior" | null>(null);
  const [showRevertSelectionDialog, setShowRevertSelectionDialog] =
    useState<boolean>(false);
  const [revertOption, setRevertOption] = useState<"previous" | "initial">("previous");

  const hasPatrimonyItems = useMemo(
    () =>
      items.some((item) => {
        const patrimonyType = Number(item?.produto?.tipo_produto_patrimonio ?? 0);
        return patrimonyType === 1 || patrimonyType === 2;
      }),
    [items]
  );

  const visibleStatusList = useMemo(() => {
    if (hasPatrimonyItems) {
      return statusList;
    }

    return statusList.filter(
      (status) => normalizeText(status.nome) !== "cadastrar patrimonio"
    );
  }, [statusList, hasPatrimonyItems]);

  const currentStatusIndex = useMemo(() => {
    const currentStatusId = Number(requisition.id_status_requisicao || 0);
    const index = visibleStatusList.findIndex(
      (status) => Number(status.id_status_requisicao) === currentStatusId
    );

    return index >= 0 ? index : 0;
  }, [visibleStatusList, requisition.id_status_requisicao]);

  const getAdjacentVisibleStatus = (
    direction: "previous" | "next"
  ): RequisitionStatus | undefined => {
    if (!visibleStatusList.length) return undefined;

    const currentStatusId = Number(requisition.id_status_requisicao || 0);
    const currentVisibleIndex = visibleStatusList.findIndex(
      (status) => Number(status.id_status_requisicao) === currentStatusId
    );

    if (currentVisibleIndex >= 0) {
      const targetIndex =
        direction === "next" ? currentVisibleIndex + 1 : currentVisibleIndex - 1;
      return visibleStatusList[targetIndex];
    }

    const currentStatusEtapa = Number(requisition.status?.etapa ?? 0);
    if (direction === "next") {
      return visibleStatusList.find(
        (status) => Number(status.etapa) > currentStatusEtapa
      );
    }

    const previousStatuses = visibleStatusList.filter(
      (status) => Number(status.etapa) < currentStatusEtapa
    );
    return previousStatuses[previousStatuses.length - 1];
  };

  useEffect(() => {
    RequisitionService.getAllFaturamentosTypes({ visible: 1 }).then((data) => {
      const tipos = data.map((tipo: any) => ({
        ...tipo,
        nome_faturamento: tipo.nome_faturamento ?? tipo.nome,
      }));
      setTiposFaturamento(tipos);
    });
  }, []);

  const checkIfItemsHaveAttachments = async (): Promise<boolean> => {
    try {
      const requisitionAttachments = await RequisitionFileService.getMany({
        id_requisicao,
      });
      if (requisitionAttachments.length > 0) {
        return true;
      }

      const items = await RequisitionItemService.getMany({ id_requisicao });
      let hasItemAttachments = false;

      for (const item of items) {
        const attachments =
          await RequisitionItemAttachmentService.getByRequisitionItem(
            item.id_item_requisicao
          );
        if (attachments.length > 0) {
          hasItemAttachments = true;
          break;
        }
      }

      return hasItemAttachments;
    } catch (error) {
      console.error("Erro ao verificar anexos:", error);
      return false;
    }
  };

  const validationRules = async (
    newStatus: RequisitionStatus,
    skipAttachmentValidation: boolean = false,
    skipTargetValidation: boolean = false
  ) => {
    if (!requisition.status) return;
    const advancingStatus = newStatus.etapa > requisition.status?.etapa || 0;
    const items = await RequisitionItemService.getMany({ id_requisicao });

    if (newStatus.nome === "Validação") {
      await Promise.all(
        items.map(async (item) => {
          console.log("item", item);
          if (item.quantidade === 0) {
            throw new Error(
              `O item ${item.produto_descricao} possui quantidade igual a zero.`
            );
          }
        })
      );
    }

    if (newStatus.nome === "Requisitado") {
      const missingTarget = items.some((item) => !item.target_price);
      if (missingTarget && !skipTargetValidation) {
        throw new Error("SHOW_MISSING_TARGET_PRICE_DIALOG");
      }
    }
    const noItems = items.length === 0;
    if (noItems) {
      throw new Error("Requisição sem itens");
    }

    if (newStatus.nome === "Em Cotação" && advancingStatus) {
      if (!skipAttachmentValidation) {
        const hasAttachments = await checkIfItemsHaveAttachments();
        if (!hasAttachments) {
          throw new Error("SHOW_VALIDATION_DIALOG");
        }
      }
    }
    if (
      newStatus.nome === "Aprovação Gerente" ||
      (newStatus.nome === "Aprovação Diretoria" && user?.PERM_COMPRADOR === 1)
    ) {
      if (!skipAttachmentValidation) {
        const hasAttachments = await checkIfItemsHaveAttachments();
        if (!hasAttachments) {
          throw new Error("SHOW_VALIDATION_DIALOG");
        }
      }

      const quotes = await QuoteService.getMany({ id_requisicao });
      const noQuotes = quotes.length === 0;
      const items = await RequisitionItemService.getMany({ id_requisicao });
      const allItemsHaveSelectedSupplier = items.every((item) => {
        const hasPositiveQuantity = Number(item.quantidade) > 0;
        return !hasPositiveQuantity || !!item.id_item_cotacao;
      });
      if (!allItemsHaveSelectedSupplier) {
        throw new Error(
          "Todos os itens devem estar selecionados em algum fornecedor."
        );
      }
      if (noQuotes) {
        throw new Error("Requisição sem cotações");
      }
      if (quotes.length > 0 && quotes.length < 3) {
        setJustifyingLessThenThreeQuotes(true);
        throw new Error("Requisição com menos de 3 cotações");
      }
    }
    return;
  };

  const handleChangeStatus = async (
    type: "acao_anterior" | "acao_posterior",
    confirmValidation?: boolean,
    skipTargetValidation?: boolean
  ) => {
    const hasPermission =
      type === "acao_anterior"
        ? permissionToRevertStatus
        : permissionToChangeStatus;

    if (!hasPermission) {
      dispatch(
        setFeedback({
          type: "error",
          message:
            type === "acao_anterior"
              ? "Você não tem permissão para reverter ao status anterior."
              : "Você não tem permissão para alterar o status.",
        })
      );
      return;
    }

    if (type === "acao_anterior") {
      const currentStatusId = requisition.id_status_requisicao;
      const currentStatusNome = requisition.status?.nome?.toLowerCase() || '';
      
      const shouldShowRevertDialog = 
        (currentStatusId === 6 || currentStatusId === 7) ||
        (user?.PERM_COMPRADOR === 1 && (currentStatusNome === 'requisitado' || currentStatusNome === 'em cotação'));
      
      if (shouldShowRevertDialog) {
        setShowRevertSelectionDialog(true);
        return;
      }
      setFillingComment(true);
      return;
    }

    if (type === "acao_posterior") {
      const newStatus = getAdjacentVisibleStatus("next");
      console.log("newStatus", newStatus);

      if (newStatus) {
        try {
          await validationRules(
            newStatus,
            confirmValidation || false,
            skipTargetValidation || false
          );
        } catch (error: any) {
          if (error.message === "SHOW_VALIDATION_DIALOG") {
            setPendingStatusChange(type);
            setShowValidationDialog(true);
            return;
          }
          if (error.message === "SHOW_MISSING_TARGET_PRICE_DIALOG") {
            setPendingStatusChangeMissingTarget(type);
            setShowMissingTargetPriceDialog(true);
            return;
          }
          if (error.message === "Requisição com menos de 3 cotações") {
            setJustifyingLessThenThreeQuotes(true);
            return;
          }
          dispatch(
            setFeedback({
              type: "error",
              message: error.message || "Erro ao validar requisição",
            })
          );
          return;
        }
      }

      if (newStatus?.nome === "Em separação") {
        dispatch(startAttendingItems());
        return;
      }

      if (!newStatus) {
        dispatch(
          setFeedback({
            type: "error",
            message: "Não foi possível determinar o próximo status.",
          })
        );
        return;
      }

      try {
        const updatedRequisition = await RequisitionService.updateStatus(
          Number(id_requisicao),
          {
            id_status_requisicao: newStatus.id_status_requisicao,
            alterado_por: user?.CODPESSOA,
          }
        );

        dispatch(setRequisition(updatedRequisition));
        dispatch(setRefresh(!refresh));
        dispatch(setRefreshRequisition(!refreshRequisition));

        try {
          const newPermissions = await RequisitionStatusService.getStatusPermissions(
            user!,
            updatedRequisition
          );
          const updatedStatusName = normalizeText(
            updatedRequisition.status?.nome ?? newStatus?.nome
          );
          const isConcludedStatus = updatedStatusName === "concluido";
          const shouldStayOnPageForManagerApproval =
            user?.PERM_COMPRADOR === 1 &&
            updatedStatusName === "aprovacao gerente";

          if (
            !newPermissions.permissionToChangeStatus &&
            !newPermissions.permissionToRevertStatus
          ) {
            dispatch(
              setFeedback({
                type: "success",
                message: "Status atualizado com sucesso!",
              })
            );
            if (!isConcludedStatus && !shouldStayOnPageForManagerApproval) {
              navigate("/requisicoes");
            }
            return;
          }

          dispatch(
            setFeedback({
              type: "success",
              message: "Status atualizado com sucesso!",
            })
          );
        } catch (permError) {
          console.error("Erro ao verificar permissões:", permError);
          dispatch(
            setFeedback({
              type: "success",
              message: "Status atualizado com sucesso!",
            })
          );
        }
      } catch (e: any) {
        if (e.response?.data?.code === "VALUE_INCREASE_REQUIRES_APPROVAL") {
          setPendingStatusChangeValueIncrease("acao_posterior");
          setShowValueIncreaseDialog(true);
          return;
        }

        dispatch(
          setFeedback({
            type: "error",
            message: `Erro ao atualizar status: ${e.message}`,
          })
        );
      }
      return;
    }
  };

  const concludeLessThenThreeQuotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newComment = await RequisitionCommentService.create({
        id_requisicao: Number(id_requisicao),
        descricao: comment,
        criado_por: user?.CODPESSOA,
      });

      const currentStep = requisition.status?.etapa ?? 0;
      const newStatus = getAdjacentVisibleStatus("next");

      if (!newStatus) {
        dispatch(
          setFeedback({
            type: "error",
            message: "Não foi possível determinar o próximo status.",
          })
        );
        return;
      }

      const updatedRequisition = await RequisitionService.updateStatus(
        Number(id_requisicao),
        {
          id_status_requisicao: newStatus.id_status_requisicao,
          alterado_por: user?.CODPESSOA,
        }
      );
      dispatch(setRequisition(updatedRequisition));
      dispatch(setRefresh(!refresh));
      dispatch(setRefreshRequisition(!refreshRequisition));
      setJustifyingLessThenThreeQuotes(false);
      setComment("");
      const updatedStatusName = normalizeText(
        updatedRequisition.status?.nome ?? newStatus?.nome
      );
      const shouldStayOnPageForManagerApproval =
        user?.PERM_COMPRADOR === 1 &&
        updatedStatusName === "aprovacao gerente";

      if (!permissionToChangeStatus && !shouldStayOnPageForManagerApproval) {
        navigate("/requisicoes");
        return;
      }
      dispatch(
        setFeedback({
          type: "success",
          message: "Status atualizado com sucesso!",
        })
      );
      if (!shouldStayOnPageForManagerApproval) {
        navigate("/requisicoes");
      }
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao atualizar status: ${e.message}`,
        })
      );
    }
  };

  const handleAttendItems = async () => {
    try {
      let comprasItems = await RequisitionItemService.getMany({
        id_requisicao,
      });
      comprasItems = comprasItems.filter((item) => !item.quantidade_disponivel);
      comprasItems = [...comprasItems, ...notAttendedItems];
      const { estoque, compras } = await RequisitionService.attend(
        Number(id_requisicao),
        user?.CODPESSOA || 0,
        [...items, ...comprasItems]
      );
      dispatch(stopAttendingItems());
      if (!estoque) {
        navigate(`/requisicoes`);
        return;
      }
      dispatch(setRefreshRequisition(!refreshRequisition));
      dispatch(setRefresh(!refresh));
      return;
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao atualizar status: ${e.message}`,
        })
      );
    }
  };

  const handleRetreatRequisition = async () => {
    setFillingComment(false);
    setComment("");
    const createdComment = await RequisitionCommentService.create({
      id_requisicao: Number(id_requisicao),
      descricao: comment,
      criado_por: user?.CODPESSOA || 0,
    });
    if (createdComment) {
      dispatch(addComment(createdComment));
      const type = "acao_anterior";
      const newStatus = getAdjacentVisibleStatus("previous");

      if (!newStatus) {
        dispatch(
          setFeedback({
            type: "error",
            message: "Não foi possível alterar o status.",
          })
        );
        return;
      }
      const updatedRequisition = await RequisitionService.updateStatus(
        Number(id_requisicao),
        {
          id_status_requisicao: newStatus.id_status_requisicao,
          alterado_por: user?.CODPESSOA,
          is_reverting: true,
        }
      );
      dispatch(setRequisition(updatedRequisition));
      dispatch(setRefresh(!refresh));

      try {
        const newPermissions = await RequisitionStatusService.getStatusPermissions(
          user!,
          updatedRequisition
        );

        if (
          !newPermissions.permissionToChangeStatus &&
          !newPermissions.permissionToRevertStatus
        ) {
          dispatch(
            setFeedback({
              type: "success",
              message: "Status atualizado com sucesso!",
            })
          );
          navigate("/requisicoes");
          return;
        }

        dispatch(
          setFeedback({
            type: "success",
            message: "Status atualizado com sucesso!",
          })
        );
      } catch (permError) {
        console.error("Erro ao verificar permissões:", permError);
        dispatch(
          setFeedback({
            type: "success",
            message: "Status atualizado com sucesso!",
          })
        );
      }
    }
  };

  const handleRevertSelectionConfirm = () => {
    setShowRevertSelectionDialog(false);
    setFillingComment(true);
  };

  const handleRevertWithOption = async () => {
    if (!comment.trim()) {
      dispatch(
        setFeedback({
          type: "error",
          message: "Justificativa é obrigatória.",
        })
      );
      return;
    }
  
    if (revertOption === "previous") {
      await handleRetreatRequisition();
      return;
    }

    setFillingComment(false);
    
    try {
      await RequisitionService.revertToInitialStatus(
        Number(id_requisicao),
        user,
        comment,
      );
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao reverter status: ${e.message}`,
        })
      );
      return;
    }

    const createdComment = await RequisitionCommentService.create({
      id_requisicao: Number(id_requisicao),
      descricao: comment,
      criado_por: user?.CODPESSOA || 0,
    })
    if (createdComment) {
      dispatch(addComment(createdComment))
    }

    setComment("");
    setRevertOption("previous");
    dispatch(setRefreshRequisition(!refreshRequisition));
    dispatch(setRefresh(!refresh));

    try {
      const newPermissions = await RequisitionStatusService.getStatusPermissions(
        user!,
        requisition
      );

      if (
        !newPermissions.permissionToChangeStatus &&
        !newPermissions.permissionToRevertStatus
      ) {
        dispatch(
          setFeedback({
            type: "success",
            message: "Status atualizado com sucesso!",
          })
        );
        navigate("/requisicoes");
        return;
      }

      dispatch(
        setFeedback({
          type: "success",
          message: "Status atualizado com sucesso!",
        })
      );
    } catch (permError) {
      console.error("Erro ao verificar permissões:", permError);
      dispatch(
        setFeedback({
          type: "success",
          message: "Status atualizado com sucesso!",
        })
      );
    }
  };

  const handleCancel = async () => {
    try {
      const updatedRequisition = await RequisitionService.cancel(
        Number(id_requisicao)
      );
      dispatch(setRequisition(updatedRequisition));
      dispatch(
        setFeedback({
          type: "success", 
          message: "Requisição cancelada com sucesso!",
        })
      );
      navigate("/requisicoes");
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao cancelar requisição: ${e.message}`,
        })
      );
    }
  };

  const handleActivate = async () => {
    try {
      const updatedRequisition = await RequisitionService.activate(
        Number(id_requisicao)
      );
      dispatch(setRequisition(updatedRequisition));
      dispatch(
        setFeedback({
          type: "success", 
          message: "Requisição ativada com sucesso!",
        })
      );
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao ativar requisição: ${e.message}`,
        })
      );
    }
  };

  const confirmValidationStatusChange = async () => {
    console.log("confirmValidationStatusChange");
    setShowValidationDialog(false);
    if (pendingStatusChange) {
      console.log("pendingStatusChange", pendingStatusChange);
      await handleChangeStatus(pendingStatusChange, true);
    }
    setPendingStatusChange(null);
  };

  const cancelValidationStatusChange = () => {
    setShowValidationDialog(false);
    setPendingStatusChange(null);
  };

  const confirmMissingTargetPriceStatusChange = async () => {
    setShowMissingTargetPriceDialog(false);
    setSkipTargetPriceValidation(true);
    if (pendingStatusChangeMissingTarget) {
      await handleChangeStatus(pendingStatusChangeMissingTarget, true, true);
    }
    setPendingStatusChangeMissingTarget(null);
  };

  const cancelMissingTargetPriceStatusChange = () => {
    setShowMissingTargetPriceDialog(false);
    setPendingStatusChangeMissingTarget(null);
    setSkipTargetPriceValidation(false);
  };

  const handleValueIncreaseReview = () => {
    setShowValueIncreaseDialog(false);
    setPendingStatusChangeValueIncrease(null);
  };

  const handleValueIncreaseAccept = async () => {
    setShowValueIncreaseDialog(false);

    try {
      const scopeApprovalMap: { [key: number]: number } = {
        2: 7,
        3: 110,
        5: 118,
      };

      const approvalStatusId =
        scopeApprovalMap[requisition.id_escopo_requisicao];

      if (!approvalStatusId) {
        dispatch(
          setFeedback({
            type: "error",
            message:
              "Não foi possível determinar o status de aprovação para este escopo.",
          })
        );
        return;
      }

      const updatedRequisition = await RequisitionService.updateStatus(
        Number(id_requisicao),
        {
          id_status_requisicao: approvalStatusId,
          alterado_por: user?.CODPESSOA,
        }
      );

      dispatch(setRequisition(updatedRequisition));
      dispatch(setRefresh(!refresh));
      dispatch(setRefreshRequisition(!refreshRequisition));
      setPendingStatusChangeValueIncrease(null);

      dispatch(
        setFeedback({
          type: "success",
          message:
            "Requisição retornada para aprovação da diretoria devido ao aumento de valor.",
        })
      );

      navigate("/requisicoes");
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao retornar para aprovação: ${e.message}`,
        })
      );
    }
  };

  const getPermTargetByTipoFaturamento = (tipoFaturamentoId: any): any => {
    let perm;

    switch (tipoFaturamentoId) {
      case 1:
        perm = "perm_faturamento_dse";
        break;
      case 2:
        perm = "perm_faturamento_direto";
        break;
      case 3:
        perm = "perm_operacional";
        break;
      case 6:
        perm = "perm_ti";
        break;
      default:
        perm = null;
    }

    return perm;
  };

  const handleChangeRequisitionType = async () => {
    if (!selectedTipoFaturamento) return;

    const permTarget = getPermTargetByTipoFaturamento(selectedTipoFaturamento);
    if (!permTarget) {
      throw new Error("Tipo de faturamento inválido.");
    }

    const validItems: any[] = [];
    const invalidItems: any[] = [];

    items.forEach((item) => {
      const prod = (item?.produto as any) ?? {};
      if (prod[permTarget] === 1) {
        validItems.push(item);
      } else {
        invalidItems.push(item);
      }
    });

    if (validItems.length === 0 && items.length > 0) {
      dispatch(
        setFeedback({
          type: "error",
          message: "Nenhum item permite esse tipo de faturamento.",
        })
      );
      return;
    }

    if (invalidItems.length > 0) {
      try {
        const result = await RequisitionService.changeRequisitionTypeWithSplit(
          Number(id_requisicao),
          selectedTipoFaturamento,
          Number(requisition.id_status_requisicao),
          validItems.map((item) => item.id_item_requisicao)
        );

        dispatch(setRequisition(result.originalRequisition));
        dispatch(setRefreshRequisition(!refreshRequisition));
        dispatch(setRefresh(!refresh));
        setShowChangeTypeDialog(false);
        setSelectedTipoFaturamento(null);

        dispatch(
          setFeedback({
            type: "success",
            message: `Tipo de solicitação alterado! ${invalidItems.length} item(ns) foram mantidos na requisição original.`,
          })
        );

        navigate("/requisicoes");
      } catch (e: any) {
        dispatch(
          setFeedback({
            type: "error",
            message: `Erro ao alterar tipo de solicitação: ${e.message}`,
          })
        );
      }
      return;
    }

    try {
      const updatedRequisition = await RequisitionService.updateRequisitionType(
        Number(id_requisicao),
        selectedTipoFaturamento,
        Number(requisition.id_status_requisicao)
      );

      dispatch(setRequisition(updatedRequisition));
      dispatch(setRefreshRequisition(!refreshRequisition));
      setShowChangeTypeDialog(false);
      setSelectedTipoFaturamento(null);

      dispatch(
        setFeedback({
          type: "success",
          message: "Tipo de solicitação alterado com sucesso!",
        })
      );
    } catch (e: any) {
      dispatch(
        setFeedback({
          type: "error",
          message: `Erro ao alterar tipo de solicitação: ${e.message}`,
        })
      );
    }
  };

  useEffect(() => {
      const handleGlobalFocus = (event: FocusEvent) => {
        if (event.target) {
          const element = event.target as HTMLElement;
          if (element.classList.contains("MuiInputBase-input")) {
            setFocusedElement(event.target);
          }
        }
      };
      const handleGlobalBlur = () => {
        setFocusedElement(null);
      };
      window.addEventListener("focusin", handleGlobalFocus);
      window.addEventListener("focusout", handleGlobalBlur);
      return () => {
        window.removeEventListener("focusin", handleGlobalFocus);
        window.removeEventListener("focusout", handleGlobalBlur);
      };
    }, []);

  const canChangeRequisitionType = (): boolean => {
    const allowedStatusIds = [1, 2, 3, 10, 107, 108, 109, 115, 116, 117];
    return allowedStatusIds.includes(
      requisition.status?.id_status_requisicao ?? 0
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {requisition.status?.nome !== "Cancelado" && (
        <Stepper
          alternativeLabel
          activeStep={currentStatusIndex}
          connector={<CustomConnector />}
          sx={{
            
            padding: {
              xs: 2,
              sm: 0,
            },
            minWidth: { xs: "100%", sm: 600 },
            flexWrap: "nowrap",
            overflowX: "auto",
            "& .MuiStepLabel-label": {
              mt: 0.5,
              fontSize: { xs: 10, sm: 12 },
              fontWeight: 500,
            },
          }}
        >
          {visibleStatusList.map((status, idx) => (
            <Step key={status.id_status_requisicao}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography
                  fontSize={{ xs: 10, sm: 12 }}
                  fontWeight={idx === currentStatusIndex ? 700 : 400}
                  color={
                    idx === currentStatusIndex
                      ? "text.primary"
                      : "text.secondary"
                  }
                  sx={{ textAlign: "center", whiteSpace: "nowrap" }}
                >
                  {status.nome}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      <Stack direction="row" justifyContent="center" spacing={1}>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleChangeStatus("acao_anterior")}
          sx={{ minHeight: 28, px: { xs: 0.5, sm: 1 } }}
        >
          <ArrowCircleLeftIcon fontSize="small" />
          <Typography fontSize={12}>
            {requisition.status?.acao_anterior}
          </Typography>
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleChangeStatus("acao_posterior")}
          sx={{ minHeight: 28, px: { xs: 0.5, sm: 1 } }}
        >
          <Typography fontSize={12}>
            {requisition.status?.acao_posterior}
          </Typography>
          <ArrowCircleRightIcon fontSize="small" />
        </Button>
        {canChangeRequisitionType() && (
          <Button
            size="small"
            variant="contained"
            onClick={() => setShowChangeTypeDialog(true)}
            sx={{ minHeight: 28, px: { xs: 0.5, sm: 1 } }}
          >
            <Typography fontSize={12}>Alterar tipo de solicitação</Typography>
            <SwapHorizIcon fontSize="small" />
          </Button>
        )}
        {permissionToCancel && (
          <Button
            size="small"
            variant="contained"
            color="error"
            sx={{ minHeight: 28 }}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        )}
        {permissionToActivate && (
          <Button
            size="small"
            variant="contained"
            color="success"
            sx={{ minHeight: 28 }}
            onClick={handleActivate}
          >
            Reativar
          </Button>
        )}
      </Stack>
      <Dialog open={fillingComment}>
        <DialogTitle>
          Justifique o retorno da requisição para etapa anterior
        </DialogTitle>
        <DialogContent>
          <ElegantInput
            label="Justificativa"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => {
              setFillingComment(false);
              setComment("");
              setRevertOption("previous");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => {
              if (showRevertSelectionDialog || revertOption === "initial") {
                handleRevertWithOption();
              } else {
                handleRetreatRequisition();
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        fullWidth
        maxWidth="lg"
        open={attendingItems}
        onClose={() => dispatch(stopAttendingItems())}
      >
        <DialogTitle>Atender aos items solicitados</DialogTitle>
        <DialogContent>
          <RequisitionItemsTable hideFooter={false} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => dispatch(stopAttendingItems())}
          >
            cancelar
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: focusedElement === null ? "success.main" : "lightgray",
              "&:hover": {
                bgcolor: "success.dark",
              },
            }}
            disabled={focusedElement !== null}
            onClick={() => handleAttendItems()}
          >
            confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showRevertSelectionDialog}
        onClose={() => setShowRevertSelectionDialog(false)}
      >
        <DialogTitle>Selecione o tipo de retrocesso</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Escolha se a requisição deve voltar para o status anterior ou para o status inicial:
          </Typography>
          <RadioGroup
            value={revertOption}
            onChange={(e) => setRevertOption(e.target.value as "previous" | "initial")}
          >
            <FormControlLabel
              value="previous"
              control={<Radio />}
              label={`Voltar para status anterior (${requisition.status?.acao_anterior || 'Status anterior'})`}
            />
            <FormControlLabel
              value="initial"
              control={<Radio />}
              label="Voltar para status inicial (Em edição)"
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => {
              setShowRevertSelectionDialog(false);
              setRevertOption("previous");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={handleRevertSelectionConfirm}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        onClose={() => setJustifyingLessThenThreeQuotes(false)}
        open={justifyingLessThenThreeQuotes}
      >
        <DialogTitle>Justifique o avançar com menos de 3 cotações</DialogTitle>
        <Box
          component={"form"}
          onSubmit={(e: React.FormEvent) => concludeLessThenThreeQuotes(e)}
        >
          <DialogContent>
            <ElegantInput
              label="Justificativa"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={() => setJustifyingLessThenThreeQuotes(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              size="small"
              color="success"
              type="submit"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={showValidationDialog}
        onClose={cancelValidationStatusChange}
      >
        <DialogTitle>Confirmação de mudança de status</DialogTitle>
        <DialogContent>
          <Typography>
            Você tem certeza que deseja prosseguir para o status "Em Cotação"
            sem criar nenhum anexo?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={cancelValidationStatusChange}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={confirmValidationStatusChange}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showMissingTargetPriceDialog}
        onClose={cancelMissingTargetPriceStatusChange}
      >
        <DialogTitle>Confirmação de mudança de status</DialogTitle>
        <DialogContent>
          <Typography>
            Existem itens sem preço alvo definido.
            <br />
            Tem certeza que deseja prosseguir para o status "Requisitado" sem
            preencher o campo "Preço alvo" de todos os itens?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={cancelMissingTargetPriceStatusChange}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={confirmMissingTargetPriceStatusChange}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showChangeTypeDialog}
        onClose={() => setShowChangeTypeDialog(false)}
      >
        <DialogTitle>Alterar tipo de solicitação</DialogTitle>
        <DialogContent>
          <FormLabel component="legend">
            Selecione o tipo de faturamento:
          </FormLabel>
          <RadioGroup
            value={selectedTipoFaturamento ?? ""}
            onChange={(e) => setSelectedTipoFaturamento(Number(e.target.value))}
          >
            {tiposFaturamento.map((tipo) => (
              <FormControlLabel
                key={tipo.id}
                value={tipo.id}
                control={<Radio />}
                label={tipo.nome_faturamento}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => setShowChangeTypeDialog(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={handleChangeRequisitionType}
            disabled={selectedTipoFaturamento === null}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showValueIncreaseDialog}
        onClose={() => setShowValueIncreaseDialog(false)}
      >
        <DialogTitle>Valor excedeu o limite aprovado</DialogTitle>
        <DialogContent>
          <Typography>
            O valor da requisição passou do valor limite para prosseguir sem
            aprovação novamente.
            <br />
            <br />A requisição precisará retornar para aprovação da diretoria.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={handleValueIncreaseReview}
          >
            Rever valores
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={handleValueIncreaseAccept}
          >
            Aceitar retorno para aprovação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequisitionStatusStepper;