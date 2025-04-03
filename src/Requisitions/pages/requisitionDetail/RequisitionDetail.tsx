import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "../../components/Stepper/Stepper";
import {
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import {
  Item,
  Requisition,
  fetchPersonById,
  fetchRequsitionById,
} from "../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { RequisitionContext } from "../../context/RequisitionContext";
import { useContext } from "react";
import { userContext } from "../../context/userContext";
import RequisitionFields from "../../components/RequisitionFields/RequisitionFields";
import styles from "./RequisitionDetail.styles";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable/RequisitionItemsTable";

const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  console.log(setRequisitionItems)
  const { refreshRequisition } = useContext(RequisitionContext);
  const { logedIn } = useContext(userContext);
  const navigate = useNavigate();
  const fetchRequisitionData = async () => {
    const data = await fetchRequsitionById(Number(id));
    if (data) {
      const personData = await fetchPersonById(data.ID_RESPONSAVEL);
      if (personData) {
        setRequisitionData({ ...data, ["RESPONSAVEL"]: personData?.NOME });
      }
    }
  };

  useEffect(() => {
    if (!logedIn) navigate("/");
  });

  useEffect(() => {
    fetchRequisitionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshRequisition]);

  const handleNavigateHome = () => {
    navigate("/requisitions");
  };

  return (
    <Box
      sx={styles.requisitionPageContainer}
    >
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
          Projeto {requisitionData?.DESCRICAO}
        </Typography>
      </Box>
      <Box className="stepper-container" sx={styles.requisitionStepper}>
        {requisitionData && (
          <HorizontalLinearStepper
            items={requisitionItems}
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
          width: '100%',
          border: '1px solid lightgray'
         }}
      >
        <RequisitionFields />
        <Box
        className="req-items-table-container"
        sx={styles.requisitionItemsTableContainer}
        >
          <RequisitionItemsTable
          requisitionStatus={requisitionData?.STATUS}
          requisitionId={Number(id)}/>
        </Box>
      </Stack>
    </Box>
  );
};

export default RequisitionDetail;
