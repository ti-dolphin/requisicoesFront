import { Box, IconButton, Stack, Typography } from "@mui/material";
import PatrimonyInfoTable from "../../components/tables/PatrimonyInfoTable";
import logoUrl from '../../assets/logodolphin.jpg';
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import React from "react";

const PatrimonyHome = React.memo(() => {
  console.log("renderizou PatrimonyHome");
  // Memoiza a verificação de largura da janela
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100vh">
      <Box padding={1} height="5%">
        <Stack direction="row" flexWrap="wrap" alignItems="center">
          <IconButton onClick={() => navigate("/home")}>
            <ArrowLeftIcon />
          </IconButton>
          {!isMobile && <img src={logoUrl} width="120px" alt="Logo" />}
          <Typography color="#2B3990" variant="h6">
            Controle de Patrimônios
          </Typography>
        </Stack>
      </Box>
      <PatrimonyInfoTable />
    </Box>
  );
});

export default PatrimonyHome;
