import { Box, IconButton, Stack, Typography } from "@mui/material";
import OpportunityInfoTable from "../components/OpportunityInfoTable";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/logodolphin.jpg";

const CrmHome = () => {
    const navigate = useNavigate();
  return (
    <Box height="95vh">
      <Box padding={2}>
        <Stack direction="row" flexWrap="wrap" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/home")}>
            <ArrowLeftIcon />
          </IconButton>
          <img src={logoUrl} width="120px" />
          <Typography color="#2B3990" variant="h6" fontFamily="Roboto">
            Controle de Propostas e Oportunidades
          </Typography>
        </Stack>
      </Box>

        <OpportunityInfoTable />

    </Box>
  );
};
export default CrmHome;

