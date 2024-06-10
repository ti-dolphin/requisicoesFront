import RequisitionTable from './components/RequisitionTable';
import '../css/RequisitionHome.scss';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import AddRequisitionModal from './components/AddRequisitionModal';


const RequisitionHome = () => {
  return (
    <>
      <Card variant="outlined" sx={{ maxWidth: "90vw", padding:'0.5rem', marginX:'auto' }}>
        <Box sx={{ p: 2, display:'flex',justifyContent:'space-around' }}>
          <Stack spacing={1}>
            <Typography variant="h6">Requisições de materiais e serviços</Typography>
            <Typography sx={{ color: "gray" }}>Projeto 9313</Typography>
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