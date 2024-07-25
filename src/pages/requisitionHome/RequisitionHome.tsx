import RequisitionTable from '../../components/tables/RequisitionTable';
import '../css/RequisitionHome.scss';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import AddRequisitionModal from '../../components/modals/AddRequisitionModal';
import logoUrl from '../../assets/logodolphin.jpg'
import { useContext, useEffect } from 'react';
import { userContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";
const RequisitionHome = () => {
  const {logedIn } = useContext(userContext);
  const navigate = useNavigate();
  useEffect( ( ) => { 
    if(!logedIn) navigate('/')
  })
  const handleNavigateHome = ( ) => { 
    navigate('/home');
  }
  return (
    <>
      <Card
        variant="outlined"
        sx={{ maxWidth: "90vw", padding: "0.5rem", marginX: "auto" }}
      >
        <IconButton onClick={() => handleNavigateHome()}>
          <HomeIcon />
        </IconButton>

        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <img src={logoUrl} alt="logo Dolphin" width={"140px"} />
            <Typography
              variant="h6"
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                color: "#34495e",
              }}
            >
              Requisições de materiais e serviços
            </Typography>
            <Typography sx={{ color: "gray" }}></Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <AddRequisitionModal />
          </Stack>
        </Box>
        <Divider />
        <RequisitionTable />
      </Card>
    </>
  );
}

export default RequisitionHome