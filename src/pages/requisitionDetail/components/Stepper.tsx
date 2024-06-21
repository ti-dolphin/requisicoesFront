import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Requisition, updateRequisition } from "../../../utils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from "react";

const steps = [
  "Em edição",
  "Requisitado",
  "Em cotação",
  "Cotado",
  "Comprar",
  "Concluído"
];
interface props{ 
  requisitionData : Requisition
}
const HorizontalLinearStepper : React.FC<props> = ({ requisitionData }) => {
   
  const [requisition, setRequisition ] = useState(requisitionData);
  // const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [activeStep, setActiveStep] = React.useState(steps.indexOf(requisitionData.STATUS));
  console.log('active Step: ', activeStep)
  const [skipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === -1;
  };
  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };
  const handleNext = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const nextStep = activeStep + 1;
    if (nextStep < steps.length){ 
      const editedRequisition = { ...requisition, ['STATUS']: steps[activeStep + 1] }
      console.log('editedRequisition: ', editedRequisition);
      try {
        await updateRequisition(editedRequisition);
        setRequisition(editedRequisition);

      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleBack = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    const editedRequisition = {...requisition, ['STATUS'] : steps[activeStep - 1]}
    console.log('editedRequisition: ', editedRequisition);
    setRequisition(editedRequisition);
     try{  
      await updateRequisition(editedRequisition);
      setRequisition(editedRequisition);
    }catch(e){
      console.log(e);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  return (
    <Box sx={{ width: "100%", paddingX: '1rem' }}>
      <Stepper activeStep={activeStep}>
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
          <Typography sx={{ mt: 2, mb: 1 }}>
            Requisição tratada!
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2}}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />

            <Button onClick={  handleNext }>
              {activeStep === steps.length - 1 ? "Finalizar" : "Avançar"}
            </Button>
             {/* <Modal
              open={isChangeStatusModalOpen}
             >
              <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      border: '2px solid #000',
                      boxShadow: 24,
                      p: 4,
                  }}>

              </Box>
             </Modal> */}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
export default HorizontalLinearStepper;