import { Modal, Box, Typography, Autocomplete, TextField, Button, AutocompleteChangeDetails, AutocompleteChangeReason, IconButton } from '@mui/material';
import React from 'react'
import { OpportunityOptionField } from '../../../types';
import CloseIcon from "@mui/icons-material/Close";

interface ProjectChoiceModalProps {
  handleSaveProjectChoiceAdicional: () => Promise<void>;
  projectChoiceModalOpen: boolean;
  handleChangeAutoComplete: (
    _event: React.SyntheticEvent<Element, Event>,
    value: OpportunityOptionField | null,
    _reason: AutocompleteChangeReason,
    _details?:
      | AutocompleteChangeDetails<{
        label: string;
        id: number;
        object: string;
      }>
      | undefined
  ) => void;
  renderOptions: (column: {
    label: string;
    dataKey: string;
    autoComplete?: boolean;
  }) => OpportunityOptionField[] | undefined;
  setProjectChoiceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const ProjectChoiceModal = ({
  handleSaveProjectChoiceAdicional,
  projectChoiceModalOpen,
  handleChangeAutoComplete,
  renderOptions,
  setProjectChoiceModalOpen

}: ProjectChoiceModalProps) => {
  return (
    <Modal
      open={projectChoiceModalOpen}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          height: "20%",
          overFlow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 2,
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
          }}
          onClick={() => setProjectChoiceModalOpen(false)}
        >
          <CloseIcon />
        </IconButton>{" "}
        <Typography>Escolha o projeto</Typography>
        <Autocomplete
          disablePortal
          onChange={handleChangeAutoComplete}
          options={
            renderOptions({
              label: "Nº Projeto",
              dataKey: "idProjeto",
              autoComplete: true,
            }) || []
          }
          getOptionKey={(option: OpportunityOptionField) => option.key}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                {
                  label: "Nº Projeto",
                  dataKey: "idProjeto",
                  autoComplete: true,
                }.label
              }
            />
          )}
        />
        <Button variant="outlined" onClick={handleSaveProjectChoiceAdicional}>
          Salvar
        </Button>
      </Box>
    </Modal>
  );
};
ProjectChoiceModal.displayName = "ProjectChoiceModal";
export default ProjectChoiceModal