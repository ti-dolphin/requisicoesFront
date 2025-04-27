import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getRequisitionStatusList, Requisition, updateRequisition } from "../../utils";
import { useContext } from "react";
import { useState } from "react";
import { RequisitionContext } from "../../context/RequisitionContext";
import { userContext } from "../../context/userContext";
import { Alert, AlertColor, Modal, Stack, Paper, TextField } from "@mui/material";

import { AlertInterface, RequisitionStatus } from "../../types";
import typographyStyles from "../../utilStyles";
import { BaseButtonStyles } from "../../../utilStyles";

interface props {
  requisitionData: Requisition;
  setRequisitionData: (requisition: Requisition) => void;
}

const HorizontalLinearStepper: React.FC<props> = ({ requisitionData }) => {
  const { user } = useContext(userContext);
  const { toggleRefreshRequisition } = useContext(RequisitionContext);

  const [alert, setAlert] = useState<AlertInterface>();
  const [steps, setSteps] = useState<RequisitionStatus[]>();
  const [activeStep, setActiveStep] = useState<number>();
  const [justifyBackModalOpen, setJustifyBackModalOpen] =
    useState<boolean>(false);
  const [justification, setJustification] = useState<string>(""); // State for justification

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 5000);
    setAlert({ severity, message });
    return;
  };

  const handleNext = async () => {
    if (user) {
      try {
        const { status } = requisitionData;
        if (status) {
          const newStatus = steps?.find((s) => s.etapa === status.etapa + 1);
          if (newStatus?.id_status_requisicao === 3 && !user.PERM_COMPRADOR) {
            throw new Error("Você não tem permissão para avançar.");
          }
          if (newStatus?.id_status_requisicao === 4 && !user.PERM_COMPRADOR) {
            throw new Error("Você não tem permissão para aprovar a requisição.");
          }
          if(newStatus?.id_status_requisicao === 6 && !user.PERM_COMPRADOR){ 
             throw new Error("Você não tem permissão para finalizar a cotação.");
          }
          if(newStatus?.id_status_requisicao === 7 && !user.CODGERENTE){
            throw new Error("Você não tem permissão para aprovar a requisição.");
          }
          if(newStatus?.id_status_requisicao === 8 && !user.PERM_DIRETOR){
            throw new Error("Você não tem permissão para aprovar a requisição.");
          }
          if(newStatus?.id_status_requisicao === 9 && !user.PERM_COMPRADOR){
            throw new Error("Você não tem permissão para avançar para este status.");
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

  const handleBack = async () => {
    if (user) {
      try {
        const { status } = requisitionData;
        if (status) {
          const newStatus = steps?.find((s) => s.etapa === status.etapa - 1);
          await updateRequisition(
            user.CODPESSOA,
            {
              ...requisitionData,
              id_status_requisicao: newStatus?.id_status_requisicao || 0,
            },
            justification,
            requisitionData.id_status_requisicao, //id_status_anterior
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

  React.useEffect(() => {
    if (requisitionData) {
      console.log("status: ", requisitionData.status);
      setActiveStep(requisitionData.status?.etapa);
    }
  }, []);

  React.useEffect(() => {
    const fetchStatusList = async () => {
      const statusList = await getRequisitionStatusList();
      setSteps(statusList);
    };
    fetchStatusList();
  }, []);

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
          {steps.map((step) => (
            <Step key={step.id_status_requisicao}>
              <StepLabel sx={{ textAlign: "left" }}>
                <Typography sx={typographyStyles.smallText}>
                  {step.nome}
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
          {requisitionData.status.acao_anterior !== "-" ? (
            <Button
              sx={BaseButtonStyles}
              onClick={() => setJustifyBackModalOpen(true)}
            >
              {requisitionData.status.acao_anterior}
            </Button>
          ) : (
            <Box></Box>
          )}
          <Button onClick={handleNext} sx={BaseButtonStyles}>
            {requisitionData.status.acao_posterior}
          </Button>
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
