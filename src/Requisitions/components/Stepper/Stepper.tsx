import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  fetchItems,
  getRequisitionStatusList,
  Requisition,
  updateRequisition,
} from "../../utils";
import { useContext } from "react";
import { useState } from "react";
import { RequisitionContext } from "../../context/RequisitionContext";
import { User, userContext } from "../../context/userContext";
import {
  Alert,
  AlertColor,
  Modal,
  Stack,
  Paper,
  TextField,
} from "@mui/material";

import { AlertInterface, Item, RequisitionStatus } from "../../types";
import typographyStyles from "../../utilStyles";
import { BaseButtonStyles } from "../../../utilStyles";
import { green, red } from "@mui/material/colors";


interface props {
  requisitionData: Requisition;
  setRequisitionData: (requisition: Requisition) => void;
}

const HorizontalLinearStepper: React.FC<props> = ({ requisitionData }) => {
  const { user } = useContext(userContext);
  const { toggleRefreshRequisition } = useContext(RequisitionContext);
  const [alert, setAlert] = useState<AlertInterface>();
  const [activeStep, setActiveStep] = useState<number>();
  const [justifyBackModalOpen, setJustifyBackModalOpen] = useState<boolean>(false);
  const [justification, setJustification] = useState<string>(""); // State for justification
 
  //data
  const [cancelled, setCancelled] = useState(false);
  const [steps, setSteps] = useState<RequisitionStatus[]>();
  const [items, setItems] = useState<any[]>([]);

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 5000);
    setAlert({ severity, message });
    return;
  };

  const verifyOCS = (newStatus : RequisitionStatus, items: Item[]) => {
    console.log('items: ', items)
    if (newStatus.etapa === 6) {
      const invalidItem = items.find((item: Item) => !item.OC);
      if (invalidItem) {
        throw new Error("Preencha todas as OCS dos items antes de avançar");
      }
    } 
  };


  const handleNext = async () => {
    if (user) {
      try {
        const { status } = requisitionData;
        if (status) {
          const newStatus = steps?.find((s) => s.etapa === status.etapa + 1);
          if(newStatus){ 
            verifyPermissionToChangeStatus(user, newStatus );
            verifyOCS(newStatus, items);
          }
          await updateRequisition(
            user.CODPESSOA,
            {
              ...requisitionData,
              id_status_requisicao: newStatus?.id_status_requisicao || 0,
            },
            "",
            requisitionData.id_status_requisicao // id_status_anterior
          );
          setActiveStep(newStatus?.etapa);
          toggleRefreshRequisition();
        }
      } catch (e: any) {
        displayAlert("error", e.message);
      }
    }
  };

  const verifyPermissionToChangeStatus = ( user: User, status : RequisitionStatus) => {
  const userRoles = {
    isResponsable: user.CODPESSOA === requisitionData.responsavel_pessoa?.CODPESSOA,
    isManager: user.CODPESSOA === requisitionData.projeto_gerente?.gerente?.CODPESSOA,
    isDirector: user.PERM_DIRETOR,
    isPurchaser: user.PERM_COMPRADOR,
    isAdmin: user.PERM_ADMINISTRADOR,
  };
  console.log('userRoles: ', userRoles)
  const roles = Object.keys(userRoles)
    const availableStatusEtapaPerUserRole = {
      isResponsable: [1],
      isPurchaser: [0, 1, 2, 3, 6],
      isManager: [4, 2],
      isDirector: [5, 3],
      isAdmin: [0, 1, 2, 3, 4, 5, 6],
    };
    roles.forEach((role) => { 
        if (userRoles[role as keyof typeof userRoles]) {
          const statusAllowed = availableStatusEtapaPerUserRole[
            role as keyof typeof userRoles
          ].includes(status.etapa);
          if(!statusAllowed) {
            throw new Error('Você não tem permissão para mudar o status para '+ status.nome)
          }
        }
    });
  }

  const handleBack = async () => {
    if (user) {
      try {
        const { status } = requisitionData;
        if (status) {
          const newStatus = steps?.find((s) => s.etapa === status.etapa - 1);
          if (newStatus) {
            verifyPermissionToChangeStatus(user, newStatus);
          }
          await updateRequisition(
            user.CODPESSOA,
            {
              ...requisitionData,
              id_status_requisicao: newStatus?.id_status_requisicao || 0,
            },
            justification,
            requisitionData.id_status_requisicao //id_status_anterior
          );
          setActiveStep(newStatus?.etapa);
          toggleRefreshRequisition();
        }
      } catch (e: any) {
        displayAlert("error", e.message);
      }
    }
  };

  const handleJustifyBack = async () => {
    if (justification.trim() === "") {
      displayAlert("error", "A justificativa é obrigatória.");
      return;
    }
    await handleBack(); // Call the existing handleBack function
    setJustifyBackModalOpen(false); // Close modal
    setJustification(""); // Reset justification
  };

   const handleCancel = async () => {
     if (user) {
       await updateRequisition(
         user.CODPESSOA,
         {
           ...requisitionData,
           id_status_requisicao: 99
         },
         justification,
         requisitionData.id_status_requisicao 
       );
       toggleRefreshRequisition();
     }
   };

   const handleReactivate = async ( ) =>  {
    let previousStatus = requisitionData.status_anterior;
    if (user) {
         try {
             if(previousStatus) {
               await updateRequisition(
                 user.CODPESSOA,
                 {
                   ...requisitionData,
                   id_status_requisicao: previousStatus.id_status_requisicao,
                 },
                 justification,
                 previousStatus.id_status_requisicao
               );
               toggleRefreshRequisition();
               return
             }
               await updateRequisition(
                 user.CODPESSOA,
                 {
                   ...requisitionData,
                   id_status_requisicao: 1
                 },
                 justification,
                 requisitionData.status?.id_status_requisicao
               );
               toggleRefreshRequisition();
         } catch (e: any) {
           displayAlert("error", e.message);
         }
    }
   }

  const shouldShowCancelButton = ( ) => { 
    return user && user.PERM_COMPRADOR !== 0 && activeStep !== 6 && !cancelled
  }

  const shouldShowReactivateButton = ( ) => { 
    return user && user.PERM_COMPRADOR !== 0 && activeStep !== 6 && cancelled
  };
  const renderStatusName = (step : RequisitionStatus ) => { 
    if(!requisitionData) return;
    const {status_anterior} = requisitionData;
    if (step.etapa === status_anterior?.etapa && cancelled) {
      return "Cancelado";
    }
    return step.nome;
  }

  const shouldShowNextButton = () => {
    return !cancelled && requisitionData.status && requisitionData.status.acao_posterior !== '-'; 
  }

  const shouldShowBackButton = ( ) => { 
    return !cancelled && requisitionData.status && requisitionData.status.acao_anterior !== "-" 
  }

  React.useEffect(() => {
    const notCancelled = !(requisitionData.status?.etapa === 99);
    const cancelled = requisitionData.status?.etapa === 99;
  
    setCancelled(cancelled);
    const fetchSteps = async () => {
      const statusList = await getRequisitionStatusList();
      setSteps(statusList);
    };
    const fetchReqItems = async () => {
      const items = await fetchItems(requisitionData.ID_REQUISICAO);
      setItems(items);
    };
    fetchSteps();
    fetchReqItems();  

    if(cancelled && requisitionData.status_anterior){
       setActiveStep(requisitionData.status_anterior.etapa);
       return;
    }
    if(notCancelled){ 
      setActiveStep(requisitionData.status?.etapa);
      return;
    }

  }, [requisitionData]);


  return (
    <Box
      sx={{
        width: "100%",
        paddingX: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {steps && (
        <Stepper
          sx={{
            width: "100%",
            overflow: "scroll",
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
          activeStep={activeStep}
          alternativeLabel
        >
          {steps
            .filter((step) => step.etapa !== 99)
            .map((step) => (
              <Step key={step.id_status_requisicao}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": {
                        color: green[600], // Cor do ícone quando o passo está ativo
                      },
                      "&.Mui-completed": {
                        color: green[600], // Cor do ícone quando o passo está completo
                      },
                      color: "gray", // Cor padrão do ícone quando não está ativo
                    },
                  }}
                  sx={{ textAlign: "left" }}
                >
                  <Typography
                    sx={{
                      ...typographyStyles.smallText,
                      color: activeStep === step.etapa ? green[600] : "black",
                      fontWeight: activeStep === step.etapa ? "bold" : "normal",
                    }}
                  >
                    {renderStatusName(step)}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
        </Stepper>
      )}
      {requisitionData.status && (
        <Stack
          direction="row"
          sx={{ width: "100%", justifyContent: "center", gap: 2, padding: 1 }}
        >
          {shouldShowBackButton() &&(
            <Button
              sx={BaseButtonStyles}
              onClick={() => setJustifyBackModalOpen(true)}
            >
              {requisitionData.status.acao_anterior}
            </Button>
          )}
          { shouldShowNextButton() &&
            <Button onClick={handleNext} sx={BaseButtonStyles}>
              {requisitionData.status.acao_posterior}
            </Button>
          }
          {shouldShowCancelButton() && (
            <Button
              onClick={handleCancel}
              sx={{
                ...BaseButtonStyles,
                backgroundColor: red[700],
                "&:hover": { backgroundColor: red[600] },
              }}
            >
              Cancelar
            </Button>
          )}
          {shouldShowReactivateButton() && (
            <Button
              onClick={handleReactivate}
              sx={{
                ...BaseButtonStyles,
                backgroundColor: green[700],
                "&:hover": { backgroundColor: green[500] },
              }}
            >
              Reativar
            </Button>
          )}
        </Stack>
      )}
      {alert && (
        <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>
      )}
      <Modal
        open={justifyBackModalOpen}
        onClose={() => setJustifyBackModalOpen(false)}
        aria-labelledby="justify-back-modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: { xs: "90%", md: "400px" },
            p: 3,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography
            id="justify-back-modal-title"
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Justificar Retorno
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Por favor, insira uma justificativa para retornar ao status
            anterior.
          </Typography>
          <TextField
            multiline
            fullWidth
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Digite sua justificativa aqui..."
            style={{
              width: "100%",
              height: "100px",
              padding: "8px",
              borderRadius: "4px",
              resize: "none",
              marginBottom: "16px",
            }}
          />
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Button
              onClick={handleJustifyBack}
              sx={{ ...BaseButtonStyles, backgroundColor: "#d32f2f" }}
            >
              Confirmar
            </Button>
            <Button
              onClick={() => setJustifyBackModalOpen(false)}
              sx={BaseButtonStyles}
            >
              Cancelar
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};
export default HorizontalLinearStepper;
