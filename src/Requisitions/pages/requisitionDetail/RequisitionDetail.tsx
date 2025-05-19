import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "../../components/Stepper/Stepper";
import {
  Alert,
  AlertColor,
  Autocomplete,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { Requisition, fetchRequsitionById, updateRequisition } from "../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { RequisitionContext } from "../../context/RequisitionContext";
import { useContext } from "react";
import { userContext } from "../../context/userContext";
import RequisitionFields from "../../components/RequisitionFields/RequisitionFields";
import styles from "./RequisitionDetail.styles";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable/RequisitionItemsTable";
import { AlertInterface } from "../../types";
import RequisitionStatusHistory from "../../components/RequisitionStatusHistory/RequisitionStatusHistory";

import {
  Modal,
  Paper,
  FormControl,
} from "@mui/material";
import { BaseButtonStyles } from "../../../utilStyles";
import { red } from "@mui/material/colors";

const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [requisitionData, setRequisitionData] =
    useState<Requisition>();
  const { refreshRequisition, toggleRefreshRequisition } = useContext(RequisitionContext);
  const [alert, setAlert] = useState<AlertInterface>();
  const { logedIn } = useContext(userContext);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const navigate = useNavigate();

  const { user } = useContext(userContext);

  const fetchRequisitionData = async () => {
    console.log("fetchRequisitionData");
    try {
      if (id) {
        const requisition = await fetchRequsitionById(Number(id));
        console.log("requisition", requisition);
        setRequisitionData(requisition);
        setSelectedProject(requisition?.ID_PROJETO || null);
      }
    } catch (error) {
      console.error("Error fetching requisition data:", error);
      displayAlert("error", "Falha ao busar os dados da requisição");
    }
  };

  const handleOpenProjectModal = () => {
    setSelectedProject(requisitionData?.ID_PROJETO || null);
    setIsProjectModalOpen(true);
  };
  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleConfirmProject = () => {
    if (selectedProject && requisitionData) {
       handleSave();
    }
    setIsProjectModalOpen(false);
  };

  const handleNavigateHome = () => {
    navigate("/requisitions");
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };
  const handleSave = async () => {
    if (requisitionData && user) {
      try {
        const response = await updateRequisition(
          user?.CODPESSOA,
          requisitionData
        );
        if (response.status === 200) {
          displayAlert("success", "Requisição atualizada com sucesso!");
        }
        toggleRefreshRequisition();
      } catch (e: any) {
        displayAlert("warning", e.message);
      }
    }
  };

  const shouldProjectButtonBeDisabled = (): boolean => {
    if (!requisitionData || !requisitionData.status || !user) return false;
    const isInitialStep = requisitionData.status.etapa === 0;
    const isAdmin = user.PERM_ADMINISTRADOR && user.PERM_ADMINISTRADOR > 0;
    const isResponsible =
      user.CODPESSOA > 0 &&
      user.CODPESSOA === requisitionData.responsavel_pessoa?.CODPESSOA;
    console.log(
      "aparecer botao do projeto: ",
      isInitialStep && (isAdmin || isResponsible)
    );
    return !isInitialStep || (!isAdmin || !isResponsible);
  };

  useEffect(() => {
    if (!logedIn) navigate("/");
  });

  useEffect(() => {
    fetchRequisitionData();
  }, [refreshRequisition]);

  return (
    <Box sx={styles.requisitionPageContainer}>
      <Box className="req-page-header" sx={styles.requisitionPageHeader}>
        <IconButton onClick={() => handleNavigateHome()}>
          <ArrowCircleLeftIcon />
        </IconButton>
        <Typography
          sx={{
            fontSize: {
              xs: "12px",
              md: "16px",
            },
          }}
        >
          Nº {requisitionData?.ID_REQUISICAO} | {requisitionData?.DESCRIPTION} |
        </Typography>
        <Button 
         onClick={handleOpenProjectModal}
         disabled={shouldProjectButtonBeDisabled()}
       
         >
          Projeto: {requisitionData?.projeto_descricao?.DESCRICAO}
        </Button>
      </Box>
      <Box className="stepper-container" sx={styles.requisitionStepper}>
        {alert && (
          <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>
        )}
        {requisitionData && (
          <HorizontalLinearStepper
            requisitionData={requisitionData}
            setRequisitionData={setRequisitionData}
          />
        )}
      </Box>
      <Stack
        className="requsition-content"
        direction="column"
        sx={{
          padding: 1,
          gap: 1,
          width: "100%",
          border: "1px solid lightgray",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 1,
          }}
        >
          <RequisitionFields />

          {requisitionData && (
            <RequisitionStatusHistory
              requisitionId={requisitionData?.ID_REQUISICAO}
            />
          )}
        </Box>
        <Box
          className="req-items-table-container"
          sx={styles.requisitionItemsTableContainer}
        >
          <RequisitionItemsTable
            requisitionStatus={requisitionData?.status}
            requisitionData={requisitionData}
            requisitionId={Number(id)}
          />
        </Box>
      </Stack>
      <Modal
        open={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        aria-labelledby="select-project-modal-title"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper sx={{ width: 350, p: 3, borderRadius: 2, textAlign: "center" }}>
          <Typography
            id="select-project-modal-title"
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Selecionar Projeto
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="select-project-autocomplete"
              options={requisitionData?.projectOptions || []}
              getOptionLabel={(option: any) => option.label || ""}
              value={
              requisitionData?.projectOptions?.find(
                (proj: any) => proj.ID_PROJETO === selectedProject
              ) || null
              }
              onChange={(_, newValue) => {
              setSelectedProject(newValue ? newValue.id : null);
              if (requisitionData) {
                setRequisitionData({
                  ...requisitionData,
                  ID_PROJETO: newValue ? newValue.id || 0 : 0,
                  ID_REQUISICAO: requisitionData.ID_REQUISICAO // ensure required field is present
                });
              }
              }}
              renderInput={(params) => (
              <TextField
                {...params}
                label="Projeto"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
              )}
              isOptionEqualToValue={(option, value) =>
              option.id === value.id
              }
            />
          </FormControl>
          <Stack direction="row" gap={2} justifyContent="center">
            <Button
              sx={{...BaseButtonStyles}}
              onClick={handleConfirmProject}
              disabled={!selectedProject}
            >
              Confirmar
            </Button>
            <Button 
             sx={{...BaseButtonStyles, backgroundColor: red[700], "&:hover": { 
              backgroundColor: red[500], 
             }}}
             onClick={handleCloseProjectModal}>
              Cancelar
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
};

export default RequisitionDetail;
