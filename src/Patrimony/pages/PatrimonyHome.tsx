import { Box, Stack, Typography } from "@mui/material";
import PatrimonyInfoTable from "../components/tables/PatrimonyInfoTable";
import logoUrl from '../assets/logodolphin.jpg';
import { PatrimonyInfoContextProvider } from "../context/patrimonyInfoContext";

const PatrimonyHome = () => {
  return (
    <Box border="1px solid #eeeeee" padding={1} height="95vh">
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <img src={logoUrl} width="120px" />
          <Typography color="#757a79" variant="h6">
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
