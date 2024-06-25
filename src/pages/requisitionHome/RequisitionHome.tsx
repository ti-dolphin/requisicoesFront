import RequisitionTable from '../../components/tables/RequisitionTable';
import '../css/RequisitionHome.scss';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import AddRequisitionModal from '../../components/modals/AddRequisitionModal';
import { useState } from 'react';


const RequisitionHome = () => {

  const [ isCreating, setIsCreating ] = useState<boolean>(false);
  return (
    <>
      <Card variant="outlined" sx={{ maxWidth: "90vw", padding:'0.5rem', marginX:'auto' }}>
        <Box sx={{ p: 2, display:'flex',justifyContent:'space-between' }}>
          <Stack spacing={2} direction="row" alignItems='center' sx={{ backgroundColor: '#e7eaf6', borderRadius: '5px'}}>
            <img src="/src/assets/logodolphin.jpg" alt="logo Dolphin" width={'140px'}/>
            <Typography variant="h6" sx={{ color: '#34495e'}}>Requisições de materiais e serviços</Typography>
            <Typography sx={{ color: "gray" }}></Typography>
            
          </Stack>
         <Stack direction="row" spacing={2}>
           <AddRequisitionModal
              isCreating={isCreating}
              setIsCreating={setIsCreating}
           />
         </Stack>
        </Box>
        <Divider />
        <RequisitionTable 
        isCreating={isCreating}
        />
      </Card>
    </>
  );
}

export default RequisitionHome