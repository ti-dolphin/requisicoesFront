import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "../../components/Stepper/Stepper";
import { Alert, AlertColor, IconButton, Stack, Typography } from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import {
  Requisition,
  fetchRequsitionById,
} from "../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { RequisitionContext } from "../../context/RequisitionContext";
import { useContext } from "react";
import { userContext } from "../../context/userContext";
import RequisitionFields from "../../components/RequisitionFields/RequisitionFields";
import styles from "./RequisitionDetail.styles";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable/RequisitionItemsTable";
import { AlertInterface } from "../../types";

const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const { refreshRequisition } = useContext(RequisitionContext);
  const [alert, setAlert] = useState<AlertInterface>();
  const { logedIn } = useContext(userContext);
  const navigate = useNavigate();

  const fetchRequisitionData = async () => {
      try {
        if (id) {
          const requisition = await fetchRequsitionById(Number(id));
          console.log('status: ', requisition)
          setRequisitionData(requisition);
        }
      } catch (error) {
        console.error("Error fetching requisition data:", error);
        displayAlert("error", "Falha ao busar os dados da requisição");
      }
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
          Projeto: {requisitionData?.projeto_descricao?.DESCRICAO}
        </Typography>
      </Box>
      <Box className="stepper-container" sx={styles.requisitionStepper}>
        {alert && <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>}
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
        <RequisitionFields />
        <Box
          className="req-items-table-container"
          sx={styles.requisitionItemsTableContainer}
        >
          <RequisitionItemsTable
            requisitionStatus={requisitionData?.status}
            requisitionId={Number(id)}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default RequisitionDetail;
