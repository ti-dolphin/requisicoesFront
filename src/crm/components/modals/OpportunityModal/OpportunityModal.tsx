/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useContext,
} from "react";
import { OpportunityInfoContext } from "../../../context/OpportunityInfoContext";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertColor,
  Button,
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
import {
  opportunityDefault,
} from "../../../utils";
import CloseIcon from "@mui/icons-material/Close";
import Slider from "react-slick";
import OpportunityGuide from "../../OpportunityGuide/OpportunityGuide";
import { BaseButtonStyles } from "../../../../utilStyles";
import AdicionalChoice from "../AdicionalChoice/AdicionalChoice";
import { styles } from "./OpportunityModal.styles";
import typographyStyles from "../../../../Requisitions/utilStyles";
import GuideSelector from "../../GuideSelector/GuideSelector";
import ProjectChoiceModal from "../ProjectChoiceModal/ProjectChoiceModal";
import useOpportunityModal from "./hooks";

export const OpportunityModal = () => {
  const context = useContext(OpportunityInfoContext);
  const {
    opportunity,
    currentSlideIndex,
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
    handleSaveOpportunity,
    setProjectChoiceModalOpen,
    setSaveProgressModalOpen,
    creatingOpportunity,
    currentOppIdSelected,
    guidesReference,
    formDataFilesRef,
    settings,
    isLoading,
    changeWasMade,
    setChangeWasMade,
    alert 
  } = useOpportunityModal(opportunityDefault, context);

  const verifyChangeWasMade = ( ) => { 
    console.log({changeWasMade})
    if(changeWasMade){ 
      setSaveProgressModalOpen(true);
      return;
    }
    handleClose();
  }
  return (
    <Modal
      open={creatingOpportunity || currentOppIdSelected > 0}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styles.modal}>
        <IconButton
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
          }}
          onClick={verifyChangeWasMade}
        >
          <CloseIcon />
        </IconButton>{" "}
        <Stack>
          <Typography sx={typographyStyles.heading2}>
            {currentOppIdSelected > 0
              ? `${opportunity.codOs} - ${opportunity.nome}`
              : "Nova proposta"}
          </Typography>
        </Stack>
        {guidesReference.current && (
          <GuideSelector
            guides={guidesReference.current} // Passa os guias
            currentSlideIndex={currentSlideIndex} // Índice do guia selecionado
            handleChangeGuide={handleChangeGuide} // Função para lidar com a troca de guia
          />
        )}
        <Stack
          sx={{
            ...styles.sliderContainer,
            paddingBottom: 10,
          }}
          direction="column"
          width="100%"
          position="relative"
        >
          {alert && <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>}
          <Slider ref={sliderRef} {...settings}>
            {guidesReference.current &&
              guidesReference.current.map((guide) => (
                <OpportunityGuide
                  formDataFilesRef={formDataFilesRef}
                  guidesReference={guidesReference}
                  guide={guide}
                  isLoading={isLoading}
                  setChangeWasMade={setChangeWasMade}
                />
              ))}
          </Slider>
        </Stack>
        <Box ref={saveButtonContainerRef} sx={styles.saveButtonContainer}>
          <Button sx={BaseButtonStyles} onClick={handleSaveOpportunity}>
            <Typography>Salvar</Typography>
          </Button>
        </Box>
        <AdicionalChoice
          isAdicionalChoiceOpen={isAdicionalChoiceOpen}
          handleClose={handleCloseAdicionalChoice}
          handleAdicionalChoice={handleAdicionalChoice}
        />
        <ProjectChoiceModal
          handleSaveProjectChoiceAdicional={handleSaveProjectChoiceAdicional}
          projectChoiceModalOpen={projectChoiceModalOpen}
          setProjectChoiceModalOpen={setProjectChoiceModalOpen}
          handleChangeAutoComplete={handleChangeAutoComplete}
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
              sx={{
                ...BaseButtonStyles,
                backgroundColor: "darkgreen",
                "&:hover": { backgroundColor: "green" },
              }}
              autoFocus
            >
              Sim
            </Button>
            <Button
              sx={{
                ...BaseButtonStyles,
                backgroundColor: "darkred",
                "&:hover": { backgroundColor: "red" },
              }}
              onClick={handleClose}
              color="secondary"
            >
              Não
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};
OpportunityModal.displayName = "OpportunityModal";
