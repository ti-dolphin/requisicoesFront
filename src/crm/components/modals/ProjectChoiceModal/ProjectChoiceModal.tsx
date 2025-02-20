import { Modal, Box, Typography, Autocomplete, TextField, Button, AutocompleteChangeDetails, AutocompleteChangeReason, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react'
import { OpportunityOptionField } from '../../../types';
import CloseIcon from "@mui/icons-material/Close";
import { fetchAllProjects, Project } from '../../../../Requisitions/utils';
import typographyStyles from '../../../../Requisitions/utilStyles';
import { BaseButtonStyles } from '../../../../utilStyles';

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
  setProjectChoiceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const ProjectChoiceModal = ({
  handleSaveProjectChoiceAdicional,
  projectChoiceModalOpen,
  handleChangeAutoComplete,
  setProjectChoiceModalOpen

}: ProjectChoiceModalProps) => {
    const [projectOptions, setProjectOptions] = useState<
      OpportunityOptionField[]
    >([]);

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

  useEffect(() => { 
      fetchProjectsOps();
  }, []);

  const renderOptions = (column: {
         label: string;
         dataKey: string;
         autoComplete?: boolean;
       }) => {
         if (column.dataKey === "idProjeto") return projectOptions;
       };
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
          width: {
            xs: '90%',
            md: "40%",
            lg: "25%"
          },
        
          bgcolor: "background.paper",
          boxShadow: 24,
          height: 300,
          overFlow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 1,
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
        <Typography sx={typographyStyles.heading2}>Escolha o projeto</Typography>
        <Autocomplete
          disablePortal
          onChange={handleChangeAutoComplete}
          fullWidth
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
        <Button sx={BaseButtonStyles} onClick={handleSaveProjectChoiceAdicional}>
          Salvar
        </Button>
      </Box>
    </Modal>
  );
};
ProjectChoiceModal.displayName = "ProjectChoiceModal";
export default ProjectChoiceModal