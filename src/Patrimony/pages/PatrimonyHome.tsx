import { Box, IconButton, Stack, Typography } from "@mui/material";
import PatrimonyInfoTable from "../components/tables/PatrimonyInfoTable";
import logoUrl from '../assets/logodolphin.jpg';
import { PatrimonyInfoContextProvider } from "../context/patrimonyInfoContext";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate } from "react-router-dom";

const PatrimonyHome = () => {
  const navigate= useNavigate();
  return (
    <Box border="1px solid #eeeeee" padding={1} height="95vh">
      <Box>
        <Stack direction="row" flexWrap="wrap" spacing={1} alignItems="center">
          <IconButton onClick={() => navigate("/home")}>
            <ArrowLeftIcon />
          </IconButton>
          <img src={logoUrl} width="120px" />
          <Typography color="#2B3990" variant="h6">
            Controle de Patrimônios
          </Typography>
        </Stack>
      </Box>
      <PatrimonyInfoContextProvider>
        <PatrimonyInfoTable />
      </PatrimonyInfoContextProvider>
    </Box>
  );
};

export default PatrimonyHome;
