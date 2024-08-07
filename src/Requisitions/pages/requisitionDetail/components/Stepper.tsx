import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Requisition, updateRequisition } from "../../../utils";
import { useContext } from "react";
import { useState } from "react";
import { RequisitionContext } from "../../../context/RequisitionContext";
import { userContext } from "../../../context/userContext";
import { Alert } from "@mui/material";

const steps = ["Em edição", "Requisitado", "Em cotação", "Cotado", "Concluído"];
interface props {
  requisitionData: Requisition;
  setRequisitionData: (requisition: Requisition) => void;
}
const HorizontalLinearStepper: React.FC<props> = ({
  requisitionData,
  setRequisitionData,
}) => {
  const { user } = useContext(userContext);

  const { toggleRefreshRequisition, changeActiveStep } =
    useContext(RequisitionContext);

  const [requisition, setRequisition] = useState(requisitionData);

  const [nonPurchaserAlert, toggleNonPurchaserAlert] = useState<boolean>(false);

  const [activeStep, setActiveStep] = useState(
    steps.indexOf(requisitionData.STATUS) === steps.length - 1
      ? steps.length
      : steps.indexOf(requisitionData.STATUS)
  );

  React.useEffect(() => {
    changeActiveStep(activeStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const displayAlert = () => {
    setTimeout(() => {
      toggleNonPurchaserAlert(false);
    }, 3 * 1000);
    toggleNonPurchaserAlert(true);
  };

  const [skipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === -1;
  };
  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = async () => {
    const isPurchaser = user?.PERM_COMPRADOR;
    if (!isPurchaser && activeStep > 0) {
      displayAlert();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const nextStep = activeStep + 1;
    changeActiveStep(nextStep);
    if (nextStep < steps.length) {
      const editedRequisition = {
        ...requisition,
        ["STATUS"]: steps[activeStep + 1],
      };
      setRequisition(editedRequisition);
      if (user) {
        try {
          await updateRequisition(user.CODPESSOA, editedRequisition);
          setRequisition(editedRequisition);
          setRequisitionData(editedRequisition);
          toggleRefreshRequisition();
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const handleBack = async () => {
    const isPurchaser = user?.PERM_COMPRADOR;
    if (isPurchaser) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      const previousStep = activeStep - 1;
      changeActiveStep(previousStep);
      const editedRequisition = {
        ...requisition,
        ["STATUS"]: steps[activeStep - 1],
      };
      setRequisition(editedRequisition);
      if (user) {
        try {
          await updateRequisition(user.CODPESSOA, editedRequisition);
          setRequisition(editedRequisition);
          setRequisitionData(editedRequisition);
          toggleRefreshRequisition();
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      displayAlert();
    }
  };

  //eslint-disable-next-line @typescript-eslint/no-unused-vars

  return (
    <Box sx={{ width: "100%", paddingX: "0.5rem" }}>
      {nonPurchaserAlert && (
        <Alert
          variant="filled"
          className="drop-shadow-lg"
          severity="warning"
          sx={{
            width: "400px",
            position: "absolute",
            left: "50%",
            marginLeft: "-200px",
          }}
        >
          Você não tem permissão para alterar Status
        </Alert>
      )}
      <Stepper sx={{ flexWrap: "wrap", gap: "0.5rem" }} activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Requisição tratada!</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />

            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finalizar" : "Avançar"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};
export default HorizontalLinearStepper;
