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
import { Alert, AlertColor, Stack } from "@mui/material";

import { AlertInterface, RequisitionStatus } from "../../types";
import typographyStyles from "../../utilStyles";
import { BaseButtonStyles } from "../../../utilStyles";


interface props {
  requisitionData: Requisition;
  setRequisitionData: (requisition: Requisition) => void;
}


const HorizontalLinearStepper: React.FC<props> = ({
  requisitionData,
  // setRequisitionData,
  // items
}) => {

  const { user } = useContext(userContext);
  const { toggleRefreshRequisition } = useContext(RequisitionContext);

  const [alert, setAlert] = useState<AlertInterface>();
  const [steps, setSteps] = useState<RequisitionStatus[]>();
  const [activeStep, setActiveStep] = useState<number>();

   const displayAlert = async (severity: string, message: string) => {
     setTimeout(() => {
       setAlert(undefined);
     }, 5000);
     setAlert({ severity, message });
     return;
   };

  const handleNext = async ( ) => { 
     if(user){ 
        try {
          const { status } = requisitionData;
          if (status) {
            const newStatus = steps?.find((s) => s.etapa === status.etapa + 1);
             await updateRequisition(user.CODPESSOA, {
               ...requisitionData,
               id_status_requisicao: newStatus?.id_status_requisicao || 0
             });
               setActiveStep(newStatus?.etapa);
             toggleRefreshRequisition();
          }
        } catch (e: any) {
          displayAlert("error", e.message);
        }
     }
  }

  const handleBack = async () => {
  if (user) {
    try {
      const { status } = requisitionData;
      if (status) {
        const newStatus = steps?.find((s) => s.etapa === status.etapa - 1);
        await updateRequisition(user.CODPESSOA, {
          ...requisitionData,
          id_status_requisicao: newStatus?.id_status_requisicao || 0,
        });
        setActiveStep(newStatus?.etapa);
        toggleRefreshRequisition();
      }
    } catch (e: any) {
      displayAlert("error", e.message);
    }
  }
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
            <Button sx={BaseButtonStyles} onClick={handleBack}>
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
    </Box>
  );
};
export default HorizontalLinearStepper;
